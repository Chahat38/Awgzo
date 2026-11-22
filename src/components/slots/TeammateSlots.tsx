import { useEffect, useRef } from 'react';
import { useReality, type ActiveSectionId } from '../../context/RealityContext';
import { ServicesSection } from '../../sections/Services/ServicesSection';
import { TestimonialsSection } from '../../sections/Testimonials/TestimonialsSection';
import { FooterSection } from '../../sections/Footer/FooterSection';

interface TeammateSlotProps {
  id: ActiveSectionId;
  slotName: string;
  title: string;
  description: string;
}

function TeammateSlotShell({ id, slotName, title, description }: TeammateSlotProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActiveSection(id);
          sceneStateRef.current.section = id;
          if (id === 'model') {
            sceneStateRef.current.modelSlotBoost = 1;
          }
        } else if (id === 'model') {
          sceneStateRef.current.modelSlotBoost = 0;
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [id, setActiveSection, sceneStateRef]);

  return (
    <section
      id={id}
      ref={ref}
      aria-label={`${title} section`}
      className="relative z-10 border-t border-white/[0.08] py-16"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="rounded-2xl border border-dashed border-white/15 bg-black/55 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono-tabular text-xs font-semibold text-orange">
              INTEGRATION SLOT · {slotName}
            </span>
            <span className="font-mono-tabular text-[11px] text-white/60">#{id}</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/60">{description}</p>
        </div>
      </div>
    </section>
  );
}

export function ServicesSlot() {
  return <ServicesSection />;
}

export function TestimonialsSlot() {
  return <TestimonialsSection />;
}

export function PythonLibSlot() {
  return (
    <TeammateSlotShell
      id="python-lab"
      slotName="<PythonLibSlot />"
      title="Python Library Integration Slot"
      description="Mount boundary (#python-lab) reserved for Part B Python library showcase."
    />
  );
}

export function FooterSlot() {
  return <FooterSection />;
}
