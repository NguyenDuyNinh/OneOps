export const QA_TASK_REF = "oneops:qa-task-ref";

/** Read model of a task as seen by milestones and QA; never a repository handle. */
export interface QaTaskSnapshot {
  id: string;
  code: string;
  name: string;
  status: string;
  assignee: string;
  reviewer: string;
}

/**
 * Bound by the main composition (`work-management.module.ts`) so this feature
 * keeps owning only its own tables.
 */
export interface QaTaskRefPort {
  snapshots(taskIds: readonly string[]): Promise<QaTaskSnapshot[]>;
}
