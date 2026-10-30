
/**
 * KAN-19: Relationship-Based Authorization
 *
 * Determine the relationship between an authenticated user
 * and a task. Actual action permissions are evaluated later.
 */

export const TASK_RELATIONSHIPS = {
  ASSIGNEE: "ASSIGNEE",
  REVIEWER: "REVIEWER",
} as const;

export type TaskRelationship =
  (typeof TASK_RELATIONSHIPS)[keyof typeof TASK_RELATIONSHIPS];

export interface TaskRelationshipResource {
  id: string;
  assigneeId: string | null;
  reviewerId: string | null;
}

/**
 * Returns all relationships a user has with a task.
 * A user can be both assignee and reviewer if the data
 * allows it; business rules may forbid this separately.
 */
export function getTaskRelationships(
  userId: string,
  task: TaskRelationshipResource,
): TaskRelationship[] {
  if (!userId.trim() || !task.id.trim()) {
    return [];
  }

  const relationships: TaskRelationship[] = [];

  if (task.assigneeId === userId) {
    relationships.push(TASK_RELATIONSHIPS.ASSIGNEE);
  }

  if (task.reviewerId === userId) {
    relationships.push(TASK_RELATIONSHIPS.REVIEWER);
  }

  return relationships;
}

export function isTaskAssignee(
  userId: string,
  task: TaskRelationshipResource,
): boolean {
  return getTaskRelationships(userId, task).includes(
    TASK_RELATIONSHIPS.ASSIGNEE,
  );
}

export function isTaskReviewer(
  userId: string,
  task: TaskRelationshipResource,
): boolean {
  return getTaskRelationships(userId, task).includes(
    TASK_RELATIONSHIPS.REVIEWER,
  );
}
