-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_calendar";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_dashboard";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_messages";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_notes";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_projects";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_reports";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_requests";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_tasks";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_teams";

-- CreateTable
CREATE TABLE "work_calendar"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_dashboard"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_messages"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_notes"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_projects"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_reports"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_requests"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_tasks"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_teams"."records" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "codeKey" VARCHAR(100) NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "scope" VARCHAR(250) NOT NULL DEFAULT '',
    "status" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "assignee" VARCHAR(150) NOT NULL DEFAULT '',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_calendar"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_calendar"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_dashboard"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_dashboard"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_messages"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_messages"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_notes"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_notes"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_projects"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_projects"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_reports"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_reports"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_requests"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_requests"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_tasks"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_tasks"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "work_teams"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "work_teams"."records"("scope", "status", "date");

