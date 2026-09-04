'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const items = [
  {
    question: 'What is ReqGuard?',
    answer:
      'ReqGuard is an AI-powered requirement engineering platform that analyzes SRS documents to detect conflicts, inconsistencies, duplicates, ambiguous statements, and traceability issues before development begins.',
  },
  {
    question: 'Which files are supported?',
    answer:
      'ReqGuard supports PDF and DOCX requirement sets and can process structured enterprise specifications from product, QA, and engineering workflows.',
  },
  {
    question: 'Does AI modify requirements?',
    answer:
      'No. ReqGuard reviews the original content and recommends fixes without rewriting the requirement set, making review and sign-off more transparent.',
  },
  {
    question: 'Can developers collaborate?',
    answer:
      'Yes. Product, engineering, QA, and stakeholders can review findings together and align on which requirements need clarification or remediation.',
  },
  {
    question: 'Is data secure?',
    answer:
      'ReqGuard is designed for enterprise workflows with controlled access, clear governance, and secure handling of sensitive technical requirements.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-20">
      <div className="section-shell max-w-4xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]">FAQ</div>
          <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#F0F6FC] md:text-[36px]">
            Common questions from teams adopting ReqGuard.
          </h2>
        </div>

        <div className="mt-9 space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question} className="overflow-hidden rounded-[18px] border border-zinc-800 bg-[#080808]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
                  aria-expanded={isOpen}
                >
                  <span className="text-[16px] font-medium text-[#F0F6FC]">{item.question}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5 text-[#E3B341]" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      <p className="px-5 pb-5 text-[15px] leading-7 text-[#8B949E] md:px-6">{item.answer}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
