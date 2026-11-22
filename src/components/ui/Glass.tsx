import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { gsap } from '../../lib/scroll';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: 'neutral' | 'orange';
  depth?: 'low' | 'high';
  interactiveGlow?: boolean;
  className?: string;
  contentClassName?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  {
    children,
    tone = 'neutral',
    depth = 'high',
    interactiveGlow = true,
    className = '',
    contentClassName = '',
    ...rest
  },
  forwardedRef
) {
  const localRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(forwardedRef, () => localRef.current as HTMLDivElement);

  useEffect(() => {
    const el = localRef.current;
    if (!el || !interactiveGlow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const mxState = { val: 0 };
    const myState = { val: 0 };
    const setMx = gsap.quickTo(mxState, 'val', {
      duration: 0.25,
      ease: 'power2.out',
      onUpdate: () => {
        el.style.setProperty('--mx', `${mxState.val}px`);
      },
    });
    const setMy = gsap.quickTo(myState, 'val', {
      duration: 0.25,
      ease: 'power2.out',
      onUpdate: () => {
        el.style.setProperty('--my', `${myState.val}px`);
      },
    });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      setMx(e.clientX - rect.left);
      setMy(e.clientY - rect.top);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, [interactiveGlow]);

  const toneClass = tone === 'orange' ? 'awgzo-glass--orange' : '';
  const depthClass = depth === 'low' ? 'awgzo-glass--low' : '';

  return (
    <div
      ref={localRef}
      className={`awgzo-glass ${toneClass} ${depthClass} ${className}`}
      {...rest}
    >
      {interactiveGlow && <div aria-hidden="true" className="awgzo-glass-spotlight" />}
      <div aria-hidden="true" className="awgzo-glass-grain" />
      <div className={`relative z-[2] ${contentClassName}`}>{children}</div>
    </div>
  );
});

/* Magnetic Interactive Glass / Accent CTA */
export function MagneticCta({
  children,
  variant = 'orange',
  className = '',
  cursorLabel = 'OPEN',
  onClick,
  type = 'button',
  disabled = false,
  ...rest
}: {
  children: ReactNode;
  variant?: 'orange' | 'glass';
  className?: string;
  cursorLabel?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>) {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.38, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.38, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - (rect.left + rect.width / 2)) * 0.16);
      yTo((e.clientY - (rect.top + rect.height / 2)) * 0.16);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const styles =
    variant === 'orange'
      ? 'bg-orange text-black font-semibold hover:bg-orange border border-orange/60'
      : 'awgzo-glass awgzo-glass--low text-white font-medium hover:border-orange/60';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-cursor={cursorLabel}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm whitespace-nowrap shrink-0 transition-[background-color,border-color,color] duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
