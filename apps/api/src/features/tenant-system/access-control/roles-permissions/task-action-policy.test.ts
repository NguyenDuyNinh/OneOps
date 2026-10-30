
import assert from "node:assert/strict";
import test from "node:test";

import {
  TASK_ACTIONS,
  TASK_STATUSES,
  evaluateTaskAction,
  type TaskActionRequest,
} from "./task-action-policy.js";

function makeRequest(
  overrides: Partial<TaskActionRequest> = {},
): TaskActionRequest {
  return {
    userId: "USER-01",
    action: TASK_ACTIONS.START,
    task: {
      id: "TASK-01",
      assigneeId: "USER-01",
      reviewerId: "USER-02",
      status: TASK_STATUSES.TODO,
    },
    ...overrides,
  };
}

test("KAN-30: assignee can start TODO task", () => {
  assert.deepEqual(evaluateTaskAction(makeRequest()), {
    allowed: true,
    nextStatus: TASK_STATUSES.IN_PROGRESS,
  });
});

test("KAN-30: unrelated user cannot start task", () => {
  const result = evaluateTaskAction(
    makeRequest({ userId: "USER-99" }),
  );
  assert.equal(result.allowed, false);
});

test("KAN-30: assignee can submit active task", () => {
  const result = evaluateTaskAction(
    makeRequest({
      action: TASK_ACTIONS.SUBMIT_FOR_REVIEW,
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.IN_PROGRESS,
      },
    }),
  );

  assert.deepEqual(result, {
    allowed: true,
    nextStatus: TASK_STATUSES.PENDING_REVIEW,
  });
});

test("KAN-30: assignee can resubmit rework task", () => {
  const result = evaluateTaskAction(
    makeRequest({
      action: TASK_ACTIONS.SUBMIT_FOR_REVIEW,
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.REWORK,
      },
    }),
  );

  assert.equal(result.allowed, true);
});

test("KAN-30: reviewer can approve pending task", () => {
  const result = evaluateTaskAction(
    makeRequest({
      userId: "USER-02",
      action: TASK_ACTIONS.APPROVE,
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.PENDING_REVIEW,
      },
    }),
  );

  assert.deepEqual(result, {
    allowed: true,
    nextStatus: TASK_STATUSES.COMPLETED,
  });
});

test("KAN-30: assignee cannot approve own task", () => {
  const result = evaluateTaskAction(
    makeRequest({
      action: TASK_ACTIONS.APPROVE,
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.PENDING_REVIEW,
      },
    }),
  );

  assert.equal(result.allowed, false);
});

test("KAN-30: reviewer cannot approve TODO task", () => {
  const result = evaluateTaskAction(
    makeRequest({
      userId: "USER-02",
      action: TASK_ACTIONS.APPROVE,
    }),
  );

  assert.equal(result.allowed, false);
});

test("KAN-30: reviewer must provide rework reason", () => {
  const result = evaluateTaskAction(
    makeRequest({
      userId: "USER-02",
      action: TASK_ACTIONS.REQUEST_REWORK,
      reason: "   ",
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.PENDING_REVIEW,
      },
    }),
  );

  assert.equal(result.allowed, false);
});

test("KAN-30: reviewer can request rework with reason", () => {
  const result = evaluateTaskAction(
    makeRequest({
      userId: "USER-02",
      action: TASK_ACTIONS.REQUEST_REWORK,
      reason: "Needs corrections",
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.PENDING_REVIEW,
      },
    }),
  );

  assert.deepEqual(result, {
    allowed: true,
    nextStatus: TASK_STATUSES.REWORK,
  });
});

test("KAN-30: completed task cannot be modified", () => {
  const result = evaluateTaskAction(
    makeRequest({
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.COMPLETED,
      },
    }),
  );

  assert.equal(result.allowed, false);
});

test("KAN-30: cancelled task cannot be modified", () => {
  const result = evaluateTaskAction(
    makeRequest({
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-02",
        status: TASK_STATUSES.CANCELLED,
      },
    }),
  );

  assert.equal(result.allowed, false);
});

test("KAN-30: assignee and reviewer cannot be same", () => {
  const result = evaluateTaskAction(
    makeRequest({
      task: {
        id: "TASK-01",
        assigneeId: "USER-01",
        reviewerId: "USER-01",
        status: TASK_STATUSES.TODO,
      },
    }),
  );

  assert.equal(result.allowed, false);
});
