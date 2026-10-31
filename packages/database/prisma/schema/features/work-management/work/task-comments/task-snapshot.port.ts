export const TASK_SNAPSHOT = "oneops:task-snapshot";

export interface TaskSnapshot {
  id: string;
  code: string;
  name: string;
  status: string;
  assignee: string;
  reviewer: string;
}

/**
 * Minimal task read model needed to validate and notify comments. Bound by the
 * main composition instead of importing `work/tasks`.
 */
export interface TaskSnapshotPort {
  get(taskId: string): Promise<TaskSnapshot>;
}
