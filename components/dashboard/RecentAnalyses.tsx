"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, FileText, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";

type AnalysisRow = {
  id: string;
  fileName: string;
  projectName: string;
  issues: number;
  status: string;
  date: string;
  fileType?: string;
};

export default function RecentAnalyses({ rows }: { rows: AnalysisRow[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesFilter = filter === "All" || row.status.toLowerCase() === filter.toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        row.fileName.toLowerCase().includes(normalizedQuery) ||
        row.projectName.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query, rows]);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]" aria-labelledby="recent-analyses-title">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="recent-analyses-title" className="text-base font-semibold tracking-tight text-white">Recent analyses</h2>
          <p className="mt-1 text-xs text-[#737b85]">Latest requirement documents processed by your team</p>
        </div>
        <Link href="/analysis" className="inline-flex items-center gap-1 self-start text-xs font-medium text-[#e3b341] hover:text-[#f7d774] sm:self-auto">
          View all <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="flex flex-col gap-2 border-b border-white/[0.07] p-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#626a73]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter analyses..."
            aria-label="Filter analyses"
            className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-8 pr-3 text-xs text-white outline-none placeholder:text-[#626a73] focus:border-[#e3b341]/50"
          />
        </label>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          aria-label="Filter by analysis status"
          className="h-9 rounded-lg border border-white/[0.08] bg-[#111] px-3 text-xs text-[#aab2bb] outline-none focus:border-[#e3b341]/50"
        >
          <option>All</option>
          <option>Completed</option>
          <option>Processing</option>
          <option>Failed</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <caption className="sr-only">Recent requirement analyses</caption>
          <thead>
            <tr className="border-b border-white/[0.07] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#626a73]">
              <th scope="col" className="px-5 py-3 font-semibold">Document</th>
              <th scope="col" className="px-3 py-3 font-semibold">Project</th>
              <th scope="col" className="px-3 py-3 font-semibold">Findings</th>
              <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              <th scope="col" className="px-3 py-3 font-semibold">Date</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold"> </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const type = (row.fileType || row.fileName.split(".").pop() || "file").toUpperCase();
              const status = row.status || "Completed";
              return (
                <tr key={row.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.025]">
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e3b341]/10 text-[#e3b341]">
                        <FileText size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <Link href={`/analysis/${row.id}`} className="block max-w-[230px] truncate text-xs font-medium text-[#e6edf3] hover:text-[#e3b341]">{row.fileName}</Link>
                        <span className="block text-[10px] uppercase tracking-wider text-[#626a73]">{type}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-xs text-[#8b949e]">{row.projectName}</td>
                  <td className="px-3 py-4 text-xs font-medium text-[#e6edf3]">{row.issues}</td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${status.toLowerCase() === "completed" ? "text-[#3fb950]" : status.toLowerCase() === "failed" ? "text-[#f85149]" : "text-[#e3b341]"}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-xs text-[#737b85]">{row.date}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/analysis/${row.id}`} className="inline-flex rounded-lg p-1.5 text-[#737b85] hover:bg-white/[0.07] hover:text-white" aria-label={`Open actions for ${row.fileName}`}>
                      <MoreHorizontal size={16} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-xs text-[#737b85]">No analyses match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
