import Link from "next/link";
import DashboardShell from "../../../components/dashboard/DashboardShell";
import prisma from "../../../lib/prisma";
import { requirePageAuth } from "../../../lib/session";

export default async function AnalysisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePageAuth();
  const userId = session.user?.id as string;
  const { id } = await params;
  const analysis = await prisma.analysis.findFirst({
    where: { id, ownerId: userId },
    include: { project: true, requirementsData: { orderBy: { key: "asc" } }, findings: { include: { requirement: true }, orderBy: { severity: "desc" } } },
  });
  if (!analysis) return <DashboardShell user={session.user as { name?: string; role?: string; image?: string }}><section className="py-16 text-center"><h1 className="text-2xl font-semibold">Analysis not found</h1><Link className="mt-4 inline-block text-sm text-[#e3b341]" href="/analysis">Back to analysis</Link></section></DashboardShell>;
  const requirements = analysis.requirementsData as Array<{ id: string; key: string; text: string }>;
  const findings = analysis.findings as Array<{ id: string; type: string; requirementId: string | null; description: string | null; title: string; suggestion: string | null }>;
  const byType = (type: string) => findings.filter((finding) => finding.type === type).length;
  const user = session.user as { name?: string; role?: string; image?: string };
  return <DashboardShell user={user}><section className="py-7">
    <Link href="/analysis" className="text-xs text-[#e3b341] hover:text-white">← Back to analysis</Link>
    <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs uppercase tracking-[0.17em] text-[#e3b341]">Requirement intelligence</p><h1 className="mt-2 text-3xl font-semibold">{analysis.fileName}</h1><p className="mt-2 text-sm text-[#8b949e]">{analysis.project?.name || "Workspace analysis"} · {analysis.status} · {analysis.createdAt.toLocaleString()}</p></div><Link href={analysis.projectId ? `/issues?projectId=${analysis.projectId}` : "/issues"} className="inline-flex h-10 items-center justify-center rounded-lg border border-white/[0.1] px-4 text-xs text-white hover:border-[#e3b341]/50">View findings</Link></div>
    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">{[["Requirements", requirements.length], ["Findings", findings.length], ["Conflicts", byType("CONFLICT")], ["Duplicates", byType("DUPLICATE")], ["Ambiguities", byType("AMBIGUITY")]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="text-xs text-[#737b85]">{label}</p><p className="mt-2 text-xl font-semibold text-white">{value}</p></div>)}</div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]"><section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-sm font-semibold">Requirement explorer</h2><div className="mt-3 divide-y divide-white/[0.07]">{requirements.map((requirement) => <details key={requirement.id} className="py-3"><summary className="cursor-pointer list-none text-sm text-white"><span className="mr-3 font-mono text-xs text-[#e3b341]">{requirement.key}</span>{requirement.text}</summary><div className="mt-3 pl-14 text-xs text-[#8b949e]">{findings.filter((finding) => finding.requirementId === requirement.id).map((finding) =>     <Link href={`/analysis/${analysis.id}/finding/${finding.id}`} key={finding.id} className="mb-2 block hover:text-white"><span className="text-[#e3b341]">{finding.type}</span> — {finding.description || finding.title}<br /><span className="text-[#b9c0c8]">Recommendation: {finding.suggestion || "Review this requirement."}</span></Link>)}</div></details>)}</div></section><section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-sm font-semibold">AI executive summary</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#8b949e]">{analysis.summary || "No executive summary was generated."}</p><div className="mt-6 space-y-3 text-xs"><div className="flex justify-between"><span className="text-[#737b85]">Overall quality</span><span>{analysis.confidence == null ? "—" : `${Math.round(analysis.confidence * 100)}/100`}</span></div><div className="flex justify-between"><span className="text-[#737b85]">AI model</span><span>{analysis.aiModel || "—"}</span></div><div className="flex justify-between"><span className="text-[#737b85]">Processing time</span><span>{analysis.processingMs == null ? "—" : `${analysis.processingMs} ms`}</span></div></div></section></div>
  </section></DashboardShell>;
}
