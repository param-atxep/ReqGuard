'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Docs', href: '#docs' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Enterprise', href: '#enterprise' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? 'border-b border-zinc-900 bg-black/90 backdrop-blur-2xl' : 'bg-transparent'
      }`}
    >
      <div className="section-shell flex h-[68px] items-center justify-between py-3 md:h-[76px]">
        <Link href="/" className="flex items-center gap-3" aria-label="ReqGuard home">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-[#080808] text-[#E3B341]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#F0F6FC]">ReqGuard</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[#8B949E] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative py-2 text-[13px] font-medium tracking-[-0.01em] text-[#8B949E] transition-colors hover:text-[#F0F6FC]"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-[#E3B341] transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden h-11 w-32 items-center justify-center rounded-[10px] border border-[#30363D] bg-transparent px-4 text-[13px] font-medium text-[#F0F6FC] hover:border-[#8B949E] md:inline-flex">
            Login
          </Link>
          <motion.div whileHover={{ scale: 0.98 }} whileTap={{ scale: 0.99 }}>
            <Link href="/signup" className="inline-flex h-11 w-32 items-center justify-center rounded-[12px] bg-[#E3B341] px-4 text-[13px] font-semibold text-[#0D1117] hover:bg-[#f0c86d]">
              Get Started
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
