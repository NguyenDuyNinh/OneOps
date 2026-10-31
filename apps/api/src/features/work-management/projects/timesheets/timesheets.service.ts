import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { ActorContext } from "../../../../core/auth/actor-context.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import {
  DAY_LIMIT_MINUTES,
  DAY_THRESHOLD_MINUTES,
  WEEK_THRESHOLD_MINUTES,
  adjustmentInput,
  decisionInput,
  entryInput,
  entryPatch,
  entrySchema,
  periodDetailSchema,
  periodSchema,
} from "./dto/timesheets.dto.js";
import type {
  AdjustmentInput,
  DecisionInput,
  EntryInput,
  PeriodDetail,
  PeriodDto,
  PeriodListQuery,
} from "./dto/timesheets.dto.js";
import { TimesheetsRepository } from "./timesheets.repository.js";
import type {
  TimeEntryAdjustmentRow,
  TimeEntryRow,
  TimesheetPeriodRow,
} from "./timesheets.repository.js";
import {
  TIMESHEET_TASK_REF,
  type TimesheetTaskRefPort,
} from "./timesheet-task.port.js";

const DAY = "T00:00:00.000Z";
const EDITABLE = ["OPEN", "REJECTED"];

/** Weekly time capture with threshold approval; separate from attendance. */
@Injectable()
export class TimesheetsService {
  constructor(
    private readonly repository: TimesheetsRepository,
    @Inject(TIMESHEET_TASK_REF) private readonly tasks: TimesheetTaskRefPort,
  ) {}

  rules() {
    return {
      statuses: ["OPEN", "SUBMITTED", "APPROVED", "REJECTED"],
      minuteStep: 15,
      dayLimitMinutes: DAY_LIMIT_MINUTES,
      dayThresholdMinutes: DAY_THRESHOLD_MINUTES,
      weekThresholdMinutes: WEEK_THRESHOLD_MINUTES,
    };
  }

  async list(query: PeriodListQuery, actor: ActorContext) {
    const scoped = this.isManager(actor)
      ? query
      : { ...query, employeeId: this.employeeOf(actor) };
    const page = await this.repository.list(scoped);
    return {
      items: page.items.map((row) => this.periodDto(row)),
      total: page.total,
      page: page.page,
      pageSize: page.pageSize,
    };
  }

  /** Opens (or returns) the period of a week; calling it twice creates nothing new. */
  async open(weekStart: string | undefined, actor: ActorContext) {
    const employeeId = this.employeeOf(actor);
    const start = this.mondayOf(weekStart ?? this.today());
    const end = this.shift(start, 6);
    const existing = await this.repository.findByWeek(employeeId, start);
    const row =
      existing ??
      (await this.repository.createPeriod({
        employeeId,
        employeeName: actor.displayName,
        weekStart: start,
        weekEnd: end,
      }));
    return this.detail(row);
  }

  async get(id: string, actor: ActorContext) {
    const period = await this.repository.get(id);
    this.assertScope(period, actor);
    return this.detail(period);
  }

  async addEntry(
    periodId: string,
    rawInput: EntryInput,
    actor: ActorContext,
    requestKey: string | null,
  ) {
    const input = new SchemaPipe(entryInput).transform(rawInput);
    const period = await this.repository.get(periodId);
    this.assertOwner(period, actor);
    this.assertEditable(period);
    if (requestKey) {
      const replay = await this.repository.entryByKey(requestKey);
      if (replay) return this.detail(await this.repository.get(periodId));
    }
    this.assertMinuteStep(input.minutes);
    this.assertInsideWeek(period, input.workDate);
    await this.assertTask(input.taskId, actor);
    const entries = await this.repository.entries(periodId);
    const dayTotal = entries
      .filter((entry) => this.dateOf(entry.workDate) === input.workDate)
      .reduce((sum, entry) => sum + entry.minutes, 0);
    this.assertDailyLimit(dayTotal + input.minutes, input.note);
    await this.repository.createEntry({
      periodId,
      employeeId: period.employeeId,
      workDate: input.workDate,
      minutes: input.minutes,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      note: input.note,
      billable: input.billable,
      requestKey,
    });
    return this.refresh(period);
  }

