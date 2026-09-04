import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check } from 'lucide-react';

export const metadata = {
  title: 'ReqGuard — Auth',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-zinc-900 bg-black px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-20">
            <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-[#F5C451]/10 blur-3xl" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(245,196,81,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(245,196,81,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
            <Link href="/" className="auth-brand relative flex items-center gap-3 text-white">
              <span className="auth-brand-mark flex h-10 w-10 items-center justify-center rounded-xl border border-[#F5C451]/40 bg-[#F5C451]/10 text-[#F5C451]">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="auth-brand-name text-lg font-semibold tracking-tight">ReqGuard</span>
            </Link>
            <div className="relative max-w-lg">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#F5C451]">Requirement intelligence</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.05em] text-white xl:text-5xl">
                Ship with confidence, before the first line of code.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                ReqGuard helps teams find ambiguity, conflicts, and missing traceability in requirements before they become expensive rework.
              </p>
              <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                {['AI-powered requirement analysis', 'Clear, auditable team workflows', 'Secure project collaboration'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5C451]/15 text-[#F5C451]">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="relative text-xs text-zinc-600">Trusted by teams building what matters.</p>
      </aside>
      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[520px]">
          <Link href="/" className="auth-brand mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="auth-brand-mark flex h-11 w-11 items-center justify-center rounded-xl border border-[#F5C451]/40 bg-[#F5C451]/10 text-[#F5C451]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="auth-brand-name text-xl font-semibold tracking-tight">ReqGuard</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
