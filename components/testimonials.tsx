'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'A. Reddy',
    company: 'Northstar Systems',
    quote:
      'ReqGuard surfaced contradictions in our SRS before implementation and saved the team from several late-stage architecture rework cycles.',
  },
  {
    name: 'J. Patel',
    company: 'BlueOrbit Labs',
    quote:
      'We use it as a governance checkpoint. The duplicate detection and traceability checks help keep requirement quality consistent across every release.',
  },
  {
    name: 'M. Chen',
    company: 'Verve Commerce',
    quote:
      'The report quality is excellent. Product and engineering teams quickly align on what is truly ambiguous or conflicting.',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-20">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]">Customer stories</div>
          <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#F0F6FC] md:text-[36px]">
            Trusted by teams who refine requirements before writing code.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.article
              key={item.company}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, delay: index * 0.04 }}
              className="rounded-[20px] border border-zinc-800 bg-[#080808] p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-black text-[12px] font-semibold text-[#E3B341]">
                    {item.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div>
                    <div className="text-[15px] font-medium text-[#F0F6FC]">{item.name}</div>
                    <div className="text-[13px] text-[#8B949E]">{item.company}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#E3B341]">
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>

              <p className="mt-6 text-[16px] leading-7 text-[#C9D1D9]">“{item.quote}”</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
