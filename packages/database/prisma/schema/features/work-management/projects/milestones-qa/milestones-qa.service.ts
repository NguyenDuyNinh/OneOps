import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { ActorContext } from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  MILESTONE_MOVES,
  acceptanceItemSchema,
  acceptanceResultSchema,
  createAcceptanceSchema,
  createMilestoneSchema,
  milestoneSchema,
  milestoneTaskSchema,
  qaGateSchema,
  resultInput,
  updateAcceptanceSchema,
  updateMilestoneSchema,
} from "./dto/milestones-qa.dto.js";
import type {
  AcceptanceInput,
  AcceptanceItemDto,
  MilestoneDto,
  MilestoneInput,
  MilestoneListQuery,
  MilestoneStatus,
  MilestoneTaskDto,
  QaGate,
  ResultInput,
} from "./dto/milestones-qa.dto.js";
import { MilestonesQaRepository } from "./milestones-qa.repository.js";
import type {
  AcceptanceItemRow,
  AcceptanceResultRow,
  MilestoneRow,
} from "./milestones-qa.repository.js";
import {
  QA_TASK_REF,
  type QaTaskRefPort,
  type QaTaskSnapshot,
} from "./qa-task.port.js";

/** Everything milestones and QA need; the repository keeps the queries. */
@Injectable()
export class MilestonesQaService {
  constructor(
    private readonly repository: MilestonesQaRepository,
    @Inject(QA_TASK_REF) private readonly tasks: QaTaskRefPort,
  ) {}

  rules() {
    return {
      statuses: Object.keys(MILESTONE_MOVES),
      moves: MILESTONE_MOVES,
      outcomes: ["PASS", "FAIL", "BLOCKED"],
    };
  }

  async list(query: MilestoneListQuery) {
    const page = await this.repository.list(query);
    const taskIds = [...new Set(page.links.map((link) => link.taskId))];
    const snapshots = await this.snapshots(taskIds);
    const grouped = new Map<string, string[]>();
    for (const link of page.links) {
      const list = grouped.get(link.milestoneId) ?? [];
      list.push(link.taskId);
      grouped.set(link.milestoneId, list);
    }
    return {
      items: page.rows.map((row) =>
        this.milestoneDto(row, grouped.get(row.id) ?? [], snapshots),
      ),
      total: page.total,
      page: page.page,
      pageSize: page.pageSize,
    };
  }

  async get(id: string) {
    const row = await this.repository.get(id);
    const links = await this.repository.linksOf(id);
    const snapshots = await this.snapshots(links.map((link) => link.taskId));
    return {
      ...this.milestoneDto(
        row,
        links.map((link) => link.taskId),
        snapshots,
      ),
      items: links.flatMap((link) => {
        const task = snapshots.get(link.taskId);
        if (!task) return [];
        return [
          milestoneTaskSchema.parse({
            taskId: task.id,
            code: task.code,
            name: task.name,
            status: task.status,
            completed: task.status === "Hoàn thành",
          }) satisfies MilestoneTaskDto,
        ];
      }),
    };
  }

  async create(rawInput: MilestoneInput) {
    const input = new SchemaPipe(createMilestoneSchema).transform(rawInput);
    if (input.status !== "PLANNED" && input.status !== "IN_PROGRESS")
      throw new BadRequestException(
        "Mốc mới chỉ có thể bắt đầu ở trạng thái PLANNED hoặc IN_PROGRESS.",
      );
    const row = await this.repository.create(input);
    return this.milestoneDto(row, [], new Map());
  }

  async update(id: string, rawInput: unknown) {
    const patch = new SchemaPipe(updateMilestoneSchema).transform(rawInput);
    const current = await this.repository.get(id);
    if (patch.status && patch.status !== this.effectiveStatus(current)) {
      const allowed = MILESTONE_MOVES[this.effectiveStatus(current)];
      if (!allowed.includes(patch.status))
        throw new ConflictException(
          `Không thể chuyển mốc từ ${this.effectiveStatus(current)} sang ${patch.status}.`,
        );
    }
    const row = await this.repository.update(id, patch);
    const links = await this.repository.linksOf(id);
    return this.milestoneDto(
      row,
      links.map((link) => link.taskId),
      await this.snapshots(links.map((link) => link.taskId)),
    );
  }

