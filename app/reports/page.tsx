import DashboardShell from "../../components/dashboard/DashboardShell";
import ReportsClient from "../../components/reports/ReportsClient";
import prisma from "../../lib/prisma";
import { requirePageAuth } from "../../lib/session";

export default async function ReportsPage() {
  const session = await requirePageAuth();
  const userId = session.user?.id as string;
  const [analyses, reports] = await Promise.all([
    prisma.analysis.findMany({ where: { ownerId: userId, status: "COMPLETED" }, select: { id: true, fileName: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.report.findMany({ where: { ownerId: userId }, include: { analysis: { select: { fileName: true } } }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  return <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}><ReportsClient analyses={analyses} reports={reports} /></DashboardShell>;
}
