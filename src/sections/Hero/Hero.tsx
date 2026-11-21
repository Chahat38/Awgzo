import { useEffect, useRef } from 'react';
import { Glasses } from 'lucide-react';
import { useReality } from '../../context/RealityContext';
import { AWGZO_SITE } from '../../data/site';
import { MagneticCta } from '../../components/ui/Glass';
import { gsap, scrollToSection } from '../../lib/scroll';

export function Hero({ loaderDone: _loaderDone = true }: { loaderDone?: boolean }) {
  const { setActiveSection, sceneStateRef } = useReality();
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActiveSection('hero');
          sceneStateRef.current.section = 'hero';
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (!prefersReduced && contentRef.current) {
        gsap.from(contentRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: 'awgzoOut',
          clearProps: 'transform,opacity',
        });
      }
    }, el);

    return () => {
      obs.disconnect();
      ctx.revert();
      sceneStateRef.current.warpProgress = 0;
    };
  }, [setActiveSection, sceneStateRef]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative z-10 flex min-h-[92svh] items-center pt-28 pb-16 lg:pt-24"
    >
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
        <div ref={contentRef} className="max-w-3xl">
          <h1 className="max-w-[14ch] font-display text-[clamp(2rem,4.5vw,4rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-white max-lg:max-w-full max-lg:text-[clamp(1.75rem,8vw,2.5rem)]">
            Your Tech &amp;{' '}
            <span className="text-[#E86C22]">Marketing Wizards</span>
          </h1>

          <p className="mt-4 max-w-[60ch] text-sm font-medium uppercase tracking-[0.14em] text-[#FF9A55] sm:text-base">
            {AWGZO_SITE.badge}
          </p>

          <p className="mt-2 max-w-[60ch] text-base font-semibold text-white sm:text-lg">
            {AWGZO_SITE.heroSubheadline}
          </p>

          <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-[#A0A0A0] sm:text-lg">
            {AWGZO_SITE.intro}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <MagneticCta
              variant="orange"
              cursorLabel="OPEN"
              onClick={() => scrollToSection('reality-lab')}
            >
              <Glasses className="h-4 w-4" /> Open AR / VR Lab
            </MagneticCta>

            <button
              type="button"
              onClick={() => scrollToSection('portfolio')}
              className="text-sm font-semibold text-white underline-offset-4 hover:text-[#E86C22] hover:underline"
            >
              See Our AR Work
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
