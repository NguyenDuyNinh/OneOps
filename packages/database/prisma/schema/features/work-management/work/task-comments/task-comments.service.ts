import {
  BadRequestException,
  Inject,
  Injectable,
  Optional,
} from "@nestjs/common";
import type { ActorContext } from "../../../../core/auth/actor-context.js";
import { NotificationEvents } from "../../../../core/events/notification-events.js";
import { SchemaPipe } from "../../../../core/pipes/validation.pipe.js";
import { commentInput, systemCommentInput } from "./dto/task-comments.dto.js";
import type { CommentInput } from "./dto/task-comments.dto.js";
import { TaskCommentsRepository } from "./task-comments.repository.js";
import {
  TASK_SNAPSHOT,
  type TaskSnapshot,
  type TaskSnapshotPort,
} from "./task-snapshot.port.js";

@Injectable()
export class TaskCommentsService {
  constructor(
    private readonly repository: TaskCommentsRepository,
    @Inject(TASK_SNAPSHOT) private readonly tasks: TaskSnapshotPort,
    @Optional() private readonly events?: NotificationEvents,
  ) {}

  async list(query: { taskId: string; page: number; pageSize: number }) {
    return this.repository.list(query);
  }

  async counts(rawTaskIds: string) {
    const ids = [
      ...new Set(
        rawTaskIds
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    ].slice(0, 200);
    for (const id of ids)
      if (!/^[0-9a-f-]{36}$/i.test(id))
        throw new BadRequestException("Danh sách công việc không hợp lệ.");
    const items = await this.repository.counts(ids);
    return { items };
  }

  async create(rawInput: CommentInput, actor: ActorContext) {
    const input = new SchemaPipe(commentInput).transform(rawInput);
    const task = await this.tasks.get(input.taskId);
    const comment = await this.repository.create({
      taskId: input.taskId,
      authorAccountId: actor.accountId,
      author: actor.displayName,
      body: input.body,
      mentions: input.mentions,
      attachments: input.attachments,
      kind: "COMMENT",
    });
    this.notify(task, comment.author, input.mentions, input.body);
    return comment;
  }

  /** Reason sink used by the workflow; the author comes from the acting service. */
  async record(rawInput: unknown) {
    const input = new SchemaPipe(systemCommentInput).transform(rawInput);
    const task = await this.tasks.get(input.taskId);
    const comment = await this.repository.create({
      taskId: input.taskId,
      authorAccountId: null,
      author: input.author,
      body: input.body,
      mentions: [],
      attachments: [],
      kind: "SYSTEM",
    });
    this.notify(task, comment.author, [], input.body);
    return comment;
  }

  private notify(
    task: TaskSnapshot,
    author: string,
    mentions: readonly string[],
    body: string,
  ) {
    if (!this.events) return;
    const link = `/work-management/tasks?focus=${task.id}`;
    const assignee = task.assignee.trim();
    if (assignee && assignee !== author)
      this.events.emit({
        source: "comment",
        recipients: [assignee],
        title: `Bình luận mới: ${task.name}`.slice(0, 500),
        body: `${author}: ${body}`.slice(0, 2000),
        link,
        sourceId: task.id,
      });
    const mentioned = [
      ...new Set(mentions.map((value) => value.trim())),
    ].filter((value) => value && value !== author && value !== assignee);
    if (mentioned.length)
      this.events.emit({
        source: "comment",
        recipients: mentioned,
        title: `Bạn được nhắc tên: ${task.name}`.slice(0, 500),
        body: `${author} đã nhắc bạn trong bình luận của công việc ${task.code}.`,
        link,
        sourceId: task.id,
      });
  }
}