  async link(milestoneId: string, taskIds: readonly string[]) {
    await this.repository.get(milestoneId);
    const unique = [...new Set(taskIds)];
    const snapshots = await this.snapshots(unique);
    const missing = unique.filter((id) => !snapshots.has(id));
    if (missing.length)
      throw new UnprocessableEntityException(
        "Có công việc không tồn tại trong phân hệ công việc.",
      );
    await this.repository.addLinks(milestoneId, unique);
    return this.get(milestoneId);
  }

  async unlink(milestoneId: string, taskId: string) {
    await this.repository.get(milestoneId);
    await this.repository.removeLink(milestoneId, taskId);
    return this.get(milestoneId);
  }

  async acceptance(taskId: string) {
    const page = await this.repository.listAcceptance(taskId);
    return {
      items: page.items.map((item) =>
        this.acceptanceDto(
          item,
          page.results.find((result) => result.itemId === item.id) ?? null,
          page.counts.find((count) => count.itemId === item.id)?._count._all ??
            0,
        ),
      ),
      gate: this.gateOf(
        page.items.filter((item) => item.mandatory),
        page.results,
      ),
    };
  }

  async createAcceptance(rawInput: AcceptanceInput, actor: ActorContext) {
    const input = new SchemaPipe(createAcceptanceSchema).transform(rawInput);
    await this.assertTask(input.taskId, actor);
    const item = await this.repository.createItem(input);
    return this.acceptanceDto(item, null, 0);
  }

  async updateAcceptance(id: string, rawInput: unknown, actor: ActorContext) {
    const patch = new SchemaPipe(updateAcceptanceSchema).transform(rawInput);
    const item = await this.repository.getItem(id);
    await this.assertTask(item.taskId, actor);
    const updated = await this.repository.updateItem(id, patch);
    const results = await this.repository.resultsOf(id);
    return this.acceptanceDto(updated, results[0] ?? null, results.length);
  }

  async removeAcceptance(id: string, version: number, actor: ActorContext) {
    const item = await this.repository.getItem(id);
    await this.assertTask(item.taskId, actor);
    return this.repository.removeItem(id, version);
  }

  async results(itemId: string) {
    await this.repository.getItem(itemId);
    return {
      items: (await this.repository.resultsOf(itemId)).map((row) =>
        this.resultDto(row),
      ),
    };
  }

  async recordResult(
    itemId: string,
    rawInput: ResultInput,
    actor: ActorContext,
  ) {
    const input = new SchemaPipe(resultInput).transform(rawInput);
    const item = await this.repository.getItem(itemId);
    const task = await this.taskOf(item.taskId);
    const reviewer = this.matches(task.reviewer, actor);
    if (!reviewer && !this.isManager(actor))
      throw new ForbiddenException(
        "Chỉ Người kiểm tra của công việc hoặc Quản lý được ghi kết quả kiểm tra.",
      );
    const row = await this.repository.recordResult({
      itemId,
      outcome: input.outcome,
      note: input.note,
      evidence: input.evidence,
      testedByAccountId: actor.accountId,
      testedByName: actor.displayName,
      // A manager that is not the assigned reviewer records the decision explicitly.
      isOverride: this.isManager(actor) && !reviewer,
    });
    return this.resultDto(row);
  }

  /** Completion precondition consumed by the task workflow through the QA gate port. */
  async gate(taskId: string): Promise<QaGate> {
    const { items, latest } = await this.repository.gateItems(taskId);
    return this.gateOf(items, [...latest.values()]);
  }