  async updateEntry(
    periodId: string,
    entryId: string,
    rawInput: unknown,
    actor: ActorContext,
  ) {
    const patch = new SchemaPipe(entryPatch).transform(rawInput);
    const period = await this.repository.get(periodId);
    this.assertOwner(period, actor);
    this.assertEditable(period);
    const entry = await this.repository.getEntry(entryId);
    if (entry.periodId !== periodId)
      throw new UnprocessableEntityException(
        "Dòng thời gian không thuộc kỳ timesheet này.",
      );
    if (patch.minutes !== undefined) this.assertMinuteStep(patch.minutes);
    const workDate = patch.workDate ?? this.dateOf(entry.workDate);
    this.assertInsideWeek(period, workDate);
    await this.assertTask(patch.taskId ?? undefined, actor);
    const entries = await this.repository.entries(periodId);
    const dayTotal = entries
      .filter(
        (row) => row.id !== entryId && this.dateOf(row.workDate) === workDate,
      )
      .reduce((sum, row) => sum + row.minutes, 0);
    this.assertDailyLimit(
      dayTotal + (patch.minutes ?? entry.minutes),
      patch.note ?? entry.note,
    );
    await this.repository.updateEntry(entryId, patch);
    return this.refresh(period);
  }

  async removeEntry(
    periodId: string,
    entryId: string,
    version: number,
    actor: ActorContext,
  ) {
    const period = await this.repository.get(periodId);
    this.assertOwner(period, actor);
    this.assertEditable(period);
    const entry = await this.repository.getEntry(entryId);
    if (entry.periodId !== periodId)
      throw new UnprocessableEntityException(
        "Dòng thời gian không thuộc kỳ timesheet này.",
      );
    await this.repository.removeEntry(entryId, version);
    return this.refresh(period);
  }

  /** Weeks inside the thresholds are approved immediately; the rest wait for a Manager. */
  async submit(periodId: string, actor: ActorContext) {
    const period = await this.repository.get(periodId);
    this.assertOwner(period, actor);
    if (period.status === "SUBMITTED" || period.status === "APPROVED")
      return this.detail(period);
    if (!EDITABLE.includes(period.status))
      throw new ConflictException("Kỳ timesheet không thể gửi duyệt.");
    const entries = await this.repository.entries(periodId);
    if (!entries.length)
      throw new UnprocessableEntityException(
        "Cần ít nhất một dòng thời gian trước khi gửi duyệt.",
      );
    const total = await this.repository.total(periodId);
    const overThreshold =
      total > WEEK_THRESHOLD_MINUTES ||
      this.dailyTotals(entries).some(
        (minutes) => minutes > DAY_THRESHOLD_MINUTES,
      );
    const now = new Date();
    const updated = await this.repository.updatePeriod(periodId, {
      version: period.version,
      status: overThreshold ? "SUBMITTED" : "APPROVED",
      totalMinutes: total,
      overThreshold,
      submittedAt: now,
      ...(overThreshold
        ? {}
        : {
            decidedAt: now,
            decidedByName: "Hệ thống",
            decisionNote: "Tự động duyệt: tuần không vượt ngưỡng.",
          }),
    });
    return this.detail(updated);
  }

  async decide(periodId: string, rawInput: DecisionInput, actor: ActorContext) {
    const input = new SchemaPipe(decisionInput).transform(rawInput);
    if (!this.isManager(actor))
      throw new ForbiddenException("Chỉ Quản lý được duyệt timesheet.");
    const period = await this.repository.get(periodId);
    if (period.status !== "SUBMITTED")
      throw new ConflictException("Kỳ timesheet không ở trạng thái chờ duyệt.");
    if (period.employeeId === actor.employeeId)
      throw new ForbiddenException("Không tự duyệt timesheet của chính mình.");
    if (input.decision === "REJECT" && !input.note)
      throw new UnprocessableEntityException(
        "Từ chối timesheet bắt buộc nhập lý do.",
      );
    const total = await this.repository.total(periodId);
    const updated = await this.repository.updatePeriod(periodId, {
      version: period.version,
      status: input.decision === "APPROVE" ? "APPROVED" : "REJECTED",
      totalMinutes: total,
      decidedAt: new Date(),
      decidedByName: actor.displayName,
      decisionNote: input.note,
    });
    return this.detail(updated);
  }

