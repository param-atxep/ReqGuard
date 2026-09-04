import Link from "next/link";
import { ArrowRight, Plus, ShieldCheck } from "lucide-react";
import prisma from "../../lib/prisma";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import AIRecommendation from "../../components/dashboard/AIRecommendation";
import DashboardShell from "../../components/dashboard/DashboardShell";
import KPICards from "../../components/dashboard/KPICards";
import ProjectOverview from "../../components/dashboard/ProjectOverview";
import RecentAnalyses from "../../components/dashboard/RecentAnalyses";
import RightPanel from "../../components/dashboard/RightPanel";
import { requirePageAuth } from "../../lib/session";

export const dynamic = "force-dynamic";

async function safeCount(modelName: string, args?: unknown) {
  try {
    const model = (prisma as any)[modelName];
    if (model && typeof model.count === "function") return await model.count(args);
  } catch {
    // Optional models may not exist in every deployment.
  }
  return 0;
}

async function safeFindMany(modelName: string, args?: unknown): Promise<any[]> {
  try {
    const model = (prisma as any)[modelName];
    if (model && typeof model.findMany === "function") return await model.findMany(args);
  } catch {
    // Optional models may not exist in every deployment.
  }
  return [];
}

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function DashboardPage() {
  const session = await requirePageAuth();
  const ownerId = session?.user?.id as string | undefined;
  const [totalProjects, totalAnalyses, totalIssues, resolvedIssues, totalRequirements] = await Promise.all([
    safeCount("project", { where: ownerId ? { ownerId } : undefined }),
    safeCount("analysis", { where: ownerId ? { ownerId } : undefined }),
    safeCount("finding", { where: ownerId ? { analysis: { ownerId }, status: { notIn: ["RESOLVED", "WONT_FIX"] } } : { status: { notIn: ["RESOLVED", "WONT_FIX"] } } }),
    safeCount("finding", { where: ownerId ? { analysis: { ownerId }, status: "RESOLVED" } : { status: "RESOLVED" } }),
    safeCount("requirement", { where: ownerId ? { analysis: { ownerId } } : undefined }),
  ]);

  let accuracy = 0;
  try {
    const model = (prisma as any).analysis;
    if (model && typeof model.aggregate === "function") {
      const aggregate = await model.aggregate({ where: ownerId ? { ownerId } : undefined, _avg: { confidence: true } });
      if (typeof aggregate?._avg?.accuracy === "number") accuracy = Number(aggregate._avg.accuracy.toFixed(1));
      else if (typeof aggregate?._avg?.confidence === "number") accuracy = Number((aggregate._avg.confidence * 100).toFixed(1));
    }
  } catch {
    // Accuracy is optional until analysis records are available.
  }

  let recentAnalyses: Array<{
    id: string;
    fileName: string;
    projectName: string;
    issues: number;
    status: string;
    date: string;
    fileType?: string;
  }> = [];
  const analysisRecords = await safeFindMany("analysis", { where: ownerId ? { ownerId } : undefined, include: { project: true }, orderBy: { createdAt: "desc" }, take: 5 });
  recentAnalyses = analysisRecords.map((record: any) => ({
    id: String(record.id),
    fileName: record.fileName || record.name || "Requirement analysis",
    projectName: record.project?.name || record.projectName || "Workspace",
    issues: Number(record.issuesCount || record.issueCount || 0),
    status: record.status || "Completed",
    date: formatDate(record.createdAt),
    fileType: record.fileType || record.type,
  }));

  const projects = await safeFindMany("project", { where: ownerId ? { ownerId } : undefined, take: 6, orderBy: { createdAt: "desc" } });
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  const issueGroups = await (async () => {
    try {
      const model = (prisma as any).finding;
      return model && typeof model.groupBy === "function"
        ? await model.groupBy({ by: ["severity"], where: ownerId ? { analysis: { ownerId } } : undefined, _count: { severity: true } })
        : [];
    } catch {
      return [];
    }
  })();
  issueGroups.forEach((group: any) => {
    const severity = String(group.severity || "").toLowerCase();
    if (severity in severityCounts) severityCounts[severity as keyof typeof severityCounts] = Number(group._count?.severity || 0);
  });
  const groupedIssues = Object.values(severityCounts).reduce((sum, value) => sum + value, 0);
  const totalIssuesCount = groupedIssues || totalIssues;

  const activityRecords = await safeFindMany("activityLog", { where: ownerId ? { userId: ownerId } : undefined, take: 5, orderBy: { createdAt: "desc" } });
  const history = activityRecords.map((record: any) => ({
    id: String(record.id),
    title: record.title,
    subtitle: record.message || String(record.type).toLowerCase(),
    time: formatDate(record.createdAt),
    icon: record.type === "UPLOAD" ? "upload" : record.type === "REPORT" ? "review" : "analysis",
  }));

  const users = await safeFindMany("user", { where: ownerId ? { id: ownerId } : undefined, take: 5, orderBy: { createdAt: "desc" } });
  const contributors = users.map((user: any) => ({
    id: String(user.id),
    name: user.fullName || user.username || "Team member",
    projects: 0,
    issuesResolved: 0,
  }));
  const projectsOverview = projects.map((project: any) => ({ id: String(project.id), name: project.name, completed: project.status === "COMPLETED" ? 1 : 0, inReview: project.status === "REVIEW" ? 1 : 0, active: project.status === "ACTIVE" ? 1 : 0, archived: project.status === "ARCHIVED" ? 1 : 0, total: 1 }));

  const user = session?.user as { name?: string; fullName?: string; role?: string; image?: string } | undefined;
  return (
    <DashboardShell user={user}>
      <section className="mb-7 flex flex-col justify-between gap-5 pt-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Good to see you</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Welcome back, {user?.name || user?.fullName || "Param"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#8b949e]">Monitor requirement quality, uncover risks, and keep every project moving with confidence.</p>
        </div>
        <Link href="/upload" className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006] shadow-[0_6px_24px_rgba(227,179,65,0.16)] transition hover:bg-[#f0c75e] sm:self-auto">
          <Plus size={16} /> New analysis <ArrowRight size={14} />
        </Link>
      </section>

      <KPICards metrics={{ totalAnalyses, totalIssues: totalIssuesCount, resolvedIssues, accuracy }} />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,0.85fr)]">
        <RecentAnalyses rows={recentAnalyses} />
        <RightPanel severityCounts={severityCounts} totalIssues={totalIssuesCount} />
      </div>

      <div className="mt-5">
        <AIRecommendation description="Your workspace is ready for its next quality pass. Analyze a requirements document to surface ambiguity, conflicts, and traceability gaps before they become delivery risk." />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.5fr)]">
        <ActivityTimeline items={history} />
        <ProjectOverview projects={projectsOverview} contributors={contributors} />
      </div>

      {!totalProjects && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 text-xs text-[#8b949e]">
          <ShieldCheck size={17} className="text-[#e3b341]" aria-hidden="true" />
          Connect your workspace data to unlock live project and team insights.
        </div>
      )}
    </DashboardShell>
  );
}
