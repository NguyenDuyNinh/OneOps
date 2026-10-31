-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "hr_departments";

-- CreateTable
CREATE TABLE "hr_departments"."departments" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "codeKey" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000) NOT NULL DEFAULT '',
    "managerName" VARCHAR(150) NOT NULL DEFAULT '',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_departments"."teams" (
    "id" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "codeKey" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000) NOT NULL DEFAULT '',
    "managerName" VARCHAR(150) NOT NULL DEFAULT '',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_codeKey_key" ON "hr_departments"."departments"("codeKey");

-- CreateIndex
CREATE INDEX "departments_status_name_idx" ON "hr_departments"."departments"("status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_codeKey_key" ON "hr_departments"."teams"("codeKey");

-- CreateIndex
CREATE INDEX "teams_departmentId_status_idx" ON "hr_departments"."teams"("departmentId", "status");

-- AddForeignKey
ALTER TABLE "hr_departments"."teams" ADD CONSTRAINT "teams_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "hr_departments"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
