"use client";

import { useState } from "react";

type Analysis = { id: string; fileName: string };
type Report = { id: string; name: string; version: number; createdAt: Date; analysis: { fileName: string } | null };

export default function ReportsClient({ analyses, reports: initialReports }: { analyses: Analysis[]; reports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [analysisId, setAnalysisId] = useState(analyses[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function generate() {
    if (!analysisId) return;
    setSaving(true); setError("");
    const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysisId }) });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Unable to generate report");
    else setReports((current) => [data.report, ...current]);
    setSaving(false);
  }
  async function remove(id: string) {
    const response = await fetch(`/api/reports/${id}`, { method: "DELETE" });
    if (response.ok) setReports((current) => current.filter((report) => report.id !== id));
    else setError("Unable to delete report");
  }
  return <section className="py-7">
    <div className="mb-7"><p className="text-xs font-medium uppercase tracking-[0.17em] text-[#e3b341]">Deliverables</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Reports</h1><p className="mt-2 text-sm text-[#8b949e]">Generate durable reports from completed analyses.</p></div>
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-5"><div className="flex flex-col gap-3 sm:flex-row"><select value={analysisId} onChange={(event) => setAnalysisId(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-white/[0.09] bg-black/30 px-3 text-sm text-white"><option value="">Select completed analysis</option>{analyses.map((analysis) => <option key={analysis.id} value={analysis.id}>{analysis.fileName}</option>)}</select><button type="button" onClick={generate} disabled={!analysisId || saving} className="h-10 rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006] disabled:opacity-50">{saving ? "Generating..." : "Generate report"}</button></div>{error && <p className="mt-3 text-xs text-[#f85149]">{error}</p>}</div>
    <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.025]">{reports.length === 0 ? <div className="p-16 text-center text-sm text-[#8b949e]">Generate a report from a completed analysis to see it here.</div> : <table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-[#737b85]"><tr><th className="p-4">Report</th><th className="p-4">Analysis</th><th className="p-4">Version</th><th className="p-4">Created</th><th className="p-4">Downloads</th><th className="p-4">Actions</th></tr></thead><tbody>{reports.map((report) => <tr key={report.id} className="border-t border-white/[0.06]"><td className="p-4 font-medium text-white">{report.name}</td><td className="p-4 text-[#8b949e]">{report.analysis?.fileName || "Analysis removed"}</td><td className="p-4 text-[#8b949e]">v{report.version}</td><td className="p-4 text-xs text-[#8b949e]">{new Date(report.createdAt).toLocaleString()}</td><td className="p-4"><div className="flex gap-2 text-xs"><a href={`/api/reports/${report.id}?format=pdf`} className="text-[#e3b341] hover:text-white">PDF</a><a href={`/api/reports/${report.id}?format=docx`} className="text-[#e3b341] hover:text-white">DOCX</a><a href={`/api/reports/${report.id}?format=csv`} className="text-[#e3b341] hover:text-white">CSV</a></div></td><td className="p-4"><button type="button" onClick={() => void remove(report.id)} className="text-xs text-[#f85149] hover:text-white">Delete</button></td></tr>)}</tbody></table>}</div>
  </section>;
}
