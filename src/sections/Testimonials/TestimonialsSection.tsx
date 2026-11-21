import { useEffect, useRef } from 'react';
import { useReality } from '../../context/RealityContext';
import { gsap, registerMotionPlugins, ScrollTrigger } from '../../lib/scroll';

const TESTIMONIALS = [
  {
    quote:
      'They did an excellent job in website development, delivering high-quality results with great attention to detail. Their strong communication skills and solid business understanding make them a valuable asset.',
    name: 'M. Shaoor',
    role: 'Manager, Zawiya Academy',
  },
  {
    quote:
      'I wholeheartedly recommend Ahmad Waleed to any company looking for a talented digital marketer, consultant or augmented reality (AR) developer. His growth-oriented mindset makes him an asset to any team.',
    name: 'Saeed Anwar',
    role: 'CEO, Maktek',
  },
  {
    quote:
      'Great job, Waleed. Proud of you. I appreciate your professionalism and thank you for your continued support and help.',
    name: 'Shahryar Lodhi',
    role: 'Chairman',
  },
  {
    quote: 'The website is outstanding, and every option and feature works well.',
    name: 'Tayyaba',
    role: 'Marketing Manager',
  },
];

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<HTMLDivElement | null>(null);
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    registerMotionPlugins();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveSection('testimonials');
          sceneStateRef.current.section = 'testimonials';
        }
      },
      { threshold: 0.25 }
    );
    sectionObserver.observe(el);

    const panels = Array.from(sceneRef.current?.children ?? []) as HTMLElement[];
    const dots = Array.from(dotsRef.current?.children ?? []) as HTMLElement[];

    const fly = (progress: number) => {
      const position = progress * (TESTIMONIALS.length - 1);
      const isNarrow = window.innerWidth < 700;

      panels.forEach((panel, index) => {
        const distance = index - position;
        const magnitude = Math.abs(distance);
        const side = index % 2 === 1 ? 1 : -1;

        gsap.set(panel, {
          xPercent: -50,
          yPercent: -50,
          z: -distance * 650,
          x: side * Math.min(magnitude, 2) * (isNarrow ? 40 : 230),
          rotationY: -side * Math.min(magnitude, 2) * 14,
          opacity: distance < 0 ? Math.max(0, 1 + distance * 1.7) : Math.max(0, 1 - distance * 0.8),
          filter: `blur(${Math.min(magnitude, 2) * 5}px)`,
          zIndex: 100 - Math.round(magnitude * 10),
        });
      });

      dots.forEach((dot, index) => dot.classList.toggle('on', index === Math.round(position)));
    };

    fly(0);

    if (reducedMotion) {
      return () => sectionObserver.disconnect();
    }

    let currentProgress = 0;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '+=300%',
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        currentProgress = self.progress;
        fly(self.progress);
      },
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        trigger.scroll(trigger.start + (trigger.end - trigger.start) * (index / (TESTIMONIALS.length - 1)));
      });
    });

    const onResize = () => fly(currentProgress);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      sectionObserver.disconnect();
      trigger.kill();
    };
  }, [sceneStateRef, setActiveSection]);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      aria-label="Client testimonials section"
      className="relative z-10 h-[100svh] min-h-[620px] overflow-hidden border-t border-white/[0.08] bg-[#080808]"
    >
      <h2 className="absolute inset-x-0 top-[9vh] z-[110] text-center font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-none tracking-[0.03em]">
        What Clients Say About AWGZO
      </h2>

      <div
        ref={sceneRef}
        className="absolute inset-0"
        style={{ perspective: '900px', transformStyle: 'preserve-3d' }}
      >
        {TESTIMONIALS.map((item) => (
          <article
            key={item.name}
            className="absolute left-1/2 top-[54%] w-[min(560px,88vw)] rounded-[24px] border border-white/[0.18] bg-gradient-to-br from-white/[0.12] to-white/[0.03] p-5 sm:p-[34px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.25)]"
          >
            <div className="h-[28px] font-display text-[3.5rem] leading-[0.6] text-[#E86C22] sm:h-[34px] sm:text-[4rem]">“</div>
            <p className="my-2 text-[0.95rem] leading-[1.55] text-white sm:text-[clamp(1rem,2.1vw,1.2rem)] sm:leading-[1.6]">{item.quote}</p>
            <div className="mt-5">
              <strong className="block font-semibold text-white">{item.name}</strong>
              <span className="text-sm text-[#FF9A55]">{item.role}</span>
            </div>
          </article>
        ))}
      </div>

      <div
        ref={dotsRef}
        className="ts-dots absolute right-[clamp(12px,3vw,40px)] top-1/2 z-[120] grid -translate-y-1/2 gap-3"
      >
        {TESTIMONIALS.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-label={`Go to testimonial from ${item.name}`}
            className={`h-2 w-2 rounded-full bg-white/20 transition-all duration-300 ${
              index === 0 ? 'scale-150 bg-[#FF9A55] shadow-[0_0_12px_#FF9A55]' : ''
            }`}
          />
        ))}
      </div>
    </section>
  );
}
