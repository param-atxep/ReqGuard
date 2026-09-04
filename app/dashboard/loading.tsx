export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#050505] p-5 text-white sm:p-8" aria-busy="true" aria-label="Loading dashboard">
      <div className="mx-auto max-w-[1540px] animate-pulse">
        <div className="mb-10 flex items-center justify-between">
          <div className="h-5 w-36 rounded bg-white/[0.08]" />
          <div className="h-9 w-36 rounded-lg bg-white/[0.08]" />
        </div>
        <div className="mb-7 space-y-3">
          <div className="h-3 w-24 rounded bg-white/[0.08]" />
          <div className="h-9 w-80 max-w-full rounded bg-white/[0.08]" />
          <div className="h-4 w-[28rem] max-w-full rounded bg-white/[0.06]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-36 rounded-2xl border border-white/[0.07] bg-white/[0.035]" />)}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_0.85fr]">
          <div className="h-96 rounded-2xl border border-white/[0.07] bg-white/[0.035]" />
          <div className="h-96 rounded-2xl border border-white/[0.07] bg-white/[0.035]" />
        </div>
      </div>
    </div>
  );
}
