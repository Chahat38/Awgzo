import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Glasses, ShieldAlert, X } from 'lucide-react';
import { useReality } from '../../context/RealityContext';
import { GlassCard, MagneticCta } from '../ui/Glass';

export default function WebXROverlay() {
  const { vrOverlayOpen, setVrOverlayOpen, setPanoOpen } = useReality();
  const [vrSupported, setVrSupported] = useState<boolean | null>(null);
  const [inSession, setInSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const activeSessionRef = useRef<XRSession | null>(null);

  useEffect(() => {
    if (!vrOverlayOpen) return;
    let cancelled = false;
    setErrorMsg(null);
    if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((supported) => {
          if (!cancelled) setVrSupported(supported);
        })
        .catch(() => {
          if (!cancelled) setVrSupported(false);
        });
    } else {
      setVrSupported(false);
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVrOverlayOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelled = true;
      window.removeEventListener('keydown', onKey);
      if (activeSessionRef.current) {
        activeSessionRef.current.end().catch(() => {});
      }
    };
  }, [vrOverlayOpen, setVrOverlayOpen]);

  const startHeadsetSession = async () => {
    if (!navigator.xr || !hostRef.current) return;
    setErrorMsg(null);
    try {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(320, 180);
      renderer.xr.enabled = true;
      hostRef.current.innerHTML = '';
      hostRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#080808');
      const camera = new THREE.PerspectiveCamera(70, 16 / 9, 0.1, 100);
      camera.position.set(0, 1.6, 0);

      // Stand-still comfort room: orange horizon reticle + subtle pedestal + grid
      const grid = new THREE.GridHelper(24, 24, '#E86C22', '#262626');
      scene.add(grid);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.03, 16, 64),
        new THREE.MeshBasicMaterial({ color: '#E86C22' })
      );
      ring.position.set(0, 1.6, -4);
      scene.add(ring);

      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      });
      activeSessionRef.current = session;
      setInSession(true);

      session.addEventListener('end', () => {
        setInSession(false);
        activeSessionRef.current = null;
        renderer.setAnimationLoop(null);
        renderer.dispose();
      });

      await renderer.xr.setSession(session);
      renderer.setAnimationLoop(() => {
        ring.rotation.z += 0.008;
        renderer.render(scene, camera);
      });
    } catch {
      setErrorMsg('Could not open the immersive session. Use the 360° browser room instead.');
      setVrSupported(false);
    }
  };

  if (!vrOverlayOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="webxr-modal-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <GlassCard className="w-full max-w-xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
              WebXR Comfort Room · 360° View
            </span>
            <h2 id="webxr-modal-title" className="mt-1 font-display text-2xl font-bold text-white">
              Enter Virtual Room
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setVrOverlayOpen(false)}
            aria-label="Exit 360° view dialog"
            className="rounded-full border border-white/15 bg-white/5 p-2 text-white transition hover:border-[#E86C22] hover:bg-[#E86C22] hover:text-[#080808] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs text-[#A0A0A0]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#E86C22]" />
          <span>
            Comfort notice: stand-still horizon space with vignette stabilization. If you feel uncomfortable, exit anytime.
          </span>
        </div>

        <div ref={hostRef} className="sr-only" />

        {vrSupported === null && (
          <p className="mt-5 text-sm text-[#A0A0A0]">Checking WebXR headset capabilities…</p>
        )}

        {vrSupported === true && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-white/90">
              WebXR immersive view hardware detected.
            </p>
            <div className="flex flex-wrap gap-3">
              <MagneticCta variant="orange" onClick={startHeadsetSession}>
                <Glasses className="h-4 w-4" />
                {inSession ? '360° Session Active' : 'Launch 360° View'}
              </MagneticCta>
              <MagneticCta
                variant="glass"
                onClick={() => {
                  setVrOverlayOpen(false);
                  setPanoOpen(true);
                }}
              >
                Explore in 360° Instead
              </MagneticCta>
            </div>
          </div>
        )}

        {vrSupported === false && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 p-4 text-sm text-white">
              Headset not detected — explore in 360° instead.
            </div>
            {errorMsg && <p className="text-xs text-[#E86C22]">{errorMsg}</p>}
            <div className="flex flex-wrap gap-3">
              <MagneticCta
                variant="orange"
                onClick={() => {
                  setVrOverlayOpen(false);
                  setPanoOpen(true);
                }}
              >
                <Glasses className="h-4 w-4" /> Open 360° Spatial Room
              </MagneticCta>
              <MagneticCta variant="glass" onClick={() => setVrOverlayOpen(false)}>
                Close
              </MagneticCta>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
