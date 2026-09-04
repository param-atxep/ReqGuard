"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Lightbulb, Sparkles } from "lucide-react";

export default function AIRecommendation({ description }: { description?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#e3b341]/20 bg-gradient-to-br from-[#17140c] via-[#100f0b] to-[#0d0d0d] p-5 sm:p-6" aria-labelledby="ai-recommendation-title">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#e3b341]/10 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e3b341]/25 bg-[#e3b341]/10 text-[#e3b341]">
            <Lightbulb size={20} aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="ai-recommendation-title" className="text-base font-semibold text-white">AI recommendation</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e3b341]/10 px-2 py-0.5 text-[10px] font-medium text-[#e3b341]">
                <Sparkles size={10} /> Insight
              </span>
            </div>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[#a89d80]">
              {description || "Run an analysis to receive prioritized suggestions that improve requirement quality and reduce delivery risk."}
            </p>
            <motion.button
              type="button"
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#e3b341] px-3.5 py-2 text-xs font-semibold text-[#171006] hover:bg-[#f0c75e]"
            >
              View recommendation <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
        <div className="hidden h-20 w-44 shrink-0 items-end gap-1.5 sm:flex" aria-hidden="true">
          {[28, 42, 34, 58, 49, 72, 64, 86, 76, 94].map((height, index) => (
            <span key={index} className="w-2 rounded-t-sm bg-[#e3b341]/30" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}
