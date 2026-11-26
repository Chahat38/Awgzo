import { useEffect, useRef } from 'react';
import { ArrowUpRight, Clock, Compass, Gamepad2, Hand, ScanFace } from 'lucide-react';
import { AWGZO_PRODUCTS, type ProductIcon } from '../../data/products';
import { GlassCard } from '../../components/ui/Glass';
import { gsap, registerMotionPlugins } from '../../lib/scroll';

const ICONS: Record<ProductIcon, typeof Compass> = {
  compass: Compass,
  face: ScanFace,
  hand: Hand,
  game: Gamepad2,
};

export function ProductsShowcase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    registerMotionPlugins();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.prod-head', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
      gsap.from('.prod-card', {
        y: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="products"
      ref={sectionRef}
      aria-label="AWGZO products"
      className="relative z-10 border-t border-white/[0.08] py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="prod-head">
          <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-[#e86d22]">
            Built by AWGZO
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Our <span className="text-[#e86d22]">Products</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#9fa3a5]">
            Live AR and web products made in our studio. Open any product to try it
            yourself.
          </p>
        </div>

        <div
          ref={gridRef}
          className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {AWGZO_PRODUCTS.map((product) => {
            const Icon = ICONS[product.icon];
            const hasLink = product.url.trim().length > 0;
            return (
              <GlassCard
                key={product.id}
                className="prod-card flex h-full flex-col overflow-hidden rounded-3xl"
                contentClassName="flex h-full flex-col"
              >
                <div
                  className="relative grid h-40 place-items-center overflow-hidden border-b border-white/10"
                  style={{
                    background:
                      'radial-gradient(260px 160px at 50% 40%, rgba(232,109,34,0.32), transparent 70%), #10191f',
                  }}
                >
                  <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[#e86d22]/50 bg-[#10191f]/70 text-[#ee8a52] shadow-[0_0_32px_rgba(232,109,34,0.35)]">
                    <Icon className="h-8 w-8" strokeWidth={1.6} />
                  </span>
                  <span className="font-mono-tabular absolute left-4 top-4 text-[10px] uppercase tracking-[0.2em] text-white/60">
                    {product.tag}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-bold text-white">{product.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#9fa3a5]">
                    {product.description}
                  </p>

                  {hasLink ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center justify-center gap-2 self-start rounded-full bg-gradient-to-br from-[#e86d22] to-[#ee8a52] px-6 py-3 text-sm font-bold text-[#10191f] no-underline transition hover:brightness-110"
                    >
                      Visit Website <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Website link coming soon"
                      className="mt-5 inline-flex cursor-not-allowed items-center justify-center gap-2 self-start rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/55"
                    >
                      <Clock className="h-4 w-4" /> Link Coming Soon
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
