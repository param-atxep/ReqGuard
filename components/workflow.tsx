'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileText, FileUp, GitBranch, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react';

const steps = [
  { title: 'Upload', icon: FileUp },
  { title: 'Parse', icon: FileText },
  { title: 'Compare', icon: GitBranch },
  { title: 'Detect', icon: SearchCheck },
  { title: 'Report', icon: Sparkles },
];

export default function Workflow() {
  return (
    <section id="workflow" className="py-16 md:py-20">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]">Workflow</div>
          <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#F0F6FC] md:text-[36px]">
            From document intake to review-ready findings.
          </h2>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-[24px] border border-zinc-800 bg-[#080808] px-4 py-6 md:px-8">
          <svg className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 md:block" aria-hidden="true">
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(227,179,65,0.2)" strokeWidth="1" />
          </svg>

          <div className="relative z-10 grid gap-5 md:grid-cols-5">
            {steps.map(({ title, icon: Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.26, delay: index * 0.05 }}
                className="relative"
              >
                <div className="absolute right-[-12px] top-1/2 hidden -translate-y-1/2 md:block">
                  {index < steps.length - 1 ? <ArrowRight className="h-4 w-4 text-[#8B949E]" /> : null}
                </div>

                <div className="rounded-[20px] border border-zinc-800 bg-black p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-zinc-800 bg-[#080808] text-[#E3B341]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-6 text-[11px] uppercase tracking-[0.16em] text-[#8B949E]">0{index + 1}</div>
                  <div className="mt-2 text-[20px] font-semibold tracking-[-0.04em] text-[#F0F6FC]">{title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
