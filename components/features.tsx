'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeAlert, CheckCheck, FileSearch, ShieldAlert } from 'lucide-react';

const features = [
  {
    label: 'Conflict Analysis',
    title: 'Conflict Detection',
    description: 'Detect contradictory requirements automatically across functional, non-functional, and stakeholder-defined constraints.',
    icon: ShieldAlert,
  },
  {
    label: 'Quality Signals',
    title: 'Consistency Checking',
    description: 'Validate logical consistency across requirement sets and traceability links before implementation starts.',
    icon: CheckCheck,
  },
  {
    label: 'Deduplication',
    title: 'Duplicate Detection',
    description: 'Spot repeated or semantically similar requirements to reduce noise and improve alignment across teams.',
    icon: FileSearch,
  },
  {
    label: 'Clarity Review',
    title: 'Ambiguity Detection',
    description: 'Highlight vague or unclear statements so requirement owners can tighten scope and acceptance criteria.',
    icon: BadgeAlert,
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-20">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]">Capabilities</div>
          <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#F0F6FC] md:text-[36px]">
            Detect the issues that create rework before code ships.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map(({ label, title, description, icon: Icon }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              className="group rounded-[20px] border border-zinc-800 bg-[#080808] p-6 transition-colors duration-220 hover:border-[#E3B341]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-zinc-800 bg-black text-[#E3B341]">
                  <Icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#8B949E] transition-transform duration-220 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#E3B341]" />
              </div>

              <div className="mt-6 text-[11px] uppercase tracking-[0.16em] text-[#8B949E]">{label}</div>
              <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.04em] text-[#F0F6FC]">{title}</h3>
              <p className="mt-4 text-[16px] leading-7 text-[#8B949E]">{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
