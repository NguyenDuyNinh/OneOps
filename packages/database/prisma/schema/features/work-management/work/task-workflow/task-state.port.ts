export const TASK_STATE = "oneops:task-state";

/**
 * Read model of the task aggregate. The workflow owns transitions, the tasks
 * feature owns the row, so this port is bound by the main composition
 * (`work-management.module.ts`) instead of importing the other feature.
 */
export interface TaskStateSnapshot {
  id: string;
  code: string;
  name: string;
  status: string;
  date: string;
  assignee: string;
  reviewer: string;
  version: number;
}

export interface TaskStatePort {
  get(taskId: string): Promise<TaskStateSnapshot>;
  transition(
    taskId: string,
    input: { toStatus: string; version: number },
  ): Promise<TaskStateSnapshot>;
  setDeadline(
    taskId: string,
    input: { date: string; version: number },
  ): Promise<TaskStateSnapshot>;
}
