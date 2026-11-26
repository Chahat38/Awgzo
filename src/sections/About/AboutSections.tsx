import { useEffect, useRef } from 'react';
import { Eye, Handshake, Layers, MessageCircle, Rocket, Target } from 'lucide-react';
import { GlassCard } from '../../components/ui/Glass';
import { AWGZO_PROJECTS } from '../../data/projects';
import { AWGZO_SITE } from '../../data/site';
import { getTeamMembers } from '../../data/team';
import { gsap, registerMotionPlugins } from '../../lib/scroll';

/** Shared scroll-reveal: fades up the heading and every `.about-reveal` child. */
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerMotionPlugins();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.from('.about-reveal', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' },
      });
    }, el);
    return () => ctx.revert();
  }, [ref]);
}

function SectionHead({ eyebrow, title, accent, text }: { eyebrow: string; title: string; accent: string; text: string }) {
  return (
    <div className="about-reveal">
      <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.24em] text-[#e86d22]">
        {eyebrow}
      </span>
      <h2 className="mt-3 font-display text-[clamp(2.25rem,6vw,4.75rem)] font-extrabold leading-[1] tracking-[-0.03em] text-white max-sm:text-[clamp(2rem,9vw,2.6rem)]">
        {title} <span className="text-[#e86d22]">{accent}</span>
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#9fa3a5] md:text-base">{text}</p>
    </div>
  );
}

const SECTION_CLASS = 'relative z-10 overflow-hidden border-t border-white/[0.08] py-16 sm:py-24 lg:py-28';
const WRAP_CLASS = 'relative mx-auto w-full max-w-[1440px] px-6 lg:px-12';

/* ---------- 01 · Mission & Vision ---------- */
export function MissionVision() {
  const ref = useRef<HTMLElement | null>(null);
  useReveal(ref);

  const cards = [
    {
      icon: Target,
      label: 'Our Mission',
      title: 'Make all AR and VR experiences simple for every brand.',
      body: 'We build immersive experiences that open straight in a phone browser, so your customers never need to download an app. From AR try-on to immersive browser experiences and TikTok effects, we turn bold ideas into products people can use today.',
    },
    {
      icon: Eye,
      label: 'Our Vision',
      title: 'A trusted AR VR XR studio.',
      body: 'We want brands to think of AWGZO first when they want immersive technology, web and marketing under one roof, and to show the world that world-class XR can be built right here.',
    },
  ];

  return (
    <section
      id="mission-vision"
      ref={ref}
      className={`${SECTION_CLASS} pt-28 sm:pt-32 lg:pt-36`}
      style={{ background: 'radial-gradient(800px 520px at 80% 30%, rgba(232,109,34,0.10), transparent 60%)' }}
    >
      <div className={WRAP_CLASS}>
        <SectionHead
          eyebrow="01 · About AWGZO"
          title="Our"
          accent="Mission & Vision"
          text="We build immersive experiences that open straight in a phone browser, so your customers never need to download an app. From AR try-on to immersive browser experiences and TikTok effects, we turn bold ideas into products people can use today."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {cards.map(({ icon: Icon, label, title, body }) => (
            <GlassCard key={label} className="about-reveal h-full rounded-3xl" contentClassName="p-7 sm:p-9">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#e86d22]/50 bg-[#10191f]/70 text-[#ee8a52] shadow-[0_0_28px_rgba(232,109,34,0.3)]">
                <Icon className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <span className="font-mono-tabular mt-6 block text-xs uppercase tracking-[0.22em] text-[#ee8a52]">
                {label}
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#9fa3a5] sm:text-base">{body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 02 · Team Mission ---------- */
export function TeamMission() {
  const ref = useRef<HTMLElement | null>(null);
  useReveal(ref);

  const values = [
    { icon: Handshake, title: 'Build together', body: 'Developers, creatives and marketers work side by side as one studio.' },
    { icon: Layers, title: 'Keep it simple', body: 'Clear plans, clean builds and experiences that just work on everyday phones.' },
    { icon: Rocket, title: 'Ship real work', body: 'We focus on projects that launch, get used and move your business forward.' },
    { icon: MessageCircle, title: 'Stay accessible', body: 'You deal directly with the people building your project, from first call to launch.' },
  ];

  return (
    <section id="team-mission" ref={ref} className={SECTION_CLASS}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-[#e86d22]/[0.07] blur-[130px]"
      />
      <div className={WRAP_CLASS}>
        <SectionHead
          eyebrow="02 · How we work"
          title="Our"
          accent="Team Mission"
          text="We are a team that builds unique selling propositions for businesses and solves their problems to increase retention, drive more sales, and build greater trust. We are a crew that cares about results and is dedicated to solving problems."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, body }, i) => (
            <GlassCard key={title} className="about-reveal h-full rounded-3xl" contentClassName="p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#e86d22]/50 bg-[#10191f]/70 text-[#ee8a52]">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                </span>
                <span className="font-mono-tabular text-sm text-white/35">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9fa3a5]">{body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 03 · Achievements & Awards ---------- */
const RECOGNISED_BY = [
  'MIT Reality Hack',
  'Ignite National Technology Fund',
  'XR Creator Con',
  'KUST Incubation Centre Kohat',
  'KPITB',
  'PITB',
];

export function Achievements() {
  const ref = useRef<HTMLElement | null>(null);
  const numbersRef = useRef<HTMLDivElement | null>(null);
  useReveal(ref);

  const stats = [
    { value: AWGZO_PROJECTS.length, label: 'Projects delivered' },
    { value: AWGZO_SITE.servicesVerified.length, label: 'Core services' },
    { value: getTeamMembers().length, label: 'Specialists in one studio' },
    { value: 1, label: 'Creative Studio' },
  ];

  useEffect(() => {
    const host = numbersRef.current;
    if (!host) return;
    registerMotionPlugins();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nodes = Array.from(host.querySelectorAll<HTMLElement>('[data-count]'));
    const ctx = gsap.context(() => {
      nodes.forEach((node) => {
        const end = Number(node.dataset.count) || 0;
        const counter = { v: 0 };
        node.textContent = '00';
        gsap.to(counter, {
          v: end,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            node.textContent = String(Math.round(counter.v)).padStart(2, '0');
          },
          scrollTrigger: { trigger: host, start: 'top 85%', once: true },
        });
      });
    }, host);
    return () => ctx.revert();
  }, []);

  return (
    <section id="achievements" ref={ref} className={SECTION_CLASS}>
      <div className={WRAP_CLASS}>
        <SectionHead
          eyebrow="03 · Proof, not promises"
          title="Achievements &"
          accent="Awards"
          text="The work we have shipped and the organisations that have backed and worked with AWGZO."
        />

        <div ref={numbersRef} className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat) => (
            <GlassCard key={stat.label} className="about-reveal rounded-3xl" contentClassName="p-6 sm:p-8">
              <span
                data-count={stat.value}
                className="font-mono-tabular block text-5xl font-semibold leading-none text-[#e86d22] sm:text-6xl"
              >
                {String(stat.value).padStart(2, '0')}
              </span>
              <span className="mt-3 block text-sm text-[#9fa3a5]">{stat.label}</span>
            </GlassCard>
          ))}
        </div>

        <div className="about-reveal mt-10">
          <p className="font-mono-tabular text-[0.75rem] uppercase tracking-[0.25em] text-[#ee8a52]">
            Trusted by &amp; worked with
          </p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {RECOGNISED_BY.map((name) => (
              <li
                key={name}
                className="rounded-full border border-white/[0.18] bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-white"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
