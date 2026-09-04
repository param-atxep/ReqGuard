import DashboardShell from "../../components/dashboard/DashboardShell";
import AnalysisClient from "../../components/analysis/AnalysisClient";
import prisma from "../../lib/prisma";
import { requirePageAuth } from "../../lib/session";

export default async function AnalysisPage() {
  const session = await requirePageAuth();
  const analyses = await prisma.analysis.findMany({
    where: { ownerId: session.user?.id as string },
    select: {
      id: true, fileName: true, fileType: true, status: true, requirements: true,
      issuesCount: true, confidence: true, createdAt: true,
      project: { select: { name: true } },
      _count: { select: { findings: true, requirementsData: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}>
    <AnalysisClient analyses={analyses} />
  </DashboardShell>;
}
