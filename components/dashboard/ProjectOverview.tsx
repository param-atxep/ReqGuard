"use client";

import { Users } from "lucide-react";

type Project = {
  id: string;
  name: string;
  completed: number;
  inReview: number;
  active: number;
  archived: number;
  total: number;
};

type Contributor = {
  id: string;
  name: string;
  avatar?: string;
  projects: number;
  issuesResolved: number;
};

export default function ProjectOverview({ projects, contributors }: { projects: Project[]; contributors: Contributor[] }) {
  const overall = projects.reduce(
    (acc, project) => ({
      completed: acc.completed + project.completed,
      inReview: acc.inReview + project.inReview,
      active: acc.active + project.active,
      archived: acc.archived + project.archived,
      total: acc.total + project.total,
    }),
    { completed: 0, inReview: 0, active: 0, archived: 0, total: 0 },
  );
  const percentage = (value: number) => (overall.total ? Math.round((value / overall.total) * 100) : 0);
  const progress = [
    { label: "Completed", value: overall.completed, color: "#3fb950" },
    { label: "In review", value: overall.inReview, color: "#e3b341" },
    { label: "Active", value: overall.active, color: "#58a6ff" },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-5" aria-labelledby="project-progress-title">
        <h2 id="project-progress-title" className="text-base font-semibold tracking-tight text-white">Project progress</h2>
        <p className="mt-1 text-xs text-[#737b85]">Aggregate status across projects</p>
        <div className="mt-6 space-y-4">
          {progress.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-[#8b949e]">{item.label}</span>
                <span className="text-[#d8dee4]">{item.value} <span className="text-[#626a73]">({percentage(item.value)}%)</span></span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full" style={{ width: `${percentage(item.value)}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-5" aria-labelledby="contributors-title">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="contributors-title" className="text-base font-semibold tracking-tight text-white">Top contributors</h2>
            <p className="mt-1 text-xs text-[#737b85]">People improving your requirements</p>
          </div>
          <Users size={17} className="text-[#737b85]" aria-hidden="true" />
        </div>
        <div className="mt-5 space-y-3">
          {contributors.map((contributor) => (
            <div key={contributor.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1b1b1b] text-[10px] font-semibold text-[#e3b341]">
                  {contributor.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-[#d8dee4]">{contributor.name}</span>
                  <span className="block text-[10px] text-[#626a73]">{contributor.projects} projects</span>
                </span>
              </div>
              <span className="shrink-0 text-[10px] text-[#737b85]">{contributor.issuesResolved} resolved</span>
            </div>
          ))}
          {contributors.length === 0 && <p className="py-6 text-center text-xs text-[#737b85]">No contributors yet.</p>}
        </div>
      </section>
    </div>
  );
}
