export { TaskWorkflowModule } from "./task-workflow.module.js";
export { TaskWorkflowService } from "./task-workflow.service.js";
export { TASK_STATE } from "./task-state.port.js";
export type { TaskStatePort, TaskStateSnapshot } from "./task-state.port.js";
export { TASK_COMMENT_SINK } from "./comment-sink.port.js";
export type { TaskCommentSinkPort } from "./comment-sink.port.js";
export { QA_GATE } from "./qa-gate.port.js";
export type { QaGatePort, QaGateStatus } from "./qa-gate.port.js";
export {
  TASK_STATUSES,
  TERMINAL_STATUSES,
  WARNING_STATUSES,
  carriesDeadlineWarning,
  isTerminal,
} from "./state-machine.js";
