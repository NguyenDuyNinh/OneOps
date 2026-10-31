-- AlterTable
ALTER TABLE "work_notifications"."records" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "records_deletedAt_idx" ON "work_notifications"."records"("deletedAt");