  /** Corrections after approval append a row; the original entry is never edited. */
  async adjust(
    entryId: string,
    rawInput: AdjustmentInput,
    actor: ActorContext,
  ) {
    const input = new SchemaPipe(adjustmentInput).transform(rawInput);
    if (!this.isManager(actor))
      throw new ForbiddenException(
        "Chỉ Quản lý được điều chỉnh timesheet đã duyệt.",
      );
    const entry = await this.repository.getEntry(entryId);
    const period = await this.repository.get(entry.periodId);
    if (period.status !== "APPROVED")
      throw new ConflictException(
        "Chỉ điều chỉnh được kỳ đã duyệt; kỳ đang mở hãy sửa trực tiếp.",
      );
    await this.repository.createAdjustment({
      entryId,
      periodId: period.id,
      deltaMinutes: input.deltaMinutes,
      note: input.note,
      adjustedById: actor.accountId,
      adjustedByName: actor.displayName,
    });
    const total = await this.repository.total(period.id);
    await this.repository.updatePeriod(period.id, {
      version: period.version,
      totalMinutes: total,
    });
    return this.detail(await this.repository.get(period.id));
  }

  private async refresh(period: TimesheetPeriodRow) {
    const entries = await this.repository.entries(period.id);
    const total = await this.repository.total(period.id);
    const overThreshold =
      total > WEEK_THRESHOLD_MINUTES ||
      this.dailyTotals(entries).some(
        (minutes) => minutes > DAY_THRESHOLD_MINUTES,
      );
    const updated = await this.repository.updatePeriod(period.id, {
      version: period.version,
      totalMinutes: total,
      overThreshold,
    });
    return this.detail(updated);
  }

  private async detail(period: TimesheetPeriodRow): Promise<PeriodDetail> {
    const [entries, adjustments] = await Promise.all([
      this.repository.entries(period.id),
      this.repository.adjustments(period.id),
    ]);
    return periodDetailSchema.parse({
      ...this.periodDto(period),
      entries: entries.map((entry) => this.entryDto(entry)),
      adjustments: adjustments.map((row) => this.adjustmentDto(row)),
    });
  }

