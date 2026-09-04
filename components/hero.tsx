'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight, CheckCircle2, CirclePlay, GitBranch, ShieldCheck } from 'lucide-react';

const chartData = [
  { name: 'Jan', value: 24 },
  { name: 'Feb', value: 31 },
  { name: 'Mar', value: 28 },
  { name: 'Apr', value: 43 },
  { name: 'May', value: 52 },
  { name: 'Jun', value: 49 },
  { name: 'Jul', value: 61 },
  { name: 'Aug', value: 66 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-14 pt-8 md:pb-20 md:pt-10">
      <div className="section-shell relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="max-w-[620px]"
        >
          <motion.div
            variants={fadeUp}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-[#080808] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]"
          >
            <span className="h-2 w-2 rounded-full bg-[#E3B341]" />
            AI-powered requirement engineering
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[42px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#F0F6FC] md:text-[58px] lg:text-[64px]">
            AI-powered Requirement Engineering Platform
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-4 text-[18px] leading-8 text-[#8B949E] md:text-[20px]">
            <span className="font-medium text-[#E3B341]">Detect conflicts before developers write code.</span>
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
            <motion.div
              whileHover={{ scale: 0.985 }}
              whileTap={{ scale: 0.99 }}
            >
              <Link href="/signup" className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[#E3B341] px-5 text-[14px] font-semibold text-[#0D1117]">
                Start Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 0.985 }}
              whileTap={{ scale: 0.99 }}
            >
              <Link href="#docs" className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-zinc-800 bg-transparent px-5 text-[14px] font-semibold text-[#F0F6FC] hover:border-[#E3B341]">
                <CirclePlay className="h-4 w-4" />
                View Documentation
              </Link>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            {['Google OAuth', 'GitHub OAuth'].map((label) => (
              <Link
                key={label}
                href="/login"
                className="inline-flex items-center gap-2 rounded-[12px] border border-zinc-800 bg-[#080808] px-3 py-2 text-[12px] font-medium text-[#F0F6FC] hover:border-[#E3B341]"
              >
                {label}
              </Link>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="hero-card-glow relative rounded-[22px] p-px">
            <div className="card-surface scanline relative overflow-hidden bg-[#080808] p-4 backdrop-blur-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,179,65,0.14),transparent_30%)]" />
              <div className="relative">
              <div className="mb-4 flex items-center justify-between rounded-[16px] border border-zinc-800 bg-black px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-zinc-800 bg-[#080808] text-[#E3B341]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[#8B949E]">Workspace</div>
                    <div className="text-[13px] font-medium text-[#F0F6FC]">Requirement analysis</div>
                    </div>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#30363D] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8B949E]">
                  <span className="h-2 w-2 rounded-full bg-[#3FB950]" />
                  Live
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <div className="rounded-[18px] border border-zinc-800 bg-black p-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-[#8B949E]">
                      <span>Risk</span>
                      <span>High</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[30px] font-semibold tracking-[-0.05em] text-[#F0F6FC]">84%</div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-[#080808] text-[#E3B341]">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3 text-[12px] leading-5 text-[#8B949E]">69 issue clusters flagged across active requirements.</div>
                  </div>

                  <div className="rounded-[18px] border border-zinc-800 bg-black p-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-[#8B949E]">
                      <span>Confidence</span>
                      <span>98.2%</span>
                    </div>
                    <div className="relative mx-auto mt-4 flex h-24 w-24 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-[8px] border-[#30363D]" />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'conic-gradient(#E3B341 0 310deg, #1C2128 310deg 360deg)' }}
                      />
                      <div className="absolute inset-[14px] rounded-full bg-black" />
                      <div className="relative text-[18px] font-semibold text-[#F0F6FC]">86%</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[18px] border border-zinc-800 bg-black p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8B949E]">Consistency</div>
                      <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-[#F0F6FC]">+42.8</div>
                    </div>
                    <div className="rounded-full border border-[#30363D] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#8B949E]">Stable</div>
                  </div>

                  <div className="mt-4 h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="goldArea" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#E3B341" stopOpacity={0.38} />
                            <stop offset="100%" stopColor="#E3B341" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
                        <Tooltip
                          cursor={{ stroke: '#E3B341', strokeDasharray: '4 4' }}
                          contentStyle={{
                            background: '#0D1117',
                            border: '1px solid #30363D',
                            borderRadius: '12px',
                            color: '#F0F6FC',
                          }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#E3B341" strokeWidth={2.5} fill="url(#goldArea)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[18px] border border-zinc-800 bg-black p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#8B949E]">Recent analysis</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[#E3B341]">2m ago</div>
                </div>
                <div className="space-y-2">
                  {[
                    ['REQ-118', 'Conflicting latency targets', 'Critical'],
                    ['REQ-227', 'Duplicate login workflow', 'Medium'],
                    ['REQ-503', 'Ambiguous access policy', 'High'],
                  ].map(([id, label, severity]) => (
                    <div key={id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 rounded-[12px] border border-zinc-800 bg-[#080808] px-2.5 py-2 text-[11px] text-[#8B949E]">
                      <span className="font-medium text-[#F0F6FC]">{id}</span>
                      <span>{label}</span>
                      <span className="rounded-full border border-[#30363D] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[#E3B341]">{severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="absolute -left-4 top-16 rounded-[12px] border border-zinc-800 bg-[#080808] px-3 py-2 text-[11px] text-[#F0F6FC]"
          >
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E3B341]" />
              36 cross-checks resolved
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.35 }}
            className="absolute -bottom-5 right-6 rounded-[12px] border border-zinc-800 bg-[#080808] p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-zinc-800 bg-black text-[#E3B341]">
                <GitBranch className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#8B949E]">Traceability</div>
                <div className="text-[13px] font-medium text-[#F0F6FC]">92% linked</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
