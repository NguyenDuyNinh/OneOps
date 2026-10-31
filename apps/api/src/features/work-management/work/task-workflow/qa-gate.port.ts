export const QA_GATE = "oneops:qa-gate";

export interface QaGateStatus {
  /** True when the task has at least one mandatory acceptance item. */
  required: boolean;
  /** True when every mandatory item holds a PASS result. */
  passed: boolean;
  /** Titles of mandatory items without a PASS result. */
  blocking: string[];
}

/**
 * Completion precondition supplied by `projects/milestones-qa`. The composition
 * binds the real implementation; without QA data every task may complete.
 */
export interface QaGatePort {
  inspect(taskId: string): Promise<QaGateStatus>;
}
