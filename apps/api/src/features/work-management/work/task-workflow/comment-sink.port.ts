export const TASK_COMMENT_SINK = "oneops:task-comment-sink";

export interface TaskCommentRecord {
  taskId: string;
  author: string;
  body: string;
}

/**
 * Reason sink required by BR-ST-03: every hold/cancel/rework reason becomes a
 * SYSTEM task comment. The composition binds this to `work/task-comments`.
 */
export interface TaskCommentSinkPort {
  record(input: TaskCommentRecord): Promise<void>;
}
