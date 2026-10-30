
import {
  isTaskAssignee,
  isTaskReviewer,
  type TaskRelationshipResource,
} from "./resource-relationship.js";

/**
 * KAN-30 - Task Action Business Conditions
 *
 * BR-ST-01, BR-ST-02, BR-ST-03, BR-ST-07
 * BR-TSK-11
 */

export const TASK_STATUSES = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REWORK: "REWORK",
  PENDING_REVIEW: "PENDING_REVIEW",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type TaskStatus =
  (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export const TASK_ACTIONS = {
  START: "START",
  SUBMIT_FOR_REVIEW: "SUBMIT_FOR_REVIEW",
  APPROVE: "APPROVE",
  REQUEST_REWORK: "REQUEST_REWORK",
} as const;

export type TaskAction =
  (typeof TASK_ACTIONS)[keyof typeof TASK_ACTIONS];

export interface TaskPolicyResource
  extends TaskRelationshipResource {
  status: TaskStatus;
}

export interface TaskActionRequest {
  userId: string;
  task: TaskPolicyResource;
  action: TaskAction;
  reason?: string | null;
}

export type TaskActionDecision =
  | { allowed: true; nextStatus: TaskStatus }
  | { allowed: false; reason: string };

/**
 * Pure policy evaluation.
 * Does not update the task or write audit logs.
 */
export function evaluateTaskAction(
  request: TaskActionRequest,
): TaskActionDecision {
  const { userId, task, action, reason } = request;

  if (
    !userId.trim() ||
    !task.id.trim() ||
    !task.assigneeId?.trim() ||
    !task.reviewerId?.trim()
  ) {
    return {
      allowed: false,
      reason: "Missing task or actor information",
    };
  }

  // BR-TSK-11: Reviewer and assignee must be different.
  if (task.assigneeId === task.reviewerId) {
    return {
      allowed: false,
      reason: "Assignee and reviewer must be different",
    };
  }

  // BR-ST-07: Terminal tasks cannot change status.
  if (
    task.status === TASK_STATUSES.COMPLETED ||
    task.status === TASK_STATUSES.CANCELLED
  ) {
    return {
      allowed: false,
      reason: "Task is already in a terminal state",
    };
  }

  switch (action) {
    case TASK_ACTIONS.START:
      if (
        !isTaskAssignee(userId, task) ||
        task.status !== TASK_STATUSES.TODO
      ) {
        return {
          allowed: false,
          reason: "Only the assignee can start a TODO task",
        };
      }

      return {
        allowed: true,
        nextStatus: TASK_STATUSES.IN_PROGRESS,
      };

   
case TASK_ACTIONS.SUBMIT_FOR_REVIEW:
  if (
    !isTaskAssignee(userId, task) ||
    (
      task.status !== TASK_STATUSES.IN_PROGRESS &&
      task.status !== TASK_STATUSES.REWORK
    )
  ) {

        return {
          allowed: false,
          reason:
            "Only the assignee can submit an active or rework task",
        };
      }

      return {
        allowed: true,
        nextStatus: TASK_STATUSES.PENDING_REVIEW,
      };

    case TASK_ACTIONS.APPROVE:
      if (
        !isTaskReviewer(userId, task) ||
        task.status !== TASK_STATUSES.PENDING_REVIEW
      ) {
        return {
          allowed: false,
          reason:
            "Only the assigned reviewer can approve a pending task",
        };
      }

      return {
        allowed: true,
        nextStatus: TASK_STATUSES.COMPLETED,
      };

    case TASK_ACTIONS.REQUEST_REWORK:
      if (
        !isTaskReviewer(userId, task) ||
        task.status !== TASK_STATUSES.PENDING_REVIEW
      ) {
        return {
          allowed: false,
          reason:
            "Only the assigned reviewer can request rework",
        };
      }

      if (!reason?.trim()) {
        return {
          allowed: false,
          reason: "A rework reason is required",
        };
      }

      return {
        allowed: true,
        nextStatus: TASK_STATUSES.REWORK,
      };

    default:
      return {
        allowed: false,
        reason: "Unsupported task action",
      };
  }
}
