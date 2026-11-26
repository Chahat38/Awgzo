import { useEffect, useRef, useState } from 'react';
import { gsap, registerMotionPlugins } from '../../lib/scroll';

interface BrandedLoaderProps {
  onComplete: () => void;
}

/**
 * Under-1.2s skippable intro drawing the orange Living Lens circle
 * before handing focus smoothly to the Hero iris reveal.
 */
export function BrandedLoader({ onComplete }: BrandedLoaderProps) {
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const wordRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDismissed(true);
      onComplete();
      return;
    }

    registerMotionPlugins();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setDismissed(true);
          onComplete();
        },
      });

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
      if (rootRef.current) {
        tl.to(rootRef.current, {
          opacity: 0,
          duration: 0.28,
          ease: 'power2.out',
          delay: 0.08,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [onComplete]);

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

      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          onComplete();
        }}
        className="mt-8 font-mono-tabular text-xs tracking-[0.16em] text-[#9fa3a5] uppercase transition-colors hover:text-[#e86d22] cursor-pointer"
      >
        Skip Intro
      </button>
    </div>
  );
}
