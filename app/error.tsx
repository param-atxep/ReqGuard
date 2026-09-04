"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#050505] p-6 text-center text-white"><div><p className="text-xs uppercase tracking-[0.17em] text-[#e3b341]">Something went wrong</p><h1 className="mt-3 text-2xl font-semibold">ReqGuard could not load this page</h1><p className="mt-2 text-sm text-[#8b949e]">Retry the request or return to your workspace.</p><div className="mt-5 flex justify-center gap-3"><button type="button" onClick={() => reset()} className="h-10 rounded-lg bg-[#e3b341] px-4 text-xs font-semibold text-[#171006]">Retry</button><a href="/dashboard" className="inline-flex h-10 items-center rounded-lg border border-white/[0.1] px-4 text-xs text-white">Dashboard</a></div></div></main>;
}
