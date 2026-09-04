'use client';

import { motion } from 'framer-motion';

const pipeline = [
  'PDF',
  'Text Extraction',
  'NLP Parser',
  'Requirement Segmentation',
  'Conflict Detection',
  'Duplicate Detection',
  'Ambiguity Detection',
  'Severity Score',
  'Report Generator',
];

export default function AiEngine() {
  return (
    <section id="ai-engine" className="py-16 md:py-20">
      <div className="section-shell">
        <div className="rounded-[24px] border border-zinc-800 bg-[#080808] p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr] xl:items-center">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]">AI engine</div>
              <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#F0F6FC] md:text-[36px]">
                NLP, reasoning, and traceability in one review layer.
              </h2>
              <p className="mt-5 max-w-lg text-[16px] leading-7 text-[#8B949E]">
                ReqGuard extracts requirement statements from structured submissions, normalizes them, compares overlapping entities, and surfaces contradictions with explainable severity scoring.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
              <div className="rounded-[20px] border border-zinc-800 bg-black p-5">
                <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#8B949E]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#3FB950]" />
                  analysis pipeline
                </div>

                <div className="space-y-3">
                  {pipeline.map((node, index) => (
                    <motion.div
                      key={node}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.22, delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-[#080808] text-[11px] font-medium text-[#E3B341]">
                        {index + 1}
                      </div>
                      <div className="flex-1 rounded-[12px] border border-zinc-800 bg-[#080808] px-3 py-2 text-[13px] text-[#F0F6FC]">
                        {node}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border border-zinc-800 bg-black p-4">
                <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[#8B949E]">
                  <span>terminal</span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#F85149]" />
                    <span className="h-2 w-2 rounded-full bg-[#E3B341]" />
                    <span className="h-2 w-2 rounded-full bg-[#3FB950]" />
                  </span>
                </div>

                <div className="rounded-[12px] border border-zinc-800 bg-[#080808] p-3 font-mono text-[11px] leading-6 text-[#C9D1D9]">
                  <div className="text-[#8B949E]">$ reqguard analyze --srs ./spec.md</div>
                  <div className="mt-2 text-[#F0F6FC]">loading requirements...</div>
                  <div className="mt-1 text-[#E3B341]">found 12 conflicts</div>
                  <div className="mt-1 text-[#F0F6FC]">-- severity: high</div>
                  <div className="mt-1 text-[#3FB950]">status: report generated</div>
                </div>

                <div className="mt-4 rounded-[12px] border border-zinc-800 bg-[#080808] p-3 text-[11px] text-[#8B949E]">
                  <div className="text-[#F0F6FC]">duplicate_check()</div>
                  <div className="mt-2 text-[#C9D1D9]">• 3 near-duplicate entries</div>
                  <div className="text-[#C9D1D9]">• 2 ambiguous acceptance criteria</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
