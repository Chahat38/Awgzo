import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getTeamMembers } from '../../data/team';
import { useReality } from '../../context/RealityContext';
import { gsap } from '../../lib/scroll';

const MARQUEE_ITEMS = [
  'AR / WebAR',
  'TikTok Effects',
  'Web Platforms',
  'Growth Strategy',
  'Visual Systems',
];

export function Team() {
  const members = useMemo(() => getTeamMembers(), []);
  const { setActiveSection, sceneStateRef } = useReality();
  const sectionRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = members[activeIndex] ?? members[0];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveSection('team');
          sceneStateRef.current.section = 'team';
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sceneStateRef, setActiveSection]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-team-head]', {
          y: 30,
          opacity: 0,
          duration: 0.85,
          stagger: 0.09,
          ease: 'awgzoOut',
          scrollTrigger: { trigger: el, start: 'top 75%' },
        });

        gsap.from('[data-team-row]', {
          y: 22,
          opacity: 0,
          duration: 0.65,
          stagger: 0.075,
          ease: 'awgzoOut',
          scrollTrigger: { trigger: listRef.current, start: 'top 85%' },
        });
      });
    }, el);

    return () => {
      media.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="team"
      ref={sectionRef}
      className="relative z-10 overflow-hidden border-t border-white/[0.08] py-24 sm:py-28 lg:py-32"
    >
      {/* Blueprint grid + warm ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-[#E86C22]/[0.07] blur-[130px]"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div data-team-head>
            <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.24em] text-[#E86C22]">
              04 · The crew / no superheroes
            </span>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,7vw,5.75rem)] font-extrabold leading-[0.94] tracking-[-0.045em] text-white">
              The people
              <br className="hidden sm:block" /> behind <span className="text-[#E86C22]">AWGZO</span>
            </h2>
          </div>

          <div data-team-head className="font-mono-tabular md:pb-2">
            <span className="block text-right text-3xl font-semibold leading-none text-white sm:text-4xl">
              0{members.length}
            </span>
            <span className="mt-2 block text-right text-[10px] uppercase tracking-[0.2em] text-white/40">
              disciplines · one studio
            </span>
          </div>
        </div>

        <p
          data-team-head
          className="mt-5 max-w-xl text-sm leading-relaxed text-[#A0A0A0] md:text-base"
        >
          Strategy, code, pixels and camera tricks — the specialists who turn a brief into
          something people actually feel.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Interactive spotlight / dossier */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#0D0D0D]/90 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-9">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#E86C22]/25 blur-[90px]"
              />
              <div aria-hidden="true" className="ar-scanlines absolute inset-0 opacity-50" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/[0.04]"
              />

              <div className="relative flex items-center justify-between font-mono-tabular text-[10px] uppercase tracking-[0.22em] text-white/45">
                <span>Selected discipline</span>
                <span className="text-[#E86C22]">
                  {active.index} / 0{members.length}
                </span>
              </div>

              <div className="relative mt-8 flex justify-center">
                <div className="relative aspect-square w-44 sm:w-56">
                  <div className="absolute inset-0 overflow-hidden rounded-full border border-white/15 bg-[#1A1A1A]">
                    <img
                      key={active.photo}
                      src={active.photo}
                      alt={active.name}
                      className="team-fade h-full w-full object-cover grayscale-[20%] contrast-[1.06]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-[#080808]/75 via-transparent to-[#E86C22]/10"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="team-orbit pointer-events-none absolute inset-3 rounded-full border border-dashed border-[#E86C22]/45"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#E86C22] shadow-[0_0_20px_#E86C22]"
                  />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#080808]/85 px-3 py-1 font-mono-tabular text-[10px] font-semibold tracking-[0.2em] text-[#E86C22] ring-1 ring-[#E86C22]/40">
                    {active.index}
                  </span>
                </div>
              </div>

              <div key={active.id} className="team-fade relative mt-8">
                <p className="font-mono-tabular text-[11px] uppercase tracking-[0.18em] text-[#E86C22]">
                  {active.role}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {active.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#A0A0A0]">{active.bio}</p>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5">
                  <a
                    href={active.links.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link-draw inline-flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-[#E86C22]"
                  >
                    LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={active.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link-draw inline-flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-[#E86C22]"
                  >
                    Instagram <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Crew ledger */}
          <div ref={listRef} className="relative">
            <div className="mb-4 flex items-center justify-between font-mono-tabular text-[10px] uppercase tracking-[0.22em] text-white/35">
              <span>Choose a discipline</span>
              <span>Hover / tap to explore</span>
            </div>

            <div>
              {members.map((member, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={member.id}
                    data-team-row
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onFocus={() => setActiveIndex(idx)}
                    onClick={() => setActiveIndex(idx)}
                    className="group relative flex w-full items-center gap-3 border-t border-white/10 py-5 text-left transition-colors duration-300 last:border-b sm:gap-5 sm:py-6"
                  >
                    <span
                      className={`font-mono-tabular text-xs transition-colors sm:text-sm ${
                        isActive ? 'text-[#E86C22]' : 'text-white/30 group-hover:text-[#E86C22]'
                      }`}
                    >
                      {member.index}
                    </span>
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/15 sm:h-11 sm:w-11">
                      <img src={member.photo} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span
                      className={`font-display text-lg font-semibold leading-tight transition-colors duration-300 sm:text-2xl ${
                        isActive ? 'text-white' : 'text-white/55 group-hover:text-white'
                      }`}
                    >
                      {member.name}
                    </span>
                    <span className="ml-auto hidden max-w-[10rem] text-right text-[11px] leading-snug text-white/40 transition-colors group-hover:text-white/70 md:block">
                      {member.role}
                    </span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isActive
                          ? 'border-[#E86C22] bg-[#E86C22] text-[#080808]'
                          : 'border-white/15 text-white/40 group-hover:border-[#E86C22] group-hover:text-[#E86C22]'
                      }`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-0 h-px w-full origin-left bg-[#E86C22] transition-transform duration-500 ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center gap-3 font-mono-tabular text-[10px] uppercase tracking-[0.2em] text-white/35">
              <span className="h-px w-10 bg-[#E86C22]" /> Built by people, not prompts
            </div>
          </div>
        </div>

        {/* Discipline ticker */}
        <div aria-hidden="true" className="relative mt-14 overflow-hidden border-y border-white/10 py-4">
          <div className="team-marquee flex w-max">
            {[0, 1].map((group) => (
              <div key={group} className="flex shrink-0 items-center gap-10 pr-10">
                {MARQUEE_ITEMS.map((item) => (
                  <span key={item} className="flex items-center gap-10 whitespace-nowrap font-mono-tabular text-[11px] uppercase tracking-[0.28em] text-white/30">
                    {item}
                    <span className="text-[#E86C22]">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
