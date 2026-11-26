import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Menu, X } from 'lucide-react';
import { AwgzoLogo } from '../../components/common/AwgzoLogo';
import { AWGZO_SITE } from '../../data/site';
import { useReality, type ActiveSectionId } from '../../context/RealityContext';
import { scrollToSection } from '../../lib/scroll';

const NAV_ITEMS: { label: string; target: string; section?: ActiveSectionId; path?: string }[] = [
  { label: 'Home', target: 'hero', section: 'hero' },
  { label: 'Services', target: 'services', section: 'services', path: '/services' },
  { label: 'Products', target: 'products', path: '/products' },
  { label: 'About', target: 'about', path: '/about' },
  { label: 'Contact', target: 'contact', section: 'contact', path: '/contact' },
];

export function Navbar() {
  const { activeSection, cameraRunning, wholePageHandControl } = useReality();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  const pageHandActive = cameraRunning && wholePageHandControl;

  const navItems = NAV_ITEMS;

  const handleJump = (targetId: string, path?: string) => {
    setMobileOpen(false);
    if (path) {
      if (location.pathname === path) window.scrollTo({ top: 0, behavior: 'smooth' });
      else navigate(path);
      return;
    }
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
        className={`fixed inset-x-0 top-4 z-50 px-4 transition-transform duration-300 ease-out ${
          hidden ? '-translate-y-24' : 'translate-y-0'
        }`}
      >
        <div
          className="relative mx-auto overflow-visible"
          style={{ maxWidth: 'min(1280px, calc(100vw - 32px))' }}
        >
          <div
            className="relative z-[2] grid min-h-[64px] items-center transition-[padding] duration-300"
            style={{
              gridTemplateColumns: 'auto 1fr auto',
              gap: 'clamp(16px, 2.4vw, 40px)',
              paddingInline: 'clamp(18px, 2.4vw, 32px)',
              paddingBlock: compact ? '8px' : '10px',
            }}
          >
            <div className="min-w-0 flex items-center shrink-0">
              <button
                type="button"
                onClick={() => handleJump('hero')}
                aria-label="AWGZO Home"
                {...(pageHandActive ? { 'data-hand-target': 'nav-hero' } : {})}
                className="flex items-center shrink-0 whitespace-nowrap rounded-full py-1 cursor-pointer"
              >
                <AwgzoLogo
                  compact={compact}
                  hideWordmarkBelow480
                  className="[&_img]:!h-[clamp(32px,3.2vw,40px)] [&_img]:!max-w-[160px]"
                />
              </button>
            </div>

            <nav
              aria-label="Primary navigation"
              className="min-w-0 hidden items-center justify-center gap-1.5 lg:flex"
            >
              {navItems.map((item) => {
                const isActive =
                  (item.path !== undefined && location.pathname === item.path) ||
                  (location.pathname === '/' && item.section !== undefined && activeSection === item.section);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleJump(item.target, item.path)}
                    {...(pageHandActive ? { 'data-hand-target': `nav-${item.target}` } : {})}
                    className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#e86d22] text-[#10191f] font-semibold'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="col-start-3 min-w-0 flex items-center justify-end gap-2">
              <a
                href={AWGZO_SITE.contact.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                {...(pageHandActive ? { 'data-hand-target': 'nav-book-call' } : {})}
                className="hidden min-[480px]:inline-flex items-center gap-2 rounded-full bg-[#e86d22] px-5 py-2.5 text-sm font-semibold text-[#10191f] transition hover:bg-[#ee8a52] whitespace-nowrap shrink-0"
              >
                <Calendar className="h-4 w-4" />
                Free Consultation
              </a>

              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[#e86d22] lg:hidden cursor-pointer"
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
          className="fixed inset-0 z-[70] flex flex-col justify-between bg-[#10191f] p-6 lg:hidden"
        >
          <div className="flex items-center justify-between gap-4">
            <AwgzoLogo className="[&_img]:!h-[clamp(36px,3.6vw,44px)] [&_img]:!max-w-[180px]" />
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
                onClick={() => handleJump(item.target, item.path)}
                className="text-left font-display text-4xl font-bold text-white transition-colors hover:text-[#e86d22] cursor-pointer"
              >
                <span className="font-mono-tabular mr-3 text-sm text-[#e86d22]">0{idx + 1}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-6">
            <a
              href={AWGZO_SITE.contact.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e86d22] py-4 text-base font-semibold text-[#10191f]"
            >
              <Calendar className="h-5 w-5" /> Free Consultation
            </a>
          </div>
        </div>
      )}
    </>
  );
}