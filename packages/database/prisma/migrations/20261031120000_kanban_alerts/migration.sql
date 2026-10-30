-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_kanban";

-- CreateTable
CREATE TABLE "work_kanban"."alerts" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "deadlineSnapshot" TIMESTAMPTZ(3) NOT NULL,
    "taskVersion" INTEGER NOT NULL,
    "state" VARCHAR(20) NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alerts_taskId_key" ON "work_kanban"."alerts"("taskId");

-- CreateIndex
CREATE INDEX "alerts_state_checkedAt_idx" ON "work_kanban"."alerts"("state", "checkedAt");
