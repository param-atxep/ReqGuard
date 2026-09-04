"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Analysis = {
  id: string; fileName: string; fileType: string | null; status: string;
  requirements: number; issuesCount: number; confidence: number | null;
  createdAt: Date; project: { name: string } | null;
  _count: { findings: number; requirementsData: number };
};

const statuses = ["ALL", "COMPLETED", "PROCESSING", "QUEUED", "FAILED"];

export default function AnalysisClient({ analyses }: { analyses: Analysis[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const filtered = useMemo(() => analyses.filter((analysis) => {
    const matchesStatus = status === "ALL" || analysis.status === status;
    const haystack = `${analysis.fileName} ${analysis.project?.name || ""}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase().trim());
  }), [analyses, query, status]);
  const completed = analyses.filter((analysis) => analysis.status === "COMPLETED");
  const findings = analyses.reduce((total, analysis) => total + analysis._count.findings, 0);
  const average = completed.length ? Math.round(completed.reduce((total, analysis) => total + (analysis.confidence || 0), 0) / completed.length * 100) : 0;

  return <section className="py-7">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Analysis</h1><p className="mt-2 text-sm text-[#8b949e]">Monitor requirement intelligence, quality scores, and review readiness.</p></div><Link href="/upload" className="inline-flex h-10 items-center justify-center rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006]">New analysis</Link></div>
    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["Total analyses", analyses.length], ["Completed", completed.length], ["Findings detected", findings], ["Avg. quality", `${average}%`]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="text-xs text-[#737b85]">{label}</p><p className="mt-2 text-xl font-semibold text-white">{value}</p></div>)}</div>
    <div className="mb-4 flex flex-col gap-3 sm:flex-row"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files or projects" className="h-10 min-w-0 flex-1 rounded-lg border border-white/[0.09] bg-black/30 px-3 text-sm text-white outline-none placeholder:text-[#737b85] focus:border-[#e3b341]/60" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-white/[0.09] bg-black/30 px-3 text-sm text-white">{statuses.map((item) => <option key={item} value={item}>{item === "ALL" ? "All statuses" : item}</option>)}</select></div>
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025]">{filtered.length === 0 ? <div className="p-16 text-center"><p className="text-sm text-[#d8dee4]">{analyses.length ? "No analyses match these filters." : "No analyses have been completed yet."}</p><p className="mt-2 text-xs text-[#737b85]">Upload a requirements file to start your first analysis.</p></div> : <table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#111] text-xs uppercase tracking-wider text-[#737b85]"><tr><th className="p-4">Analysis</th><th className="p-4">Project</th><th className="p-4">Status</th><th className="p-4">Requirements</th><th className="p-4">Findings</th><th className="p-4">Quality</th><th className="p-4">Created</th></tr></thead><tbody>{filtered.map((analysis) => <tr key={analysis.id} className="border-t border-white/[0.06]"><td className="p-4"><Link href={`/analysis/${analysis.id}`} className="font-medium text-white hover:text-[#e3b341]">{analysis.fileName}</Link><p className="mt-1 text-xs text-[#737b85]">{analysis.fileType || "File"}</p></td><td className="p-4 text-[#8b949e]">{analysis.project?.name || "Workspace"}</td><td className="p-4 text-xs text-[#e3b341]">{analysis.status}</td><td className="p-4 text-[#d8dee4]">{analysis._count.requirementsData || analysis.requirements}</td><td className="p-4 text-[#d8dee4]">{analysis._count.findings}</td><td className="p-4 text-[#8b949e]">{analysis.confidence == null ? "—" : `${Math.round(analysis.confidence * 100)}%`}</td><td className="p-4 text-xs text-[#8b949e]">{new Date(analysis.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>}</div>
  </section>;
}
