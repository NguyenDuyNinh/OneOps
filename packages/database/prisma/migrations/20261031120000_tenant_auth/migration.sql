-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tenant_auth";

-- CreateTable
CREATE TABLE "tenant_auth"."auth_sessions" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "agent" VARCHAR(300) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_tokenHash_key" ON "tenant_auth"."auth_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_sessions_accountId_expiresAt_idx" ON "tenant_auth"."auth_sessions"("accountId", "expiresAt");

-- CreateIndex
CREATE INDEX "auth_sessions_expiresAt_idx" ON "tenant_auth"."auth_sessions"("expiresAt");

