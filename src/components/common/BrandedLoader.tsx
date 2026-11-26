import { useEffect, useRef, useState } from 'react';
import { gsap, registerMotionPlugins } from '../../lib/scroll';

interface BrandedLoaderProps {
  onEnter: () => void;
}

/**
 * Branded intro gate. The visitor must tap "Enter" once: that gesture unlocks
 * browser audio so the Hero voice recording can play on every page load.
 */
export function BrandedLoader({ onEnter }: BrandedLoaderProps) {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setReady(true);
      return;
    }

    registerMotionPlugins();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setReady(true) });

      if (circleRef.current) {
        tl.fromTo(
          circleRef.current,
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.55, ease: 'power2.inOut' }
        );
      }
      if (wordRef.current) {
        tl.fromTo(
          wordRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'awgzoOut' },
          '-=0.3'
        );
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  if (dismissed) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#10191f] px-6"
    >
      <div className="relative flex flex-col items-center gap-5">
        <svg width="84" height="84" viewBox="0 0 84 84" fill="none" aria-hidden="true">
          <circle
            ref={circleRef}
            cx="42"
            cy="42"
            r="34"
            stroke="#e86d22"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        <div
          ref={wordRef}
          className="font-display text-2xl font-bold tracking-[0.26em] text-white"
        >
          AWGZO
        </div>
      </div>

      {ready ? (
        <button
          type="button"
          onClick={() => {
            onEnter();
            setDismissed(true);
          }}
          className="mt-8 cursor-pointer rounded-full border border-[#e86d22]/60 bg-[#e86d22]/15 px-7 py-3 font-mono-tabular text-xs font-semibold tracking-[0.18em] text-[#ff9a55] uppercase transition-colors hover:bg-[#e86d22] hover:text-[#10191f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e86d22]"
        >
          Enter AWGZO · sound on
        </button>
      ) : (
        <p className="mt-8 font-mono-tabular text-xs tracking-[0.16em] text-[#9fa3a5] uppercase">
          Initialising experience…
        </p>
      )}
    </div>
  );
}
