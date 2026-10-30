-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "work_notifications";

-- CreateTable
CREATE TABLE "work_notifications"."records" (
    "id" UUID NOT NULL,
    "recipient" VARCHAR(150) NOT NULL,
    "source" VARCHAR(20) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "body" VARCHAR(2000) NOT NULL DEFAULT '',
    "link" VARCHAR(500) NOT NULL,
    "sourceId" UUID,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "records_recipient_readAt_createdAt_idx" ON "work_notifications"."records"("recipient", "readAt", "createdAt");
