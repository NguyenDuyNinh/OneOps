import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Database,
  type Transaction,
} from "../../../../core/database/database.module.js";
import { Prisma } from "@oneops/database";
import type { TaskCommentAuthor } from "./task-comments.types.js";

const DEFAULT_USERS: TaskCommentAuthor[] = [
  {
    id: "usr_admin_01",
    name: "Xuân Thành Trần",
    role: "ADMIN",
    avatarUrl: null,
  },
  {
    id: "usr_mgr_01",
    name: "Hoàng Tuấn Bảo",
    role: "MANAGER",
    avatarUrl: null,
  },
  {
    id: "usr_dev_01",
    name: "Nguyễn Văn A",
    role: "STAFF",
    avatarUrl: null,
  },
  {
    id: "usr_des_01",
    name: "Trần Thị B",
    role: "STAFF",
    avatarUrl: null,
  },
  {
    id: "usr_qa_01",
    name: "Lê Văn C",
    role: "STAFF",
    avatarUrl: null,
  },
];

export interface CreateTaskCommentData {
  taskId: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string | null;
  content: string;
  type?: string;
  mentions?: string[];
  links?: string[];
  attachments?: unknown;
  proposedDeadline?: Date;
  proposalStatus?: string;
  isSystemLog?: boolean;
}

@Injectable()
export class TaskCommentsRepository {
  constructor(private readonly db: Database) {}

  private table(tx: Transaction = this.db) {
    return tx.taskComment;
  }

  async list(
    taskId: string,
    skip: number,
    take: number,
    tx: Transaction = this.db,
  ) {
    const where: Prisma.TaskCommentWhereInput = { taskId };
    const [items, total] = await Promise.all([
      this.table(tx).findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take,
      }),
      this.table(tx).count({ where }),
    ]);
    return { items, total };
  }

  async count(taskId: string, tx: Transaction = this.db) {
    return this.table(tx).count({ where: { taskId } });
  }

  async findById(id: string, tx: Transaction = this.db) {
    return this.table(tx).findUnique({ where: { id } });
  }

  async findPendingProposal(taskId: string, tx: Transaction = this.db) {
    return this.table(tx).findFirst({
      where: {
        taskId,
        type: "DEADLINE_PROPOSAL",
        proposalStatus: "PENDING",
      },
    });
  }

  async create(data: CreateTaskCommentData, tx: Transaction = this.db) {
    return this.table(tx).create({
      data: {
        ...data,
        attachments:
          data.attachments !== undefined
            ? (data.attachments as Prisma.InputJsonValue)
            : undefined,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.TaskCommentUpdateInput,
    tx: Transaction = this.db,
  ) {
    const comment = await this.table(tx).findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException("Bình luận không tồn tại.");
    }
    return this.table(tx).update({
      where: { id },
      data,
    });
  }

  getMentionableUsers(): TaskCommentAuthor[] {
    return DEFAULT_USERS;
  }

  findUserById(userId: string): TaskCommentAuthor | undefined {
    return DEFAULT_USERS.find((u) => u.id === userId);
  }
}
