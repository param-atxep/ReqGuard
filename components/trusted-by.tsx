const logos = ['GitHub', 'Atlassian', 'Microsoft', 'Google', 'Vercel', 'JetBrains'];

export default function TrustedBy() {
  return (
    <section id="docs" className="border-y border-zinc-900 bg-black py-8">
      <div className="section-shell">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">A control layer for modern delivery teams</p>
          <p className="max-w-xl text-sm text-zinc-600">From product discovery to release sign-off, keep every requirement measurable, explainable, and ready for audit.</p>
        </div>
        <div className="overflow-hidden">
          <div className="flex min-w-max animate-[marquee_24s_linear_infinite] gap-12 whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.18em] text-[#8B949E]">
            {[...logos, ...logos].map((name, index) => (
              <span key={`${name}-${index}`} className="inline-flex items-center justify-center opacity-85 grayscale">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
