ALTER TABLE "User"
  ADD COLUMN "coverImage" TEXT,
  ADD COLUMN "website" TEXT,
  ADD COLUMN "firstName" TEXT,
  ADD COLUMN "lastName" TEXT,
  ADD COLUMN "displayName" TEXT,
  ADD COLUMN "passwordChangedAt" TIMESTAMP(3),
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

ALTER TABLE "Session"
  ADD COLUMN "ipAddress" TEXT,
  ADD COLUMN "deviceName" TEXT,
  ADD COLUMN "deviceType" TEXT,
  ADD COLUMN "browser" TEXT,
  ADD COLUMN "os" TEXT,
  ADD COLUMN "lastActiveAt" TIMESTAMP(3),
  ADD COLUMN "revokedAt" TIMESTAMP(3);

ALTER TABLE "UserSettings"
  ADD COLUMN "twoFactorSecretHash" TEXT,
  ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN "accentColor" TEXT NOT NULL DEFAULT '#e3b341',
  ADD COLUMN "dateFormat" TEXT NOT NULL DEFAULT 'MMM d, yyyy',
  ADD COLUMN "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "profileVisibility" TEXT NOT NULL DEFAULT 'team',
  ADD COLUMN "showActivity" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "emailAnalysisComplete" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "emailNewMember" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "emailWeeklyReport" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "emailSecurityAlerts" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "pushMentions" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "pushComments" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "pushReports" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "ApiKey" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_userId_revokedAt_createdAt_idx" ON "ApiKey"("userId", "revokedAt", "createdAt");
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "RecoveryCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RecoveryCode_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RecoveryCode_codeHash_key" ON "RecoveryCode"("codeHash");
CREATE INDEX "RecoveryCode_userId_usedAt_idx" ON "RecoveryCode"("userId", "usedAt");
ALTER TABLE "RecoveryCode" ADD CONSTRAINT "RecoveryCode_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Session_userId_revokedAt_lastActiveAt_idx" ON "Session"("userId", "revokedAt", "lastActiveAt");
