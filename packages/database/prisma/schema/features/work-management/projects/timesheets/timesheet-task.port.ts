export const TIMESHEET_TASK_REF = "oneops:timesheet-task-ref";

/** Task attributes a time entry needs; resolved through the main composition. */
export interface TimesheetTaskSnapshot {
  id: string;
  code: string;
  name: string;
  status: string;
  assignee: string;
  reviewer: string;
}

export interface TimesheetTaskRefPort {
  snapshot(taskId: string): Promise<TimesheetTaskSnapshot | null>;
}
