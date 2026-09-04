"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

type SeverityCounts = { critical: number; high: number; medium: number; low: number };

export default function RightPanel({
  severityCounts,
  totalIssues,
}: {
  severityCounts: SeverityCounts;
  totalIssues: number;
}) {
  const data = [
    { name: "Critical", value: severityCounts.critical, color: "#f85149" },
    { name: "High", value: severityCounts.high, color: "#e3b341" },
    { name: "Medium", value: severityCounts.medium, color: "#d29922" },
    { name: "Low", value: severityCounts.low, color: "#3fb950" },
  ];
  const chartData = totalIssues > 0 ? data : [{ name: "No findings", value: 1, color: "#272727" }];

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-5" aria-labelledby="severity-title">
      <div className="flex items-start justify-between">
        <div>
          <h2 id="severity-title" className="text-base font-semibold tracking-tight text-white">Findings by severity</h2>
          <p className="mt-1 text-xs text-[#737b85]">Current workspace distribution</p>
        </div>
        <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] text-[#737b85]">All time</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-[164px] w-[164px] shrink-0" aria-label={`${totalIssues} total findings`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={76} paddingAngle={totalIssues ? 3 : 0} stroke="none">
                {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              {totalIssues > 0 && <Tooltip contentStyle={{ background: "#161616", border: "1px solid #303030", borderRadius: 8, fontSize: 11 }} />}
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tracking-tight text-white">{totalIssues}</span>
            <span className="text-[10px] text-[#737b85]">findings</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-2 text-[#8b949e]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="font-medium text-[#e6edf3]">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
