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
            className="relative z-[2] grid min-h-[56px] items-center transition-[padding] duration-300"
            style={{
              gridTemplateColumns: 'auto 1fr auto',
              gap: 'clamp(12px, 2vw, 32px)',
              paddingInline: 'clamp(14px, 2vw, 24px)',
              paddingBlock: compact ? '6px' : '8px',
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
                <AwgzoLogo compact={compact} hideWordmarkBelow480 />
              </button>
            </div>

            <nav
              aria-label="Primary navigation"
              className="min-w-0 hidden items-center justify-center gap-1 lg:flex"
            >
              {navItems.map((item) => {
                const isActive = location.pathname === '/' && activeSection === item.section;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleJump(item.target)}
                    {...(pageHandActive ? { 'data-hand-target': `nav-${item.target}` } : {})}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#E86C22] text-[#080808] font-semibold'
                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="min-w-0 flex items-center justify-end gap-2">
              <a
                href={AWGZO_SITE.contact.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                {...(pageHandActive ? { 'data-hand-target': 'nav-book-call' } : {})}
                className="hidden min-[480px]:inline-flex items-center gap-1.5 rounded-full bg-[#E86C22] px-4 py-2 text-xs font-semibold text-[#080808] transition hover:bg-[#FD9800] whitespace-nowrap shrink-0"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book a Call
              </a>

              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-expanded={mobileOpen}
                aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[#E86C22] lg:hidden cursor-pointer"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
          className="fixed inset-0 z-[70] flex flex-col justify-between bg-[#080808]/95 p-6 backdrop-blur-2xl lg:hidden"
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
                className="text-left font-display text-3xl font-bold text-white transition-colors hover:text-[#E86C22] cursor-pointer"
              >
                <span className="font-mono-tabular mr-3 text-xs text-[#E86C22]">0{idx + 1}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 pt-6">
            <a
              href={AWGZO_SITE.contact.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#E86C22] py-3.5 text-sm font-semibold text-[#080808]"
            >
              <Calendar className="h-4 w-4" /> Book a Free Call
            </a>
          </div>
        </div>
      )}
    </>
  );
}
