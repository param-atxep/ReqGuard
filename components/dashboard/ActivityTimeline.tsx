"use client";

import { CheckCircle2, FileSearch, GitPullRequest, UploadCloud } from "lucide-react";
import Link from "next/link";

type TimelineItem = {
  id: string;
  title: string;
  subtitle?: string;
  time: string;
  icon?: string;
};

export default function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  const iconFor = (icon?: string) => {
    if (icon === "upload") return UploadCloud;
    if (icon === "review") return GitPullRequest;
    if (icon === "analysis") return FileSearch;
    return CheckCircle2;
  };

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-5" aria-labelledby="activity-title">
      <div className="flex items-start justify-between">
        <div>
          <h2 id="activity-title" className="text-base font-semibold tracking-tight text-white">Activity timeline</h2>
          <p className="mt-1 text-xs text-[#737b85]">A history of recent workspace events</p>
        </div>
        <Link href="/history" className="text-xs font-medium text-[#8b949e] hover:text-white">View history</Link>
      </div>
      <div className="mt-5 space-y-0">
        {items.map((item, index) => {
          const Icon = iconFor(item.icon);
          return (
            <div key={`${item.id}-${index}`} className="flex gap-3">
              <div className="flex w-8 shrink-0 flex-col items-center">
                <span className="z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] bg-[#171717] text-[#e3b341]">
                  <Icon size={14} aria-hidden="true" />
                </span>
                {index < items.length - 1 && <span className="h-9 w-px bg-white/[0.1]" />}
              </div>
              <div className="min-w-0 flex-1 pb-5">
                <p className="truncate text-xs font-medium text-[#d8dee4]">{item.title}</p>
                <p className="mt-1 text-[11px] text-[#737b85]">{item.subtitle || "Workspace activity"}</p>
              </div>
              <time className="shrink-0 pt-1 text-[10px] text-[#626a73]">{item.time}</time>
            </div>
          );
        })}
        {items.length === 0 && <p className="py-7 text-center text-xs text-[#737b85]">No activity recorded yet.</p>}
      </div>
    </section>
  );
}
