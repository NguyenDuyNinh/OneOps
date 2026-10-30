
import assert from "node:assert/strict";
import test from "node:test";

import {
  TASK_RELATIONSHIPS,
  getTaskRelationships,
  isTaskAssignee,
  isTaskReviewer,
  type TaskRelationshipResource,
} from "./resource-relationship.js";

const task: TaskRelationshipResource = {
  id: "TASK-01",
  assigneeId: "USER-01",
  reviewerId: "USER-02",
};

test("KAN-19: assignee relationship is detected", () => {
  assert.equal(isTaskAssignee("USER-01", task), true);
});

test("KAN-19: reviewer relationship is detected", () => {
  assert.equal(isTaskReviewer("USER-02", task), true);
});

test("KAN-19: unrelated user has no relationship", () => {
  assert.deepEqual(
    getTaskRelationships("USER-99", task),
    [],
  );
});

test("KAN-19: assignee is not automatically reviewer", () => {
  assert.equal(isTaskReviewer("USER-01", task), false);
});

test("KAN-19: reviewer is not automatically assignee", () => {
  assert.equal(isTaskAssignee("USER-02", task), false);
});

test("KAN-19: same user can have multiple relationships", () => {
  const sameUserTask = {
    ...task,
    reviewerId: "USER-01",
  };

  assert.deepEqual(
    getTaskRelationships("USER-01", sameUserTask),
    [
      TASK_RELATIONSHIPS.ASSIGNEE,
      TASK_RELATIONSHIPS.REVIEWER,
    ],
  );
});

test("KAN-19: unassigned task has no assignee", () => {
  assert.equal(
    isTaskAssignee("USER-01", {
      ...task,
      assigneeId: null,
    }),
    false,
  );
});

test("KAN-19: task without reviewer has no reviewer", () => {
  assert.equal(
    isTaskReviewer("USER-02", {
      ...task,
      reviewerId: null,
    }),
    false,
  );
});

test("KAN-19: empty user ID is rejected", () => {
  assert.deepEqual(getTaskRelationships("", task), []);
});

test("KAN-19: empty task ID is rejected", () => {
  assert.deepEqual(
    getTaskRelationships("USER-01", {
      ...task,
      id: "",
    }),
    [],
  );
});
