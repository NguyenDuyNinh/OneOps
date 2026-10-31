-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_milestones_qa";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_task_comments";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_task_workflow";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_timesheets";

-- CreateTable
CREATE TABLE "work_milestones_qa"."milestones" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "description" VARCHAR(2000) NOT NULL DEFAULT '',
    "targetDate" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "contractRef" VARCHAR(200) NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_milestones_qa"."milestone_items" (
    "id" UUID NOT NULL,
    "milestoneId" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestone_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_milestones_qa"."acceptance_items" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "steps" VARCHAR(2000) NOT NULL DEFAULT '',
    "expected" VARCHAR(1000) NOT NULL DEFAULT '',
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acceptance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_milestones_qa"."acceptance_results" (
    "id" UUID NOT NULL,
    "itemId" UUID NOT NULL,
    "outcome" VARCHAR(10) NOT NULL,
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "evidence" JSONB NOT NULL DEFAULT '[]',
    "testedByAccountId" UUID,
    "testedByName" VARCHAR(200) NOT NULL DEFAULT '',
    "isOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acceptance_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_timesheets"."timesheet_periods" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "employeeName" VARCHAR(200) NOT NULL,
    "weekStart" DATE NOT NULL,
    "weekEnd" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "overThreshold" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "decidedByName" VARCHAR(200) NOT NULL DEFAULT '',
    "decisionNote" VARCHAR(1000) NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_timesheets"."time_entries" (
    "id" UUID NOT NULL,
    "periodId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "projectId" UUID,
    "taskId" UUID,
    "workDate" DATE NOT NULL,
    "minutes" INTEGER NOT NULL,
    "note" VARCHAR(1000) NOT NULL DEFAULT '',
    "billable" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_timesheets"."time_entry_adjustments" (
    "id" UUID NOT NULL,
    "entryId" UUID NOT NULL,
    "periodId" UUID NOT NULL,
    "deltaMinutes" INTEGER NOT NULL,
    "note" VARCHAR(1000) NOT NULL,
    "adjustedById" UUID,
    "adjustedByName" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entry_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_task_comments"."task_comments" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "authorAccountId" UUID,
    "author" VARCHAR(200) NOT NULL,
    "body" VARCHAR(4000) NOT NULL,
    "mentions" JSONB NOT NULL DEFAULT '[]',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "kind" VARCHAR(20) NOT NULL DEFAULT 'COMMENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_task_workflow"."task_transitions" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "fromStatus" VARCHAR(150) NOT NULL,
    "toStatus" VARCHAR(150) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "reason" VARCHAR(2000) NOT NULL DEFAULT '',
    "actorAccountId" UUID,
    "actorName" VARCHAR(200) NOT NULL DEFAULT '',
    "actorRole" VARCHAR(20) NOT NULL DEFAULT '',
    "taskVersion" INTEGER NOT NULL,
    "requestKey" VARCHAR(128),
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_task_workflow"."task_proposals" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "kind" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "reason" VARCHAR(2000) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "requestedByAccountId" UUID,
    "requestedByName" VARCHAR(200) NOT NULL DEFAULT '',
    "decidedByAccountId" UUID,
    "decidedByName" VARCHAR(200) NOT NULL DEFAULT '',
    "decisionReason" VARCHAR(2000) NOT NULL DEFAULT '',
    "decidedAt" TIMESTAMP(3),
    "requestKey" VARCHAR(128),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "milestones_projectId_status_targetDate_idx" ON "work_milestones_qa"."milestones"("projectId", "status", "targetDate");

-- CreateIndex
CREATE INDEX "milestone_items_taskId_idx" ON "work_milestones_qa"."milestone_items"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_items_milestoneId_taskId_key" ON "work_milestones_qa"."milestone_items"("milestoneId", "taskId");

-- CreateIndex
CREATE INDEX "acceptance_items_taskId_idx" ON "work_milestones_qa"."acceptance_items"("taskId");

-- CreateIndex
CREATE INDEX "acceptance_results_itemId_createdAt_idx" ON "work_milestones_qa"."acceptance_results"("itemId", "createdAt");

-- CreateIndex
CREATE INDEX "timesheet_periods_status_weekStart_idx" ON "work_timesheets"."timesheet_periods"("status", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "timesheet_periods_employeeId_weekStart_key" ON "work_timesheets"."timesheet_periods"("employeeId", "weekStart");

-- CreateIndex
CREATE INDEX "time_entries_periodId_workDate_idx" ON "work_timesheets"."time_entries"("periodId", "workDate");

-- CreateIndex
CREATE INDEX "time_entries_employeeId_workDate_idx" ON "work_timesheets"."time_entries"("employeeId", "workDate");

-- CreateIndex
CREATE INDEX "time_entry_adjustments_entryId_idx" ON "work_timesheets"."time_entry_adjustments"("entryId");

-- CreateIndex
CREATE INDEX "time_entry_adjustments_periodId_idx" ON "work_timesheets"."time_entry_adjustments"("periodId");

-- CreateIndex
CREATE INDEX "task_comments_taskId_createdAt_idx" ON "work_task_comments"."task_comments"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "task_transitions_taskId_occurredAt_idx" ON "work_task_workflow"."task_transitions"("taskId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "task_transitions_taskId_requestKey_key" ON "work_task_workflow"."task_transitions"("taskId", "requestKey");

-- CreateIndex
CREATE INDEX "task_proposals_taskId_status_idx" ON "work_task_workflow"."task_proposals"("taskId", "status");

-- CreateIndex
CREATE INDEX "task_proposals_status_kind_idx" ON "work_task_workflow"."task_proposals"("status", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "task_proposals_taskId_requestKey_key" ON "work_task_workflow"."task_proposals"("taskId", "requestKey");

-- Backfill: the approved state machine names two statuses differently from the
-- legacy task payload. Values are normalized in place, no row is removed.
UPDATE "work_tasks"."records" SET "status" = 'Đang làm', "updatedAt" = CURRENT_TIMESTAMP WHERE "status" = 'Đang thực hiện';
UPDATE "work_tasks"."records" SET "status" = 'Chờ kiểm tra', "updatedAt" = CURRENT_TIMESTAMP WHERE "status" = 'Chờ phản hồi';

-- Backfill: legacy comments stored in the task JSON move to owned persistence.
-- Rows without a plausible ISO timestamp are skipped instead of failing the migration.
INSERT INTO "work_task_comments"."task_comments" ("id", "taskId", "authorAccountId", "author", "body", "mentions", "attachments", "kind", "createdAt")
SELECT
    gen_random_uuid(),
    task."id",
    NULL,
    COALESCE(NULLIF(entry ->> 'author', ''), 'Hệ thống'),
    entry ->> 'text',
    '[]'::jsonb,
    '[]'::jsonb,
    'COMMENT',
    (entry ->> 'createdAt')::timestamptz
FROM "work_tasks"."records" AS task
CROSS JOIN LATERAL jsonb_array_elements(
    CASE
        WHEN jsonb_typeof(task."fields" -> 'comments') = 'array' THEN task."fields" -> 'comments'
        ELSE '[]'::jsonb
    END
) AS entry
WHERE COALESCE(entry ->> 'text', '') <> ''
  AND (entry ->> 'createdAt') ~ '^\d{4}-\d{2}-\d{2}T';
