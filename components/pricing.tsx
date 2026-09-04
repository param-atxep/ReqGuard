'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'For early-stage teams validating requirements in one product line.',
    features: ['Single project workspace', 'AI conflict detection', 'Requirement export', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$99',
    description: 'For teams managing multiple SRS streams and need deeper traceability.',
    features: ['Unlimited analyses', 'Collaborative review', 'Custom severity rules', 'Priority support'],
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For multi-team programs with security, governance, and enterprise integrations.',
    features: ['SSO & role controls', 'Dedicated onboarding', 'Audit trail', 'Executive reporting'],
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section className="py-16 md:py-20">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]">Pricing</div>
          <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#F0F6FC] md:text-[36px]">
            Flexible plans for engineering and product teams.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.26, delay: index * 0.04 }}
              className={`rounded-[20px] border p-6 ${plan.highlighted ? 'border-[#E3B341] bg-[#0b0b0b]' : 'border-zinc-800 bg-[#080808]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[24px] font-semibold tracking-[-0.04em] text-[#F0F6FC]">{plan.name}</h3>
                {plan.highlighted ? <span className="rounded-full border border-[#E3B341] bg-[#E3B341]/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#E3B341]">Popular</span> : null}
              </div>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-[38px] font-semibold tracking-[-0.06em] text-[#F0F6FC]">{plan.price}</span>
                {plan.price !== 'Custom' ? <span className="pb-1 text-[13px] text-[#8B949E]">/ month</span> : null}
              </div>

              <p className="mt-4 text-[15px] leading-7 text-[#8B949E]">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-[15px] text-[#F0F6FC]">
                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E3B341]/10 text-[#E3B341]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.a
                whileHover={{ scale: 0.985 }}
                whileTap={{ scale: 0.99 }}
                href="/signup"
                className={`mt-8 inline-flex h-12 w-full items-center justify-center rounded-[12px] text-[14px] font-semibold ${plan.highlighted ? 'bg-[#E3B341] text-[#0D1117]' : 'border border-[#30363D] bg-transparent text-[#F0F6FC] hover:border-[#8B949E]'}`}
              >
                {plan.highlighted ? 'Book a Demo' : 'Get Started'}
              </motion.a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
