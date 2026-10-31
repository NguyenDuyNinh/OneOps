-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "hr_employees";

-- CreateTable
CREATE TABLE "hr_employees"."employees" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "codeKey" VARCHAR(50) NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL DEFAULT '',
    "emailKey" VARCHAR(200),
    "phone" VARCHAR(40) NOT NULL DEFAULT '',
    "jobTitle" VARCHAR(150) NOT NULL DEFAULT '',
    "departmentName" VARCHAR(200) NOT NULL DEFAULT '',
    "teamName" VARCHAR(200) NOT NULL DEFAULT '',
    "managerName" VARCHAR(150) NOT NULL DEFAULT '',
    "startDate" DATE,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "note" VARCHAR(2000) NOT NULL DEFAULT '',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_codeKey_key" ON "hr_employees"."employees"("codeKey");

-- CreateIndex
CREATE UNIQUE INDEX "employees_emailKey_key" ON "hr_employees"."employees"("emailKey");

-- CreateIndex
CREATE INDEX "employees_status_fullName_idx" ON "hr_employees"."employees"("status", "fullName");

-- CreateIndex
CREATE INDEX "employees_departmentName_status_idx" ON "hr_employees"."employees"("departmentName", "status");

-- CreateIndex
CREATE INDEX "employees_jobTitle_status_idx" ON "hr_employees"."employees"("jobTitle", "status");

