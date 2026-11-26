import { useState } from 'react';
import { GlassCard } from '../../components/ui/Glass';
import { AWGZO_SITE } from '../../data/site';

const STEPS = [
  {
    title: 'Free Consultation',
    time: '30 minutes, free',
    text: 'An initial call to understand your idea, business goals and problems. We explain how we can help, give honest feedback on feasibility, and decide together whether to move forward.',
    points: ['Your idea, audience and goals', 'Feasibility feedback on AR, VR or software', 'A clear yes or no on fit'],
  },
  {
    title: 'Requirements Gathering',
    time: '2 to 3 days',
    text: 'We define features, users, platforms and priorities so nothing is left to guesswork.',
    points: ['Features and user types', 'Platforms: phone, web or headset', 'Priorities for the first release'],
  },
  {
    title: 'Solution Design and Proposal',
    time: '2 to 4 days',
    text: 'We present the technical approach, project timeline and investment estimate for your approval.',
    points: ['Recommended technical approach', 'Timeline with milestones', 'Clear cost estimate'],
  },
  {
    title: 'Contract and Team Alignment',
    time: '1 to 2 days',
    text: 'We finalize the agreement, assign your dedicated team and set up communication and reporting channels.',
    points: ['Agreement and payment terms', 'Dedicated team and point of contact', 'Reporting channels agreed'],
  },
  {
    title: 'Development Roadmap and Kickoff',
    time: 'Week 1',
    text: 'We outline milestones and deliverables, then launch your project with a structured first sprint.',
    points: ['Milestones and deliverables', 'First sprint planned', 'Early preview of your first milestone'],
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

export function ClientOnboarding() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section
      id="onboarding"
      aria-label="Client onboarding process"
      className="relative z-10 border-t border-white/[0.08] py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-[#e86d22]">
          Client onboarding
        </span>
        <h2 className="mt-2 font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-none tracking-[0.03em] text-white">
          From first call to first build
        </h2>
        <p className="mt-3 max-w-xl text-sm text-[#9fa3a5] sm:text-base">
          Five clear steps take your AR, VR or software idea from a conversation to a working first delivery.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[5fr_7fr]">
          <ol className="relative grid gap-2" role="tablist" aria-label="Onboarding steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  data-hand-target
                  className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors duration-200 cursor-pointer ${
                    i === active
                      ? 'border-[#e86d22]/50 bg-[#e86d22]/10 text-white'
                      : 'border-white/[0.08] text-[#9fa3a5] hover:border-[#e86d22]/40 hover:text-white'
                  }`}
                >
                  <span
                    className={`font-mono-tabular text-[1.4rem] ${i === active ? 'text-[#e86d22]' : 'text-[#9fa3a5]/60'}`}
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="font-display text-[1.5rem] leading-none tracking-[0.03em]">{s.title}</span>
                </button>
              </li>
            ))}
          </ol>

          <GlassCard tone="orange" className="p-6 sm:p-8" aria-live="polite">
            <div key={active} className="team-fade">
              <span className="font-mono-tabular inline-block rounded-full border border-[#ee8a52]/50 px-3 py-1 text-xs text-[#ee8a52]">
                {step.time}
              </span>
              <h3 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-none tracking-[0.03em] text-white">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[520px] text-[0.98rem] leading-relaxed text-[#9fa3a5]">{step.text}</p>
              <ul className="mt-5 grid gap-2 text-sm text-white">
                {step.points.map((p) => (
                  <li key={p} className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#e86d22] shadow-[0_0_10px_#e86d22]" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={active === 0}
                  onClick={() => setActive(active - 1)}
                  className="awgzo-glass awgzo-glass--low rounded-full px-6 py-3 text-sm font-medium text-white cursor-pointer disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={active === STEPS.length - 1}
                  onClick={() => setActive(active + 1)}
                  className="rounded-full border border-[#ee8a52]/60 bg-[#e86d22] px-6 py-3 text-sm font-semibold text-[#10191f] hover:bg-[#ee8a52] cursor-pointer disabled:opacity-40"
                >
                  Next step
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
          <p className="font-display text-[1.8rem] tracking-[0.03em] text-white">Ready to start with step one?</p>
          <a
            href={AWGZO_SITE.contact.calendlyUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#ee8a52]/60 bg-[#e86d22] px-6 py-3 text-sm font-semibold text-[#10191f] hover:bg-[#ee8a52]"
          >
            Book a free consultation
          </a>
        </div>
      </div>
    </section>
  );
}
