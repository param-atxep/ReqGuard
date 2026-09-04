CREATE TYPE "RequirementStatus" AS ENUM ('DRAFT', 'READY_FOR_REVIEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RELEASED');

ALTER TABLE "Requirement"
  ADD COLUMN "ownerId" TEXT,
  ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "status" "RequirementStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "RequirementVersion" (
  "id" TEXT NOT NULL,
  "requirementId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "status" "RequirementStatus" NOT NULL,
  "changeSummary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RequirementVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RequirementVersion_requirementId_version_key" ON "RequirementVersion"("requirementId", "version");
CREATE INDEX "RequirementVersion_requirementId_createdAt_idx" ON "RequirementVersion"("requirementId", "createdAt");
CREATE INDEX "Requirement_analysisId_status_idx" ON "Requirement"("analysisId", "status");
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RequirementVersion" ADD CONSTRAINT "RequirementVersion_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RequirementVersion" ADD CONSTRAINT "RequirementVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
