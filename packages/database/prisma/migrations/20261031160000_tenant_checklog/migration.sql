-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant_checklog";

-- CreateTable
CREATE TABLE "tenant_checklog"."audit_entries" (
    "id" UUID NOT NULL,
    "featureKey" VARCHAR(120) NOT NULL,
    "action" VARCHAR(60) NOT NULL,
    "targetType" VARCHAR(60) NOT NULL DEFAULT '',
    "targetId" VARCHAR(200) NOT NULL DEFAULT '',
    "summary" VARCHAR(500) NOT NULL,
    "reason" VARCHAR(500) NOT NULL DEFAULT '',
    "before_value" JSONB,
    "after_value" JSONB,
    "actorAccountId" UUID,
    "actorName" VARCHAR(200) NOT NULL DEFAULT '',
    "actorRole" VARCHAR(20) NOT NULL DEFAULT '',
    "isSystemAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isOutOfScopeOverride" BOOLEAN NOT NULL DEFAULT false,
    "result" VARCHAR(10) NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_entries_createdAt_idx" ON "tenant_checklog"."audit_entries"("createdAt");

-- CreateIndex
CREATE INDEX "audit_entries_featureKey_createdAt_idx" ON "tenant_checklog"."audit_entries"("featureKey", "createdAt");

-- CreateIndex
CREATE INDEX "audit_entries_actorAccountId_createdAt_idx" ON "tenant_checklog"."audit_entries"("actorAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_entries_action_idx" ON "tenant_checklog"."audit_entries"("action");
