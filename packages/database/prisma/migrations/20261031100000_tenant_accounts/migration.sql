-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant_accounts";

-- CreateTable
CREATE TABLE "tenant_accounts"."accounts" (
    "id" UUID NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "usernameKey" VARCHAR(80) NOT NULL,
    "displayName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(200) NOT NULL DEFAULT '',
    "emailKey" VARCHAR(200),
    "employeeCode" VARCHAR(50) NOT NULL DEFAULT '',
    "role" VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    "isSystemAdmin" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "passwordHash" VARCHAR(200) NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "lockedReason" VARCHAR(500) NOT NULL DEFAULT '',
    "lastLoginAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_accounts"."account_access_changes" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "kind" VARCHAR(20) NOT NULL,
    "fromValue" VARCHAR(40) NOT NULL,
    "toValue" VARCHAR(40) NOT NULL,
    "actorName" VARCHAR(200) NOT NULL,
    "reason" VARCHAR(500) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_access_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_usernameKey_key" ON "tenant_accounts"."accounts"("usernameKey");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_emailKey_key" ON "tenant_accounts"."accounts"("emailKey");

-- CreateIndex
CREATE INDEX "accounts_role_status_idx" ON "tenant_accounts"."accounts"("role", "status");

-- CreateIndex
CREATE INDEX "accounts_displayName_idx" ON "tenant_accounts"."accounts"("displayName");

-- CreateIndex
CREATE INDEX "account_access_changes_accountId_createdAt_idx" ON "tenant_accounts"."account_access_changes"("accountId", "createdAt");

