import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X } from 'lucide-react';
import { AwgzoLogo } from '../../components/common/AwgzoLogo';
import { AWGZO_SITE } from '../../data/site';
import { getTeamMembers } from '../../data/team';
import { useReality, type ActiveSectionId } from '../../context/RealityContext';
import { scrollToSection } from '../../lib/scroll';

const BASE_NAV_ITEMS: { label: string; target: string; section: ActiveSectionId }[] = [
  { label: 'Home', target: 'hero', section: 'hero' },
  { label: 'Services', target: 'services', section: 'services' },
  { label: 'Work', target: 'portfolio', section: 'portfolio' },
  { label: 'AR Lab', target: 'reality-lab', section: 'reality-lab' },
  { label: 'Team', target: 'team', section: 'team' },
  { label: 'Contact', target: 'contact', section: 'contact' },
];

export function Navbar() {
  const { activeSection, cameraRunning, wholePageHandControl } = useReality();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  const hasTeam = useMemo(() => getTeamMembers().length > 0, []);
  const pageHandActive = cameraRunning && wholePageHandControl;

  const navItems = useMemo(
    () => (hasTeam ? BASE_NAV_ITEMS : BASE_NAV_ITEMS.filter((i) => i.section !== 'team')),
    [hasTeam]
  );

  const handleJump = (targetId: string) => {
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/?section=${targetId}`);
      return;
    }
    scrollToSection(targetId);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      const y = window.scrollY;
      setCompact(y > 90);
      if (y > 160 && y > lastScrollY.current + 8 && !mobileOpen) {
        setHidden(true);
      } else if (y < lastScrollY.current - 8 || y <= 160) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-3.5 z-50 px-3 transition-transform duration-300 ease-out ${
          hidden ? '-translate-y-24' : 'translate-y-0'
        }`}
      >
        <div
          className="relative mx-auto overflow-visible"
          style={{ maxWidth: 'min(1200px, calc(100vw - 24px))' }}
        >
          <div
            aria-hidden="true"
            className="awgzo-glass pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          />

          <div
            className="relative z-[2] flex min-h-[56px] items-center justify-between transition-[padding] duration-300"
            style={{
              gap: 'clamp(12px, 2vw, 32px)',
              paddingInline: 'clamp(14px, 2vw, 24px)',
              paddingBlock: compact ? '6px' : '8px',
            }}
          >
            <div className="flex min-w-0 shrink-0 items-center">
              <button
                type="button"
                onClick={() => handleJump('hero')}
                aria-label="AWGZO Home"
                {...(pageHandActive ? { 'data-hand-target': 'nav-hero' } : {})}
                className="flex shrink-0 items-center whitespace-nowrap rounded-full py-1 cursor-pointer"
              >
                <AwgzoLogo compact={compact} hideWordmarkBelow480 />
              </button>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-4">
              <nav
                aria-label="Primary navigation"
                className="hidden min-w-0 items-center gap-1 lg:flex"
              >
                {navItems.map((item) => {
                  const isActive = location.pathname === '/' && activeSection === item.section;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleJump(item.target)}
                      {...(pageHandActive ? { 'data-hand-target': `nav-${item.target}` } : {})}
                      className={`rounded-full px-3 py-1.5 text-[17px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-orange text-black font-semibold'
                          : 'text-white/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <a
                href={AWGZO_SITE.contact.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                {...(pageHandActive ? { 'data-hand-target': 'nav-book-call' } : {})}
                className="hidden min-[480px]:inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange px-4 py-2 text-[17px] font-semibold text-black transition hover:bg-orange whitespace-nowrap"
              >
                <Calendar className="h-4 w-4" />
                Free Consultation
              </a>

              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-orange lg:hidden cursor-pointer"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay (includes CTA for <480px screens) */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-[70] flex flex-col justify-between bg-black/95 p-6 backdrop-blur-2xl lg:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <AwgzoLogo />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close mobile menu"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 py-8">
            {navItems.map((item, idx) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleJump(item.target)}
                className="text-left font-display text-3xl font-bold text-white transition-colors hover:text-orange cursor-pointer"
              >
                <span className="font-mono-tabular mr-3 text-xs text-orange">0{idx + 1}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-6">
            <a
              href={AWGZO_SITE.contact.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-orange py-3.5 text-sm font-semibold text-black"
            >
              <Calendar className="h-4 w-4" /> Free Consultation
            </a>
          </div>
        </div>
      )}
    </>
  );
}
