const stakeholders = [
  { role: 'Project Owner', responsibility: 'Approves scope, KPI alignment, and executive sign-off.' },
  { role: 'Project Manager', responsibility: 'Coordinates delivery, risks, and requirement prioritization.' },
  { role: 'Requirement Analyst', responsibility: 'Validates requirement quality and resolves conflict chains.' },
  { role: 'Software Developer', responsibility: 'Builds against clear, testable, traceable requirements.' },
  { role: 'Tester', responsibility: 'Validates acceptance criteria and checks for missing logic.' },
  { role: 'End User', responsibility: 'Confirms need fulfillment, usability, and real-world fit.' },
  { role: 'Business Analyst', responsibility: 'Maps stakeholder needs to measurable product outcomes.' },
  { role: 'System Administrator', responsibility: 'Maintains configuration, access, and deployment readiness.' },
];

export default function Stakeholders() {
  return (
    <section id="enterprise" className="py-16 md:py-20">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#E3B341]">Teams</div>
          <h2 className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#F0F6FC] md:text-[36px]">
            Built for the people who define, review, and ship requirements.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stakeholders.map((stakeholder) => (
            <article key={stakeholder.role} className="rounded-[20px] border border-zinc-800 bg-[#080808] p-5 transition duration-220 hover:-translate-y-1 hover:border-[#E3B341]">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[12px] border border-zinc-800 bg-black text-[12px] font-semibold text-[#E3B341]">
                {stakeholder.role
                  .split(' ')
                  .map((segment) => segment[0])
                  .slice(0, 2)
                  .join('')}
              </div>

              <h3 className="text-[20px] font-semibold tracking-[-0.04em] text-[#F0F6FC]">{stakeholder.role}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#8B949E]">{stakeholder.responsibility}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
