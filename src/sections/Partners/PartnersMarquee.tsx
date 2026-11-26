const PARTNERS = [
  { name: 'Ignite National Technology Fund', src: '/logos/ignite.png' },
  { name: 'KPITB', src: '/logos/kpitb.jpg' },
  { name: 'Kohat University of Science & Technology', src: '/logos/kust.jpg' },
  { name: 'PITB', src: '/logos/pitb.png' },
];

function LogoRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="awgzo-marquee-row" aria-hidden={hidden || undefined}>
      {PARTNERS.map((p) => (
        <li key={p.name} className="awgzo-marquee-item">
          <img
            src={p.src}
            alt={hidden ? '' : p.name}
            title={p.name}
            decoding="async"
            draggable={false}
            onError={(e) => {
              e.currentTarget.parentElement?.classList.add('is-broken');
            }}
          />
        </li>
      ))}
    </ul>
  );
}

export function PartnersMarquee() {
  return (
    <section
      id="partners"
      aria-label="Our partners and supporters"
      className="relative z-10 overflow-hidden border-t border-white/[0.08] py-12 lg:py-16"
    >
      <p className="mb-8 text-center font-mono-tabular text-[0.75rem] uppercase tracking-[0.25em] text-[#ee8a52]">
        Trusted by &amp; worked with
      </p>
      <div className="awgzo-marquee">
        <div className="awgzo-marquee-track">
          <LogoRow />
          <LogoRow hidden />
        </div>
      </div>
    </section>
  );
}