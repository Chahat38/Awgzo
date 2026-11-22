import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTeamMembers, type TeamMember } from '../../data/team';
import { useReality } from '../../context/RealityContext';
import { gsap, ScrollTrigger, registerMotionPlugins } from '../../lib/scroll';
import './team.css';

const HERO_VIDEO = '/assets/video/man-interacting-with-virtual-hologram.mp4';
const PARTICLES = Array.from({ length: 18 }, (_, i) => i);

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

const clampTilt = (value: number) => Math.max(-12, Math.min(12, value));

function Avatar({ member, className = '' }: { member: TeamMember; className?: string }) {
  return (
    <span className={`hc-avatar ${className}`}>
      {member.photo ? (
        <img src={member.photo} alt={`${member.name}, ${member.role}`} loading="lazy" />
      ) : (
        <span aria-hidden="true">{getInitials(member.name)}</span>
      )}
    </span>
  );
}

export function Team() {
  const members = useMemo(() => getTeamMembers(), []);
  const count = members.length;
  const step = 360 / count;

  const { setActiveSection, sceneStateRef } = useReality();
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const numberRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const particlesRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const pinTriggerRef = useRef<ScrollTrigger | null>(null);
  const activeIndexRef = useRef(0);
  const sectionActiveRef = useRef(false);
  const touchStartX = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const active = members[activeIndex] ?? members[0];

  /* Keep the global XR scene aware that the crew section is in view. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        sectionActiveRef.current = visible;
        if (visible) {
          setActiveSection('team');
          sceneStateRef.current.section = 'team';
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [sceneStateRef, setActiveSection]);

  const goTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(count - 1, index));
      const trigger = pinTriggerRef.current;

      if (!trigger) {
        activeIndexRef.current = next;
        setActiveIndex(next);
        return;
      }

      const target = trigger.start + ((next + 0.04) / count) * (trigger.end - trigger.start);
      window.scrollTo({ top: target, behavior: 'smooth' });
    },
    [count]
  );

  /* Pinned scroll carousel: 700vh desktop, compact stack on phones, fade list for reduced motion. */
  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin || typeof window === 'undefined') return;

    registerMotionPlugins();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const created: Array<{ kill: () => void }> = [];
    const ring = ringRef.current;
    if (ring) gsap.set(ring, { rotateY: 0, scale: 0.3, opacity: 0 });

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        id: 'hc-team-pin',
        trigger: section,
        start: 'top top',
        end: '+=700%',
        pin,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const next = Math.min(count - 1, Math.floor(progress * count));

          if (next !== activeIndexRef.current) {
            activeIndexRef.current = next;
            setActiveIndex(next);
            if (ring) {
              gsap.to(ring, {
                rotateY: -next * step,
                duration: 0.85,
                ease: 'power3.inOut',
                overwrite: 'auto',
              });
            }
          }

          if (progressRef.current) {
            gsap.set(progressRef.current, { scaleX: Math.max(0.001, progress) });
          }
          if (bgRef.current) {
            gsap.set(bgRef.current, { yPercent: -15 * progress });
          }
          if (particlesRef.current) {
            const drift = gsap.utils.clamp(-48, 48, self.getVelocity() / 45);
            gsap.to(particlesRef.current, {
              x: drift,
              yPercent: -8 * progress,
              duration: 0.45,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }

          /* Exit: collapse the ring as the next section approaches. */
          const exit = progress > 0.92 ? (progress - 0.92) / 0.08 : 0;
          if (ring) {
            gsap.set(ring, { scale: 1 - exit * 0.3, opacity: 1 - exit });
          }
          gsap.set(pin, { opacity: 1 - exit * 0.35 });
        },
      });
      pinTriggerRef.current = trigger;
      created.push(trigger);

      /* Entry: oversized heading settles to the top while the ring zooms in from depth. */
      const intro = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 85%', end: 'top top', scrub: 1 },
      });
      intro
        .fromTo(
          headingRef.current,
          { scale: 1.85, y: 90, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, ease: 'power3.out', duration: 1 },
          0
        )
        .fromTo(
          ring,
          { scale: 0.3, opacity: 0 },
          { scale: 1, opacity: 1, ease: 'power3.out', duration: 1 },
          0
        );
      created.push(intro);
    }, section);

    return () => {
      created.forEach((item) => item.kill());
      ctx.revert();
      pinTriggerRef.current = null;
    };
  }, [count, step]);

  /* Number flip, masked name reveal, bio fade and active-card scan sweep. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animations: gsap.core.Tween[] = [];
    if (numberRef.current) {
      animations.push(
        gsap.fromTo(
          numberRef.current,
          { yPercent: 70, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            yPercent: 0,
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.62,
            ease: 'power3.out',
          }
        )
      );
    }
    if (nameRef.current) {
      animations.push(
        gsap.fromTo(
          nameRef.current,
          { yPercent: 45, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            yPercent: 0,
            opacity: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.7,
            ease: 'power3.out',
          }
        )
      );
    }
    const scan = pinRef.current?.querySelector<HTMLElement>(
      `[data-card-index="${activeIndex}"] .hc-scan`
    );
    if (scan) {
      animations.push(
        gsap.fromTo(
          scan,
          { yPercent: -110, opacity: 1 },
          { yPercent: 110, opacity: 0, duration: 0.8, ease: 'power2.inOut' }
        )
      );
    }

    return () => animations.forEach((tween) => tween.kill());
  }, [activeIndex]);

  /* Keyboard navigation while the pinned section owns the viewport. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!sectionActiveRef.current) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        goTo(activeIndexRef.current + 1);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        goTo(activeIndexRef.current - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goTo]);

  const handleParticlePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cursorRef.current) return;
    gsap.set(cursorRef.current, { x: event.clientX, y: event.clientY });
  };

  const handleCardTilt = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const inner = event.currentTarget.querySelector<HTMLElement>('.hc-card-inner');
    if (!inner) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const rotateX = clampTilt(
      -((event.clientY - (rect.top + rect.height / 2)) / rect.height) * 24
    );
    const rotateY = clampTilt(((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 24);
    gsap.to(inner, { rotateX, rotateY, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  };

  const resetCardTilt = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const inner = event.currentTarget.querySelector<HTMLElement>('.hc-card-inner');
    if (!inner) return;
    gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' });
  };

  const handleMagneticMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - (rect.left + rect.width / 2)) / rect.width) * 18;
    const y = ((event.clientY - (rect.top + rect.height / 2)) / rect.height) * 18;
    gsap.to(el, { x, y, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  };

  const resetMagnetic = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    gsap.to(event.currentTarget, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(delta) < 48) return;
    goTo(activeIndexRef.current + (delta < 0 ? 1 : -1));
  };

  return (
    <section
      id="team"
      ref={sectionRef}
      className="hc-team"
      aria-labelledby="hc-team-title"
      tabIndex={-1}
    >
      <div
        ref={pinRef}
        className="hc-pin"
        onPointerMove={handleParticlePointer}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Parallax headset hero + perspective grid floor */}
        <div ref={bgRef} className="hc-bg" aria-hidden="true">
          <video className="hc-bg-video" src={HERO_VIDEO} autoPlay muted loop playsInline preload="metadata" />
          <div className="hc-grid-floor" />
          <div className="hc-vignette" />
        </div>

        <div ref={particlesRef} className="hc-particles" aria-hidden="true">
          {PARTICLES.map((i) => (
            <i key={i} style={{ '--p': i } as CSSProperties} />
          ))}
        </div>

        <div className="hc-stage">
          <header className="hc-header">
            <span className="hc-mono hc-kicker">04 · The crew / Holographic index</span>
            <h2 id="hc-team-title" ref={headingRef} className="hc-title">
              Meet the <em>AR VR XR</em> Team
            </h2>
            <p className="hc-intro">Seven disciplines. One Islamabad studio. Scroll to rotate the crew.</p>
          </header>

          <div className="hc-number" ref={numberRef} key={`number-${active.id}`}>
            <span className="hc-number-current">{active.index}</span>
            <span className="hc-number-sep">/</span>
            <span className="hc-number-total">{String(count).padStart(2, '0')}</span>
          </div>

          {/* Desktop / tablet: CSS 3D holographic carousel */}
          <div className="hc-ring-wrap">
            <div
              ref={ringRef}
              className="hc-ring"
              style={{ '--hc-ring-rotation': `${-activeIndex * step}deg` } as CSSProperties}
            >
              {members.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  data-card-index={index}
                  data-active={index === activeIndex}
                  aria-label={`Show ${member.name}, ${member.role}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => goTo(index)}
                  onPointerEnter={() => setCursorVisible(true)}
                  onPointerLeave={() => {
                    setCursorVisible(false);
                    resetCardTilt({
                      currentTarget: document.querySelector<HTMLButtonElement>(
                        `[data-card-index="${index}"]`
                      )!,
                    } as ReactPointerEvent<HTMLButtonElement>);
                  }}
                  onPointerMove={handleCardTilt}
                  className="hc-card"
                  style={
                    {
                      '--angle': `${index * step}deg`,
                      '--stack-offset': index - activeIndex,
                    } as CSSProperties
                  }
                >
                  <span className="hc-card-face">
                    <span className="hc-card-inner">
                      <span className="hc-card-top hc-mono">
                        <span>NODE {member.index}</span>
                        <span className="hc-live-dot" />
                      </span>
                      <Avatar member={member} className="hc-card-avatar" />
                      <span className="hc-card-name">{member.name}</span>
                      <span className="hc-card-role hc-mono">{member.role}</span>
                      <span className="hc-scan" />
                      <span className="hc-brackets" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile: sticky-feel vertical stack (no 3D ring) */}
          <div className="hc-mobile-stack">
            {members.map((member, index) => (
              <button
                key={member.id}
                type="button"
                className="hc-stack-card"
                data-active={index === activeIndex}
                style={{ '--stack-offset': index - activeIndex } as CSSProperties}
                aria-label={`Show ${member.name}, ${member.role}`}
                onClick={() => goTo(index)}
              >
                <Avatar member={member} className="hc-stack-avatar" />
                <span className="hc-stack-copy">
                  <span className="hc-mono">{member.index} / {member.role}</span>
                  <strong>{member.name}</strong>
                </span>
              </button>
            ))}
          </div>

          <div className="hc-details">
            <div className="hc-details-inner" key={active.id}>
              <span className="hc-mono hc-role">{active.role}</span>
              <h3 className="hc-name" ref={nameRef}>
                {Array.from(active.name).map((letter, i) => (
                  <span className="hc-char-mask" key={`${active.id}-${i}`}>
                    <span className="hc-char" style={{ '--char': i } as CSSProperties}>
                      {letter === ' ' ? '\u00a0' : letter}
                    </span>
                  </span>
                ))}
              </h3>
              <p className="hc-bio">{active.bio}</p>

              <div className="hc-socials">
                <a
                  href={active.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${active.name} on LinkedIn`}
                  onPointerMove={handleMagneticMove}
                  onPointerLeave={resetMagnetic}
                >
                  LinkedIn <ArrowUpRight aria-hidden="true" />
                </a>
                <a
                  href={active.links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${active.name} on Instagram`}
                  onPointerMove={handleMagneticMove}
                  onPointerLeave={resetMagnetic}
                >
                  Instagram <ArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <div className="hc-controls">
            <button
              type="button"
              className="hc-arrow"
              aria-label="Previous team member"
              onClick={() => goTo(activeIndex - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>

            <div className="hc-progress" role="group" aria-label="Team member progress">
              <span className="hc-progress-track">
                <span ref={progressRef} className="hc-progress-fill" />
              </span>
              <span className="hc-dots">
                {members.map((member, index) => (
                  <button
                    key={member.id}
                    type="button"
                    className="hc-dot"
                    data-active={index === activeIndex}
                    aria-label={`Jump to ${member.name}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    onClick={() => goTo(index)}
                  />
                ))}
              </span>
            </div>

            <button
              type="button"
              className="hc-arrow"
              aria-label="Next team member"
              onClick={() => goTo(activeIndex + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* AR focus-bracket cursor */}
        <div ref={cursorRef} className={`hc-cursor ${cursorVisible ? 'is-visible' : ''}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <span>+</span>
        </div>
      </div>

      {/* prefers-reduced-motion fallback: accessible, simple fade list */}
      <div className="hc-reduced-list">
        <div className="hc-reduced-inner">
          <span className="hc-mono hc-kicker">04 · The crew</span>
          <h2 id="hc-team-title-reduced" className="hc-title">Meet the <em>AR VR XR</em> Team</h2>
          <div className="hc-reduced-grid">
            {members.map((member) => (
              <article key={member.id} className="hc-reduced-card">
                <Avatar member={member} />
                <h3>{member.name}</h3>
                <span className="hc-mono">{member.role}</span>
                <p>{member.bio}</p>
                <a href={member.links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href={member.links.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
