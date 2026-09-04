ALTER TYPE "FindingStatus" ADD VALUE IF NOT EXISTS 'CLOSED';

ALTER TABLE "FindingComment"
  ADD COLUMN "attachment" TEXT,
  ADD COLUMN "mentions" JSONB;

CREATE TABLE "FindingAudit" (
  "id" TEXT NOT NULL,
  "findingId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "fromValue" TEXT,
  "toValue" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FindingAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FindingAudit_findingId_createdAt_idx" ON "FindingAudit"("findingId", "createdAt");
ALTER TABLE "FindingAudit" ADD CONSTRAINT "FindingAudit_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FindingAudit" ADD CONSTRAINT "FindingAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