  private gateOf(
    items: readonly Pick<AcceptanceItemRow, "id" | "title">[],
    results: readonly Pick<AcceptanceResultRow, "itemId" | "outcome">[],
  ): QaGate {
    const latest = new Map<string, string>();
    for (const result of results)
      if (!latest.has(result.itemId)) latest.set(result.itemId, result.outcome);
    const blocking = items
      .filter((item) => latest.get(item.id) !== "PASS")
      .map((item) => item.title);
    return qaGateSchema.parse({
      required: items.length > 0,
      passed: blocking.length === 0,
      blocking,
    });
  }

  private milestoneDto(
    row: MilestoneRow,
    taskIds: readonly string[],
    snapshots: ReadonlyMap<string, QaTaskSnapshot>,
  ): MilestoneDto {
    const completed = taskIds.filter(
      (id) => snapshots.get(id)?.status === "Hoàn thành",
    ).length;
    return milestoneSchema.parse({
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      description: row.description,
      targetDate: row.targetDate.toISOString().slice(0, 10),
      contractRef: row.contractRef,
      status: this.effectiveStatus(row),
      storedStatus: row.status,
      itemCount: taskIds.length,
      completedCount: completed,
      overdue: this.effectiveStatus(row) === "MISSED",
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  private acceptanceDto(
    item: AcceptanceItemRow,
    latest: AcceptanceResultRow | null,
    resultCount: number,
  ): AcceptanceItemDto {
    return acceptanceItemSchema.parse({
      id: item.id,
      taskId: item.taskId,
      title: item.title,
      steps: item.steps,
      expected: item.expected,
      mandatory: item.mandatory,
      version: item.version,
      latestResult: latest ? this.resultDto(latest) : null,
      resultCount,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    });
  }

  private resultDto(row: AcceptanceResultRow) {
    return acceptanceResultSchema.parse({
      id: row.id,
      itemId: row.itemId,
      outcome: row.outcome,
      note: row.note,
      evidence: row.evidence ?? [],
      testedByName: row.testedByName,
      isOverride: row.isOverride,
      createdAt: row.createdAt.toISOString(),
    });
  }

  /** `MISSED` is derived from the target date and never stored by hand. */
  private effectiveStatus(row: MilestoneRow): MilestoneStatus {
    const stored = row.status as MilestoneStatus;
    if (stored === "COMPLETED" || stored === "CANCELLED" || stored === "MISSED")
      return stored;
    return row.targetDate.toISOString().slice(0, 10) < this.today()
      ? "MISSED"
      : stored;
  }

  private today() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  private async snapshots(taskIds: readonly string[]) {
    if (!taskIds.length) return new Map<string, QaTaskSnapshot>();
    const list = await this.tasks.snapshots(taskIds);
    return new Map(list.map((task) => [task.id, task]));
  }

  private async taskOf(taskId: string) {
    const [task] = await this.tasks.snapshots([taskId]);
    if (!task)
      throw new UnprocessableEntityException(
        "Công việc không tồn tại trong phân hệ công việc.",
      );
    return task;
  }

  private async assertTask(taskId: string, actor: ActorContext) {
    const task = await this.taskOf(taskId);
    if (
      this.isManager(actor) ||
      this.matches(task.reviewer, actor) ||
      this.matches(task.assignee, actor)
    )
      return task;
    throw new ForbiddenException(
      "Chỉ Người phụ trách, Người kiểm tra hoặc Quản lý được quản lý tiêu chí kiểm tra.",
    );
  }

  private isManager(actor: ActorContext) {
    return actor.role === "MANAGER" || actor.isSystemAdmin;
  }

  /** Assignee and reviewer are display names; older rows may hold the employee code. */
  private matches(value: string, actor: ActorContext) {
    const target = value.trim().toLocaleLowerCase("vi");
    if (!target) return false;
    return [actor.displayName, actor.employeeId, actor.accountId].some(
      (candidate) => candidate.trim().toLocaleLowerCase("vi") === target,
    );
  }
}
