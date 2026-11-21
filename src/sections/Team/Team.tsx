import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Crosshair, Instagram, Linkedin, MapPin, Radio, Sparkles } from 'lucide-react';
import { getTeamMembers } from '../../data/team';
import { GlassCard } from '../../components/ui/Glass';
import { useReality } from '../../context/RealityContext';
import { gsap } from '../../lib/scroll';

const MARQUEE_ITEMS = [
  'AR / WebAR',
  'VR Experiences',
  'WebXR',
  'AR Try-On',
  'TikTok Effects',
  'Web Platforms',
  'Growth Strategy',
  'Visual Systems',
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

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
      className="relative z-10 overflow-hidden border-t border-white/[0.08] py-20 sm:py-28 lg:py-32"
    >
      {/* Blueprint grid + orange node glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        <div className="absolute -left-40 top-1/4 h-[460px] w-[460px] rounded-full bg-[#E86C22]/[0.08] blur-[140px]" />
        <div className="absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full bg-[#3B82F6]/[0.06] blur-[130px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div data-team-head>
            <span className="inline-flex items-center gap-2 font-mono-tabular text-xs font-semibold uppercase tracking-[0.24em] text-[#E86C22]">
              <Sparkles className="h-3.5 w-3.5" /> 04 · Crew network
            </span>
            <h2 className="mt-3 max-w-3xl font-display text-[clamp(2.25rem,7vw,5.75rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-white max-sm:text-[clamp(2rem,9vw,2.6rem)]">
              Meet the <span className="text-[#E86C22]">AR VR XR</span> Team
            </h2>
          </div>

          <div data-team-head className="font-mono-tabular md:pb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E86C22]/35 bg-[#E86C22]/[0.08] px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] text-[#FF9A55]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E86C22]/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E86C22]" />
              </span>
              Islamabad node · PK
            </div>
            <div className="mt-3 text-right">
              <span className="block text-3xl font-semibold leading-none text-white sm:text-4xl">
                0{members.length}
              </span>
              <span className="mt-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                disciplines · one studio
              </span>
            </div>
          </div>
        </div>

        <p
          data-team-head
          className="mt-5 max-w-xl text-sm leading-relaxed text-[#A0A0A0] md:text-base"
        >
          Our AR, VR and WebXR builders, web devs and marketers work as one Islamabad studio.
        </p>

        {/* Crew console */}
        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-8">
          {/* Active profile */}
          <GlassCard
            className="relative flex min-h-[430px] overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#0B0B0B]/85 p-6 sm:min-h-[470px] sm:p-8"
            contentClassName="flex flex-1 flex-col"
          >
            <span aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 border-l border-t border-[#E86C22]/50" />
            <span aria-hidden="true" className="absolute right-3 top-3 h-4 w-4 border-r border-t border-[#E86C22]/50" />
            <span aria-hidden="true" className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-[#E86C22]/50" />
            <span aria-hidden="true" className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[#E86C22]/50" />
            <div aria-hidden="true" className="ar-scanlines pointer-events-none absolute inset-0 opacity-40" />

            <div className="relative flex items-center justify-between font-mono-tabular text-[10px] uppercase tracking-[0.22em] text-white/45">
              <span className="inline-flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-[#E86C22]" /> Active profile
              </span>
              <span className="text-[#E86C22]">
                {active.index} / 0{members.length}
              </span>
            </div>

            <div className="relative mx-auto mt-7 h-40 w-40 sm:h-48 sm:w-48">
              <div className="team-orbit absolute inset-0 rounded-full border border-dashed border-[#E86C22]/35" />
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#E86C22]/25 to-transparent" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-[#E86C22]/25 to-transparent" />
              <div
                className="absolute inset-9 flex flex-col items-center justify-center rounded-full border border-[#E86C22]/35 shadow-[0_0_50px_rgba(232,109,34,0.18)]"
                style={{ background: 'radial-gradient(circle at 30% 25%, #242424, #0a0a0a 70%)' }}
              >
                <span className="font-display text-4xl font-bold tracking-tight text-[#E86C22] sm:text-5xl">
                  {getInitials(active.name)}
                </span>
                <span className="mt-1 font-mono-tabular text-[9px] uppercase tracking-[0.2em] text-white/35">
                  AWGZO / ID
                </span>
              </div>
              <span className="absolute -bottom-1 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border border-[#E86C22]/50 bg-[#0B0B0B] text-[#E86C22] shadow-[0_0_18px_rgba(232,109,34,0.35)]">
                <Crosshair className="h-3.5 w-3.5" />
              </span>
            </div>

            <div key={active.id} className="team-fade relative mt-8" aria-live="polite">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E86C22]/35 bg-[#E86C22]/[0.08] px-3 py-1 font-mono-tabular text-[10px] uppercase tracking-[0.16em] text-[#FF9A55]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E86C22]" /> {active.role}
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                {active.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#A0A0A0]">{active.bio}</p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5">
                <a
                  href={active.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link-draw inline-flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-[#E86C22]"
                >
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={active.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link-draw inline-flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-[#E86C22]"
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </GlassCard>

          {/* Crew roster */}
          <GlassCard
            className="relative overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#0B0B0B]/70 p-5 sm:p-7"
            contentClassName="flex flex-col"
          >
            <div className="relative flex items-center justify-between font-mono-tabular text-[10px] uppercase tracking-[0.22em] text-white/45">
              <span className="inline-flex items-center gap-2">
                <Crosshair className="h-3.5 w-3.5 text-[#E86C22]" /> Crew roster
              </span>
              <span>0{members.length} signals</span>
            </div>

            <div ref={listRef} className="relative mt-5">
              <div className="pointer-events-none absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-[#E86C22]/60 via-white/10 to-transparent" />
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
                    className={`group relative flex w-full items-center gap-3 border-b border-white/[0.08] py-4 text-left transition-colors duration-300 last:border-b-0 sm:gap-4 ${
                      isActive ? 'bg-[#E86C22]/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <span
                      className={`relative z-10 h-2 w-2 shrink-0 rounded-full border ${
                        isActive
                          ? 'border-[#E86C22] bg-[#E86C22] shadow-[0_0_12px_#E86C22]'
                          : 'border-white/25 bg-[#0B0B0B] group-hover:border-[#E86C22]'
                      }`}
                    />
                    <span
                      className={`font-mono-tabular text-[11px] transition-colors ${
                        isActive ? 'text-[#E86C22]' : 'text-white/30 group-hover:text-[#E86C22]'
                      }`}
                    >
                      {member.index}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono-tabular text-[10px] font-semibold transition-colors sm:h-10 sm:w-10 ${
                        isActive
                          ? 'border-[#E86C22]/60 text-[#E86C22]'
                          : 'border-white/12 text-white/40 group-hover:border-[#E86C22]/50 group-hover:text-[#E86C22]'
                      }`}
                    >
                      {getInitials(member.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-display text-base font-semibold leading-tight transition-colors sm:text-lg ${
                          isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                        }`}
                      >
                        {member.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-white/35">{member.role}</span>
                    </span>
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        isActive
                          ? 'border-[#E86C22] bg-[#E86C22] text-[#080808]'
                          : 'border-white/12 text-white/35 group-hover:border-[#E86C22] group-hover:text-[#E86C22]'
                      }`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono-tabular text-[10px] uppercase tracking-[0.18em] text-white/35">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#E86C22]" /> Islamabad, Pakistan
              </span>
              <span>Built by people, not prompts</span>
            </div>
          </GlassCard>
        </div>

        {/* Discipline ticker */}
        <div aria-hidden="true" className="relative mt-10 overflow-hidden border-y border-white/10 py-4 sm:mt-14">
          <div className="team-marquee flex w-max">
            {[0, 1].map((group) => (
              <div key={group} className="flex shrink-0 items-center gap-10 pr-10">
                {MARQUEE_ITEMS.map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-10 whitespace-nowrap font-mono-tabular text-[11px] uppercase tracking-[0.28em] text-white/30"
                  >
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
