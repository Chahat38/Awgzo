import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, CheckCircle2, Glasses, Layers } from 'lucide-react';
import { useReality } from '../context/RealityContext';
import { GlassCard, MagneticCta } from '../components/ui/Glass';
import { getTeamMembers } from '../data/team';

const BASE_SECTIONS = [
  { id: 'hero', label: '01 · Hero', owner: 'Part A' },
  { id: 'services', label: '02 · Services (Particle Morph)', owner: 'Merged v9' },
  { id: 'portfolio', label: '03 · Portfolio (Curved Cylinder Gallery)', owner: 'Part A' },
  { id: 'reality-lab', label: '04 · RealityLab (AR Mirror & 360° View)', owner: 'Part A' },
  { id: 'team', label: '05 · Team (Crew Dossier)', owner: 'Part A' },
  { id: 'testimonials', label: '06 · Testimonials (3D Fly-through)', owner: 'Merged v9' },
  { id: 'python-lab', label: '07 · <PythonLibSlot />', owner: 'Part B Slot' },
  { id: 'contact', label: '08 · Contact (Iris Reveal Portal)', owner: 'Part A' },
  { id: 'footer', label: '09 · Footer (Depth Letters + 3D Logo)', owner: 'Merged v9' },
];

export default function PreviewPage() {
  const { setVrOverlayOpen, setPanoOpen } = useReality();
  const navigate = useNavigate();
  const [xrCaps, setXrCaps] = useState({ ar: false, vr: false, checked: false });
  const hasTeam = useMemo(() => getTeamMembers().length > 0, []);
  const sections = useMemo(
    () => (hasTeam ? BASE_SECTIONS : BASE_SECTIONS.filter((s) => s.id !== 'team')),
    [hasTeam]
  );

  useEffect(() => {
    const check = async () => {
      let ar = false;
      let vr = false;
      if (typeof navigator !== 'undefined' && navigator.xr) {
        try {
          ar = await navigator.xr.isSessionSupported('immersive-ar');
        } catch {
          ar = false;
        }
        try {
          vr = await navigator.xr.isSessionSupported('immersive-vr');
        } catch {
          vr = false;
        }
      }
      setXrCaps({ ar, vr, checked: true });
    };
    check();
  }, []);

  return (
    <>
      <Helmet>
        <title>Section Preview | AWGZO</title>
      </Helmet>

      <main className="relative z-10 min-h-screen pt-28 pb-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
          <div>
            <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-orange">
              /preview · Section Inspector
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Section Jump &amp; XR Capabilities
            </h1>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <GlassCard className="p-6" tone="orange">
              <div className="font-mono-tabular text-xs font-semibold text-orange">
                INTERACTIVE XR TOOLS
              </div>
              <p className="mt-2 text-sm text-white/60">
                Test headset WebXR support or jump straight into the 360° studio portal.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <MagneticCta variant="orange" onClick={() => navigate('/?section=reality-lab')}>
                  <Layers className="h-4 w-4" /> Open AR Lab
                </MagneticCta>
                <MagneticCta variant="glass" onClick={() => setVrOverlayOpen(true)}>
                  <Glasses className="h-4 w-4 text-orange" /> Test 360° View
                </MagneticCta>
                <MagneticCta variant="glass" onClick={() => setPanoOpen(true)}>
                  <Layers className="h-4 w-4" /> Open 360° Horizon
                </MagneticCta>
              </div>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 font-mono-tabular text-xs text-white/80">
                <div className="flex items-center justify-between">
                  <span>navigator.xr (immersive-ar)</span>
                  <span className={xrCaps.ar ? 'text-white' : 'text-white/60'}>
                    {xrCaps.checked ? (xrCaps.ar ? 'Supported' : 'Camera Mirror Fallback') : 'Checking…'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>navigator.xr (immersive-vr)</span>
                  <span className={xrCaps.vr ? 'text-white' : 'text-white/60'}>
                    {xrCaps.checked ? (xrCaps.vr ? 'Supported' : 'Uses 360° Fallback') : 'Checking…'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Team section</span>
                  <span className="text-orange">
                    {hasTeam ? 'Visible' : 'Hidden cleanly (empty array)'}
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" depth="low">
              <div className="font-mono-tabular text-xs font-semibold text-white">
                PAGE SECTIONS &amp; INTEGRATION SLOTS
              </div>
              <div className="mt-4 grid gap-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => navigate(`/?section=${s.id}`)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left text-xs transition hover:border-orange/60 hover:bg-white/[0.07] cursor-pointer"
                  >
                    <span className="font-medium text-white">{s.label}</span>
                    <span className="inline-flex items-center gap-2 font-mono-tabular text-[11px] text-white/60">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          s.owner === 'Part A' ? 'text-orange' : 'text-white/40'
                        }`}
                      />
                      {s.owner}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link to="/work/3d-ar-ecommerce" className="text-xs font-semibold text-orange hover:underline">
                  View Case Study (/work/3d-ar-ecommerce) →
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
