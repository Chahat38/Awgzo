import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/scroll';
import { useReality } from '../../context/RealityContext';

export function RealityCursor() {
  const { mode } = useReality();
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [interactive, setInteractive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = cursorRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.16, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.16, ease: 'power3.out' });
    let dwellTween: gsap.core.Tween | null = null;

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        '[data-cursor], a, button, input, select, textarea'
      );
      const customLabel = target?.getAttribute('data-cursor') || null;
      const isHovering = Boolean(target);

      setLabel(customLabel);
      setInteractive((prev) => {
        if (prev !== isHovering && mode === 'VR' && progressCircleRef.current) {
          dwellTween?.kill();
          if (isHovering) {
            dwellTween = gsap.fromTo(
              progressCircleRef.current,
              { strokeDashoffset: 113 },
              { strokeDashoffset: 0, duration: 0.8, ease: 'linear' }
            );
          } else {
            gsap.set(progressCircleRef.current, { strokeDashoffset: 113 });
          }
        }
        return isHovering;
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      dwellTween?.kill();
      window.removeEventListener('pointermove', onMove);
    };
  }, [enabled, mode]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[99] -translate-x-1/2 -translate-y-1/2"
    >
      {mode === 'VR' ? (
        /* VR Gaze Pointer with 800ms Dwell Fill Ring */
        <div className="relative flex h-11 w-11 items-center justify-center">
          <svg width="42" height="42" viewBox="0 0 42 42" className="-rotate-90">
            <circle
              cx="21"
              cy="21"
              r="18"
              fill="none"
              stroke="rgba(247,248,247,0.22)"
              strokeWidth="1.5"
            />
            <circle
              ref={progressCircleRef}
              cx="21"
              cy="21"
              r="18"
              fill="none"
              stroke="#e86d22"
              strokeWidth="2.5"
              strokeDasharray="113"
              strokeDashoffset="113"
              strokeLinecap="round"
            />
          </svg>
          <span
            className={`absolute h-1.5 w-1.5 rounded-full transition-transform ${
              interactive ? 'scale-150 bg-orange' : 'bg-white'
            }`}
          />
          {label && (
            <span className="font-mono-tabular absolute left-12 whitespace-nowrap rounded-full border border-white/20 bg-black/90 px-2.5 py-0.5 text-[10px] font-semibold text-white">
              {label}
            </span>
          )}
        </div>
      ) : (
        /* AR Mode (and MIX): Orange Corner-Bracket Reticle */
        <div
          className={`relative flex items-center justify-center transition-[width,height] duration-200 ${
            interactive ? 'h-12 w-12' : 'h-7 w-7'
          }`}
        >
          <span className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-orange" />
          <span className="absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-orange" />
          <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-orange" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-orange" />
          <span className="h-1 w-1 rounded-full bg-white" />
          {label && (
            <span className="font-mono-tabular absolute left-14 whitespace-nowrap rounded-md border border-orange/50 bg-black/90 px-2 py-0.5 text-[10px] font-semibold text-orange">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
