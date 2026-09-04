import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import prisma from "../../../lib/prisma";
import { requirePageAuth } from "../../../lib/session";
import RequirementsTable from "../../../components/projects/RequirementsTable";

type FindingSummary = { severity: string; status: string };
type AnalysisSummary = { id: string; fileName: string; status: string; createdAt: Date; _count: { findings: number; requirementsData: number } };
type ReportSummary = { id: string; name: string; version: number; createdAt: Date; analysisId: string | null };
type RequirementSummary = { id: string; key: string; text: string; category: string | null; priority: string; status: string; version: number; analysisId: string };

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePageAuth();
  const userId = session.user?.id as string;
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, ownerId: userId },
    include: {
      analyses: { orderBy: { createdAt: "desc" }, take: 10, include: { _count: { select: { findings: true, requirementsData: true } } } },
      reports: { orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { analyses: true } },
    },
  });
  if (!project) notFound();
  const findings = await prisma.finding.findMany({
    where: { analysis: { projectId: id, ownerId: userId } },
    select: { severity: true, status: true },
  });
  const requirements = await prisma.requirement.findMany({
    where: { analysis: { projectId: id, ownerId: userId } },
    select: { id: true, key: true, text: true, category: true, priority: true, status: true, version: true, analysisId: true },
    orderBy: { key: "asc" },
    take: 100,
  }) as RequirementSummary[];
  const findingSummaries = findings as FindingSummary[];
  const analysisSummaries = project.analyses as AnalysisSummary[];
  const reportSummaries = project.reports as ReportSummary[];
  const openFindings = findingSummaries.filter((finding) => !["RESOLVED", "WONT_FIX"].includes(finding.status)).length;
  const severity = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => ({ level, count: findingSummaries.filter((finding) => finding.severity === level).length }));
  const user = session.user as { name?: string; role?: string; image?: string };

  return (
    <DashboardShell user={user}>
      <section className="py-7">
        <Link href="/projects" className="text-xs text-[#e3b341] hover:text-white">← Back to projects</Link>
        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Project</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{project.name}</h1>
            <p className="mt-2 text-sm text-[#8b949e]">{project.description || "No project description yet."}</p>
          </div>
          <Link href={`/upload?projectId=${project.id}`} className="inline-flex h-10 items-center justify-center rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006]">Upload requirements</Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Metric label="Analyses" value={project._count.analyses} />
          <Metric label="Open findings" value={openFindings} />
          <Metric label="Status" value={project.status} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Requirements</h2><p className="mt-1 text-xs text-[#737b85]">Project-scoped review inventory with immutable version numbers.</p></div><span className="text-xs text-[#8b949e]">{requirements.length} shown</span></div>
            <RequirementsTable initial={requirements} />
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
            <h2 className="text-sm font-semibold">Analysis history</h2>
            <div className="mt-4 divide-y divide-white/[0.07]">
              {analysisSummaries.map((analysis) => (
                <Link key={analysis.id} href={`/analysis/${analysis.id}`} className="flex items-center justify-between gap-4 py-4 hover:bg-white/[0.02]">
                  <div className="min-w-0"><p className="truncate text-sm text-white">{analysis.fileName}</p><p className="mt-1 text-xs text-[#737b85]">{analysis.status} · {analysis._count.requirementsData} requirements · {analysis._count.findings} findings</p></div>
                  <span className="shrink-0 text-xs text-[#8b949e]">{analysis.createdAt.toLocaleDateString()}</span>
                </Link>
              ))}
              {!project.analyses.length && <p className="py-8 text-center text-sm text-[#737b85]">Upload a requirements file to create the first analysis.</p>}
            </div>
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
            <h2 className="text-sm font-semibold">Reports</h2>
            <div className="mt-4 divide-y divide-white/[0.07]">{reportSummaries.map((report) => <div key={report.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm text-white">{report.name}</p><p className="mt-1 text-xs text-[#737b85]">Version {report.version}</p></div><span className="text-xs text-[#8b949e]">{report.createdAt.toLocaleDateString()}</span></div>)}{!reportSummaries.length && <p className="py-6 text-center text-sm text-[#737b85]">Reports generated for this project will appear here.</p>}</div>
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5">
            <h2 className="text-sm font-semibold">Findings by severity</h2>
            <div className="mt-5 space-y-3">{severity.map((item) => <div key={item.level} className="flex items-center justify-between text-xs"><span className="text-[#8b949e]">{item.level}</span><span className="font-medium text-white">{item.count}</span></div>)}</div>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="text-xs text-[#737b85]">{label}</p><p className="mt-2 text-xl font-semibold text-white">{value}</p></div>;
}
