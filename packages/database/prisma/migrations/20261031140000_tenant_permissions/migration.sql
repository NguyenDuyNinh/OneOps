-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant_permissions";

-- CreateTable
CREATE TABLE "tenant_permissions"."role_permissions" (
    "id" UUID NOT NULL,
    "featureKey" VARCHAR(120) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "actions" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedBy" VARCHAR(200) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_permissions"."permission_changes" (
    "id" UUID NOT NULL,
    "featureKey" VARCHAR(120) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "fromActions" TEXT[],
    "toActions" TEXT[],
    "actorName" VARCHAR(200) NOT NULL,
    "reason" VARCHAR(500) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "role_permissions_role_idx" ON "tenant_permissions"."role_permissions"("role");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_featureKey_role_key" ON "tenant_permissions"."role_permissions"("featureKey", "role");

-- CreateIndex
CREATE INDEX "permission_changes_createdAt_idx" ON "tenant_permissions"."permission_changes"("createdAt");

-- CreateIndex
CREATE INDEX "permission_changes_featureKey_role_idx" ON "tenant_permissions"."permission_changes"("featureKey", "role");
