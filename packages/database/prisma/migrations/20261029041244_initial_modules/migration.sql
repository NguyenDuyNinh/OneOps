-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "archives";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "books";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dashboard";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "documents";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "forwarded_cases";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "linked_documents";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "organization_cases";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "personal_cases";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "property_processing";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "receipts";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reconciliation";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reports";

-- CreateTable
CREATE TABLE "archives"."records" (
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
CREATE TABLE "books"."records" (
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
CREATE TABLE "dashboard"."layouts" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "columns" INTEGER NOT NULL DEFAULT 3,
    "showTasks" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents"."records" (
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
CREATE TABLE "forwarded_cases"."records" (
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
CREATE TABLE "linked_documents"."records" (
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
CREATE TABLE "organization_cases"."records" (
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
CREATE TABLE "personal_cases"."records" (
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
CREATE TABLE "property_processing"."records" (
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
CREATE TABLE "receipts"."records" (
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
CREATE TABLE "reconciliation"."records" (
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
CREATE TABLE "reports"."records" (
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
CREATE UNIQUE INDEX "records_codeKey_key" ON "archives"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "archives"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "books"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "books"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "documents"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "documents"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "forwarded_cases"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "forwarded_cases"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "linked_documents"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "linked_documents"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "organization_cases"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "organization_cases"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "personal_cases"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "personal_cases"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "property_processing"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "property_processing"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "receipts"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "receipts"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "reconciliation"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "reconciliation"."records"("scope", "status", "date");

-- CreateIndex
CREATE UNIQUE INDEX "records_codeKey_key" ON "reports"."records"("codeKey");

-- CreateIndex
CREATE INDEX "records_scope_status_date_idx" ON "reports"."records"("scope", "status", "date");
