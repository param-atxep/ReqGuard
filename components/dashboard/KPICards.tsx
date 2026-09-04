"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Activity, CheckCircle2, FileSearch, ShieldAlert } from "lucide-react";

export default function KPICards({
  metrics,
}: {
  metrics: {
    totalAnalyses: number;
    totalIssues: number;
    resolvedIssues: number;
    accuracy: number;
  };
}) {
  const reduceMotion = useReducedMotion();
  const cards = [
    {
      key: "analyses",
      title: "Total analyses",
      value: metrics.totalAnalyses,
      trend: "Across your workspace",
      icon: FileSearch,
      color: "#e3b341",
    },
    {
      key: "issues",
      title: "Open findings",
      value: metrics.totalIssues,
      trend: "Requiring attention",
      icon: ShieldAlert,
      color: "#f85149",
    },
    {
      key: "resolved",
      title: "Resolved findings",
      value: metrics.resolvedIssues,
      trend: "Quality improvements",
      icon: CheckCircle2,
      color: "#3fb950",
    },
    {
      key: "accuracy",
      title: "Average confidence",
      value: `${metrics.accuracy.toFixed(1)}%`,
      trend: "Model confidence",
      icon: Activity,
      color: "#58a6ff",
    },
  ];

  return (
    <section aria-label="Workspace metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.key}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl border"
                style={{ color: card.color, backgroundColor: `${card.color}12`, borderColor: `${card.color}30` }}
              >
                <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-[#737b85]">Live</span>
            </div>
            <p className="mt-5 text-xs font-medium text-[#8b949e]">{card.title}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{card.value}</p>
            <p className="mt-2 text-[11px] text-[#626a73]">{card.trend}</p>
          </motion.article>
        );
      })}
    </section>
  );
}