  private periodDto(row: TimesheetPeriodRow): PeriodDto {
    return periodSchema.parse({
      id: row.id,
      employeeId: row.employeeId,
      employeeName: row.employeeName,
      weekStart: this.dateOf(row.weekStart),
      weekEnd: this.dateOf(row.weekEnd),
      status: row.status,
      totalMinutes: row.totalMinutes,
      overThreshold: row.overThreshold,
      submittedAt: row.submittedAt?.toISOString() ?? null,
      decidedAt: row.decidedAt?.toISOString() ?? null,
      decidedByName: row.decidedByName,
      decisionNote: row.decisionNote,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  private entryDto(row: TimeEntryRow) {
    return entrySchema.parse({
      id: row.id,
      periodId: row.periodId,
      employeeId: row.employeeId,
      projectId: row.projectId,
      taskId: row.taskId,
      workDate: this.dateOf(row.workDate),
      minutes: row.minutes,
      note: row.note,
      billable: row.billable,
      status: row.status,
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    });
  }

  private adjustmentDto(row: TimeEntryAdjustmentRow) {
    return {
      id: row.id,
      entryId: row.entryId,
      periodId: row.periodId,
      deltaMinutes: row.deltaMinutes,
      note: row.note,
      adjustedByName: row.adjustedByName,
      createdAt: row.createdAt.toISOString(),
    };
  }

  private async assertTask(taskId: string | undefined, actor: ActorContext) {
    if (!taskId) return;
    const task = await this.tasks.snapshot(taskId);
    if (!task)
      throw new UnprocessableEntityException(
        "Công việc không tồn tại trong phân hệ công việc.",
      );
    if (this.isManager(actor)) return;
    if (
      this.matches(task.assignee, actor) ||
      this.matches(task.reviewer, actor)
    )
      return;
    throw new UnprocessableEntityException(
      "Bạn không phải Người phụ trách hoặc Người kiểm tra của công việc này.",
    );
  }

  private assertDailyLimit(total: number, note: string) {
    if (total > DAY_LIMIT_MINUTES)
      throw new UnprocessableEntityException(
        `Tổng thời gian một ngày không được vượt ${DAY_LIMIT_MINUTES / 60} giờ.`,
      );
    if (total > DAY_THRESHOLD_MINUTES && !note.trim())
      throw new UnprocessableEntityException(
        `Vượt ${DAY_THRESHOLD_MINUTES / 60} giờ một ngày cần ghi lý do.`,
      );
  }

  private assertMinuteStep(minutes: number) {
    if (minutes % 15 !== 0)
      throw new UnprocessableEntityException(
        "Thời gian phải là bội số của 15 phút.",
      );
  }

  private assertInsideWeek(period: TimesheetPeriodRow, workDate: string) {
    const start = this.dateOf(period.weekStart);
    const end = this.dateOf(period.weekEnd);
    if (workDate < start || workDate > end)
      throw new UnprocessableEntityException(
        `Ngày ghi thời gian phải nằm trong tuần ${start} đến ${end}.`,
      );
  }

  private assertEditable(period: TimesheetPeriodRow) {
    if (EDITABLE.includes(period.status)) return;
    throw new ConflictException(
      period.status === "SUBMITTED"
        ? "Kỳ đang chờ duyệt nên không thể sửa trực tiếp."
        : "Kỳ đã duyệt nên không thể sửa trực tiếp. Hãy tạo điều chỉnh.",
    );
  }

  private assertOwner(period: TimesheetPeriodRow, actor: ActorContext) {
    if (period.employeeId === actor.employeeId) return;
    if (this.isManager(actor)) return;
    throw new ForbiddenException("Bạn không sở hữu kỳ timesheet này.");
  }

  private assertScope(period: TimesheetPeriodRow, actor: ActorContext) {
    if (period.employeeId === actor.employeeId || this.isManager(actor)) return;
    throw new ForbiddenException("Bạn không có quyền xem kỳ timesheet này.");
  }

  private employeeOf(actor: ActorContext) {
    const employeeId = actor.employeeId.trim();
    if (!employeeId)
      throw new UnprocessableEntityException(
        "Tài khoản chưa được gắn mã nhân viên nên chưa dùng được timesheet.",
      );
    return employeeId;
  }

  private isManager(actor: ActorContext) {
    return actor.role === "MANAGER" || actor.isSystemAdmin;
  }

  private matches(value: string, actor: ActorContext) {
    const target = value.trim().toLocaleLowerCase("vi");
    if (!target) return false;
    return [actor.displayName, actor.employeeId, actor.accountId].some(
      (candidate) => candidate.trim().toLocaleLowerCase("vi") === target,
    );
  }

  private dailyTotals(entries: readonly TimeEntryRow[]) {
    const totals = new Map<string, number>();
    for (const entry of entries)
      totals.set(
        this.dateOf(entry.workDate),
        (totals.get(this.dateOf(entry.workDate)) ?? 0) + entry.minutes,
      );
    return [...totals.values()];
  }

  private dateOf(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  private shift(date: string, days: number) {
    const shifted = new Date(date + DAY);
    shifted.setUTCDate(shifted.getUTCDate() + days);
    return this.dateOf(shifted);
  }

  private mondayOf(date: string) {
    const weekday = new Date(date + DAY).getUTCDay();
    return this.shift(date, weekday === 0 ? -6 : 1 - weekday);
  }

  private today() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
}
