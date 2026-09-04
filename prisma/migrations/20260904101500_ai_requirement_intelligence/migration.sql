ALTER TABLE "Analysis"
  ADD COLUMN "aiSummary" JSONB,
  ADD COLUMN "aiRisks" JSONB,
  ADD COLUMN "qualityBreakdown" JSONB,
  ADD COLUMN "testCases" JSONB,
  ADD COLUMN "traceability" JSONB,
  ADD COLUMN "errorMessage" TEXT,
  ADD COLUMN "engineVersion" TEXT;

ALTER TABLE "Requirement"
  ADD COLUMN "aiType" TEXT,
  ADD COLUMN "aiExplanation" TEXT,
  ADD COLUMN "rewrite" TEXT,
  ADD COLUMN "testability" TEXT,
  ADD COLUMN "implementationNotes" TEXT;

ALTER TABLE "Finding"
  ADD COLUMN "whyItMatters" TEXT,
  ADD COLUMN "businessImpact" TEXT,
  ADD COLUMN "evidence" TEXT,
  ADD COLUMN "testability" TEXT,
  ADD COLUMN "rewrite" TEXT,
  ADD COLUMN "relatedRequirementId" TEXT;

ALTER TABLE "Finding"
  ADD CONSTRAINT "Finding_relatedRequirementId_fkey"
  FOREIGN KEY ("relatedRequirementId") REFERENCES "Requirement"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Finding_analysisId_severity_status_idx"
  ON "Finding"("analysisId", "severity", "status");
