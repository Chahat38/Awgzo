import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { AWGZO_PROJECTS, type AwgzoProject } from '../../data/projects';
import { useReality } from '../../context/RealityContext';
import { gsap, registerMotionPlugins, ScrollTrigger } from '../../lib/scroll';

/**
 * Portfolio "Showreel Index"
 * ---------------------------------------------------------------
 * Desktop: the section pins. Scrolling moves through the project list
 * on the left, and a single viewfinder on the right changes project with
 * a wipe-reveal (orange scan line). Hover / click on a title also switches.
 * Tablet / phone / reduced motion: no pinning, tap a title to switch.
 *
 * Set to true if you also want the image-only (website) projects in the reel.
 */
const INCLUDE_IMAGE_ONLY_PROJECTS = false;

const PROJECTS: AwgzoProject[] = INCLUDE_IMAGE_ONLY_PROJECTS
  ? AWGZO_PROJECTS
  : AWGZO_PROJECTS.filter((project) => Boolean(project.videoUrl));

/** Scroll distance (in screen heights) used per project while the section is pinned. */
const SCROLL_PER_PROJECT = 0.7;

const pad = (n: number) => String(n).padStart(2, '0');

export function PortfolioShowcase() {
  const { setActiveSection, sceneStateRef } = useReality();

  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sweepRef = useRef<HTMLDivElement | null>(null);
  const infoRef = useRef<HTMLDivElement | null>(null);

  const zRef = useRef(1);
  const prevIdxRef = useRef(0);
  const lastScrollIdxRef = useRef(0);

  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  const total = PROJECTS.length;
  const active = PROJECTS[activeIdx];

  /* ---------- pinned scroll: scroll position chooses the project ---------- */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !total) return;
    registerMotionPlugins();

    // tell the 3D background which section is on screen + know when to play video
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = Boolean(entry?.isIntersecting);
        setVisible(isVisible);
        if (isVisible) {
          setActiveSection('portfolio');
          sceneStateRef.current.section = 'portfolio';
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const pinEl = pinRef.current;
      if (!pinEl) return;

      const trigger = ScrollTrigger.create({
        trigger: pinEl,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * SCROLL_PER_PROJECT * total)}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(total - 1, Math.floor(self.progress * total));
          if (idx !== lastScrollIdxRef.current) {
            lastScrollIdxRef.current = idx;
            setActiveIdx(idx);
          }
        },
      });

      return () => trigger.kill();
    });

    return () => {
      observer.disconnect();
      mm.revert();
    };
  }, [total, setActiveSection, sceneStateRef]);

  /* ---------- only the project on screen plays ---------- */
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === activeIdx && visible) video.play().catch(() => {});
      else video.pause();
    });
  }, [activeIdx, visible]);

  /* ---------- wipe-reveal when the project changes ---------- */
  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return; // first render: nothing to animate
    prevIdxRef.current = activeIdx;
    registerMotionPlugins();

    const next = layerRefs.current[activeIdx];
    if (!next) return;

    zRef.current += 1;
    next.style.zIndex = String(zRef.current);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(next, { clipPath: 'inset(0% 0% 0% 0%)' });
      return;
    }

    gsap.killTweensOf(next);
    const tl = gsap.timeline();
    tl.fromTo(
      next,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'awgzoOut' },
      0
    );

    const inner = next.firstElementChild as HTMLElement | null;
    if (inner) {
      tl.fromTo(inner, { scale: 1.28 }, { scale: 1.04, duration: 1.3, ease: 'awgzoOut' }, 0);
    }

    // orange scan line rides the top edge of the reveal
    const sweep = sweepRef.current;
    if (sweep) {
      tl.fromTo(
        sweep,
        { top: '100%', opacity: 1 },
        { top: '0%', duration: 0.95, ease: 'awgzoOut' },
        0
      ).to(sweep, { opacity: 0, duration: 0.25 }, '>-0.15');
    }

    // project info settles in
    const info = infoRef.current;
    if (info) {
      tl.fromTo(
        Array.from(info.children),
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'awgzoOut' },
        0.15
      );
    }
  }, [activeIdx]);

  if (!total) return null;

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      aria-label="Portfolio section"
      className="relative z-10 border-t border-white/[0.08]"
      style={{
        background:
          'radial-gradient(900px 520px at 85% 8%, rgba(232,109,34,0.10), transparent 60%), transparent',
      }}
    >
      <div
        ref={pinRef}
        className="flex flex-col pb-16 pt-20 lg:min-h-screen lg:pb-10 lg:pt-[104px]"
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-6 lg:px-12">
          {/* heading */}
          <div className="max-w-3xl">
            <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.25em] text-[#e86d22]">
              Selected Work
            </span>
            <h2 className="mt-3 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] font-bold leading-[1.02] tracking-tight text-white">
              Our Work in Motion
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#9fa3a5] sm:text-base">
              Real demos of the AR experiences, WebAR viewers and TikTok effects built by AWGZO.
              <span className="hidden lg:inline"> Keep scrolling to move through the reel.</span>
            </p>
          </div>

          {/* stage */}
          <div className="mt-8 grid flex-1 grid-cols-1 items-center gap-8 lg:mt-6 lg:grid-cols-12 lg:gap-14">
            {/* viewfinder (first on mobile, right on desktop) */}
            <div className="lg:order-2 lg:col-span-7">
              <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#10191f] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] lg:aspect-auto lg:h-[min(50vh,500px)]">
                {/* media layers (own stacking context so z-index can keep growing) */}
                <div className="absolute inset-0 isolate">
                  {PROJECTS.map((project, i) => (
                    <div
                      key={project.slug}
                      ref={(node) => {
                        layerRefs.current[i] = node;
                      }}
                      className="absolute inset-0"
                      style={{
                        clipPath: i === 0 ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
                        zIndex: i === 0 ? 1 : 0,
                      }}
                    >
                      <div className="absolute inset-0 will-change-transform">
                        {project.videoUrl ? (
                          <video
                            ref={(node) => {
                              videoRefs.current[i] = node;
                            }}
                            src={project.videoUrl}
                            poster={project.poster}
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            title={project.videoTitle}
                            aria-label={project.videoDescription ?? `${project.title} video`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={project.poster}
                            alt={project.altText}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* shade for readable HUD */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#10191f]/70 via-transparent to-[#10191f]/35"
                />

                {/* orange scan line */}
                <div
                  ref={sweepRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-20 h-[2px] bg-[#e86d22] opacity-0 shadow-[0_0_18px_2px_rgba(232,109,34,0.85)]"
                  style={{ top: '100%' }}
                />

                {/* whole viewfinder opens the case study */}
                <Link
                  to={`/work/${active.slug}`}
                  aria-label={`View ${active.title} case study`}
                  data-cursor="INSPECT"
                  className="absolute inset-0 z-30"
                />

                {/* viewfinder corners + HUD */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-40">
                  <span className="absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-[#e86d22]" />
                  <span className="absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-[#e86d22]" />
                  <span className="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-[#e86d22]" />
                  <span className="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-[#e86d22]" />

                  <div className="absolute left-9 top-[22px] flex items-center gap-2 font-mono-tabular text-[11px] font-semibold text-white">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#e86d22]" />
                    <span>{active.kind}</span>
                  </div>
                  <div className="absolute right-9 top-[22px] font-mono-tabular text-[11px] font-semibold text-white">
                    {pad(activeIdx + 1)} / {pad(total)}
                  </div>
                </div>
              </div>

              {/* project info */}
              <div
                ref={infoRef}
                aria-live="polite"
                className="mt-5 flex min-h-[92px] flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="max-w-xl">
                  <span className="block font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e86d22]">
                    {active.category}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-[#9fa3a5]">
                    {active.shortDescription}
                  </p>
                </div>
                <Link
                  to={`/work/${active.slug}`}
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#e86d22] px-5 py-2.5 text-sm font-semibold text-[#10191f] transition hover:bg-[#ee8a52]"
                >
                  View Case Study <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* project index */}
            <nav aria-label="Projects" className="lg:order-1 lg:col-span-5">
              <div className="relative pl-6">
                {/* progress rail */}
                <div aria-hidden="true" className="absolute bottom-1 left-0 top-1 w-px bg-white/15">
                  <div
                    className="h-full w-full origin-top bg-[#e86d22] transition-transform duration-700 ease-out"
                    style={{ transform: `scaleY(${(activeIdx + 1) / total})` }}
                  />
                </div>

                <ul className="flex flex-col">
                  {PROJECTS.map((project, i) => {
                    const isActive = i === activeIdx;
                    const select = () => {
                      lastScrollIdxRef.current = i;
                      setActiveIdx(i);
                    };
                    return (
                      <li key={project.slug}>
                        <button
                          type="button"
                          onMouseEnter={select}
                          onFocus={select}
                          onClick={select}
                          aria-current={isActive ? 'true' : undefined}
                          className="group flex w-full cursor-pointer items-baseline gap-4 py-2.5 text-left lg:py-3"
                        >
                          <span
                            className={`w-7 shrink-0 font-mono-tabular text-xs font-semibold transition-colors duration-500 ${
                              isActive ? 'text-[#e86d22]' : 'text-white/30'
                            }`}
                          >
                            {pad(i + 1)}
                          </span>
                          <span
                            className={`font-display text-[clamp(1.7rem,3.2vw,3rem)] font-bold leading-[1.04] tracking-tight transition-all duration-500 ease-out ${
                              isActive
                                ? 'translate-x-2 text-white'
                                : 'text-white/30 group-hover:text-white/60'
                            }`}
                          >
                            {project.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* closing call to action (outside the pinned part) */}
      <div className="mx-auto w-full max-w-[1440px] px-6 pb-24 lg:px-12 lg:pb-32">
        <div className="flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="max-w-xl font-display text-xl font-semibold leading-snug text-white sm:text-2xl">
            Have an AR, web or XR idea? Let&apos;s build it together.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-[#e86d22] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e86d22] hover:text-[#10191f]"
          >
            Start a project <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}