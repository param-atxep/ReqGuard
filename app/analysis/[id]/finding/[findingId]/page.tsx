import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardShell from "../../../../../components/dashboard/DashboardShell";
import prisma from "../../../../../lib/prisma";
import { requirePageAuth } from "../../../../../lib/session";

export default async function FindingPage({ params }: { params: Promise<{ id: string; findingId: string }> }) {
  const session = await requirePageAuth();
  const userId = session.user?.id as string;
  const { id: analysisId, findingId } = await params;
  const finding = await prisma.finding.findFirst({ where: { id: findingId, analysisId, analysis: { ownerId: userId } }, include: { requirement: true, analysis: { include: { project: true } } } });
  if (!finding) notFound();
  const user = session.user as { name?: string; role?: string; image?: string };
  return <DashboardShell user={user}><section className="py-7"><Link href={`/analysis/${analysisId}`} className="text-xs text-[#e3b341]">← Back to analysis</Link><p className="mt-6 text-xs uppercase tracking-[0.17em] text-[#e3b341]">Finding intelligence</p><h1 className="mt-2 text-3xl font-semibold">{finding.title}</h1><p className="mt-2 text-sm text-[#8b949e]">{finding.analysis.project?.name || "Project"} · {finding.type}</p><div className="mt-6 grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-sm font-semibold">Original requirement</h2><p className="mt-4 font-mono text-xs text-[#e3b341]">{finding.requirement?.key || "Requirement"}</p><p className="mt-2 text-sm leading-6 text-[#d8dee4]">{finding.requirement?.text || "No requirement text is associated with this finding."}</p></section><section className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-sm font-semibold">Detection details</h2><div className="mt-4 space-y-3 text-sm"><p><span className="text-[#737b85]">Severity:</span> <span className="text-[#e3b341]">{finding.severity}</span></p><p><span className="text-[#737b85]">Confidence:</span> {finding.confidence == null ? "—" : `${Math.round(finding.confidence * 100)}%`}</p><p className="leading-6 text-[#8b949e]">{finding.description}</p></div></section></div><section className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><h2 className="text-sm font-semibold">Suggested rewrite</h2><p className="mt-3 text-sm leading-6 text-[#d8dee4]">{finding.suggestion || "No rewrite suggestion is available."}</p></section></section></DashboardShell>;
}
