'use client';

import { useEffect, useRef, useState } from 'react';

const metrics = [
  { value: 98, suffix: '%', label: 'Detection Accuracy' },
  { value: 10, suffix: 'K+', label: 'Requirements Analyzed' },
  { value: 1200, suffix: '+', label: 'Projects' },
  { value: 4, suffix: '×', label: 'Faster Review' },
];

export default function Metrics() {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 md:py-20">
      <div className="section-shell">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ value, suffix, label }) => (
            <div key={label} className="rounded-[20px] border border-zinc-800 bg-[#080808] p-6 text-center">
              <MetricCounter value={value} suffix={suffix} visible={visible} />
              <div className="mt-3 text-[13px] uppercase tracking-[0.14em] text-[#8B949E]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCounter({ value, suffix, visible }: { value: number; suffix: string; visible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;

    let frame = 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value]);

  return (
    <div className="text-[38px] font-semibold tracking-[-0.06em] text-[#F0F6FC] md:text-[44px]">
      {count}
      <span className="text-[#E3B341]">{suffix}</span>
    </div>
  );
}
