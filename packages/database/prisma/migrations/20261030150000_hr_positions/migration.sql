-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "hr_positions";

-- CreateTable
CREATE TABLE "hr_positions"."positions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "codeKey" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000) NOT NULL DEFAULT '',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_positions"."grades" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "codeKey" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 1,
    "description" VARCHAR(2000) NOT NULL DEFAULT '',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "positionId" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "positions_codeKey_key" ON "hr_positions"."positions"("codeKey");

-- CreateIndex
CREATE INDEX "positions_status_name_idx" ON "hr_positions"."positions"("status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "grades_codeKey_key" ON "hr_positions"."grades"("codeKey");

-- CreateIndex
CREATE INDEX "grades_positionId_rank_idx" ON "hr_positions"."grades"("positionId", "rank");

-- CreateIndex
CREATE INDEX "grades_status_rank_idx" ON "hr_positions"."grades"("status", "rank");

-- AddForeignKey
ALTER TABLE "hr_positions"."grades" ADD CONSTRAINT "grades_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "hr_positions"."positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
