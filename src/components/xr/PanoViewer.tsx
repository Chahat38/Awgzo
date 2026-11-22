import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Calendar, ChevronLeft, ChevronRight, Compass, Glasses, Mail, RotateCcw, X } from 'lucide-react';
import { useReality } from '../../context/RealityContext';
import { AWGZO_SITE } from '../../data/site';
import { scrollToSection } from '../../lib/scroll';
import { GlassCard } from '../ui/Glass';

export interface PanoHotspot {
  id: string;
  label: string;
  description: string;
  position: [number, number, number];
  action?: 'try-ar' | 'book' | 'enter-vr' | 'contact';
}

export const AWGZO_PORTAL_HOTSPOTS: PanoHotspot[] = [
  {
    id: 'ar-dev',
    label: 'AR Development',
    description: 'Interactive augmented reality experiences across mobile, web, and iOS built to engage audiences.',
    position: [-7.2, 1.5, -7.2],
  },
  {
    id: 'ar-try-on',
    label: 'AR Try-On',
    description: 'Let shoppers inspect 3D products and preview scale directly in their room via WebAR.',
    position: [-3.4, -0.4, -8.8],
    action: 'try-ar',
  },
  {
    id: 'ar-cards',
    label: 'AR Business Cards',
    description: 'Scannable print cards projecting 3D brand showcases and instant action links.',
    position: [0.4, 2.0, -9.2],
  },
  {
    id: 'snap-ar-effects',
    label: 'Snap AR Effects',
    description: 'Custom Effect House filters powered by face-mesh tracking and real-time shaders.',
    position: [4.2, -0.2, -8.5],
  },
  {
    id: 'web-ecom',
    label: 'Website & E-commerce',
    description: 'Fast, responsive websites and digital storefronts designed for conversion across every screen.',
    position: [7.6, 1.4, -6.8],
  },
  {
    id: 'book-call',
    label: 'Free Consultation',
    description: 'Schedule a free discovery session on Calendly to plan your AR or web project.',
    position: [5.2, 2.2, 6.2],
    action: 'book',
  },
  {
    id: 'enter-vr',
    label: 'Enter 360° View',
    description: 'Explore the 360° studio horizon right in your browser — no headset needed.',
    position: [-5.5, 1.8, 6.5],
    action: 'enter-vr',
  },
];

export interface PanoViewportHandle {
  applySpatialDelta: (delta: {
    yaw?: number;
    pitch?: number;
    zoom?: number;
    roll?: number;
  }) => void;
  resetView: () => void;
  cycleHotspot: (dir: 'prev' | 'next') => void;
  openHotspotById: (id: string) => void;
  closeInfoCard: () => void;
}

function createSpatialHorizonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createLinearGradient(16,25,31, canvas.height);
    grad.addColorStop(0, '#10191f');
    grad.addColorStop(0.45, '#10191f');
    grad.addColorStop(0.5, '#e86d22');
    grad.addColorStop(0.55, '#10191f');
    grad.addColorStop(1, '#10191f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(247,248,247,0.14)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 32; y < canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(232,109,34,0.85)';
    ctx.font = 'bold 20px monospace';
    ['N · AR LAB', 'E · STUDIO', 'S · HORIZON', 'W · PORTAL'].forEach((label, idx) => {
      ctx.fillText(label, idx * 256 + 44, 244);
    });
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export const PanoViewport = forwardRef<
  PanoViewportHandle,
  { className?: string; handTargets?: boolean; onTargetsChanged?: () => void }
>(function PanoViewport({ className = 'h-[360px]', handTargets = false, onTargetsChanged }, ref) {
  const { setPanoOpen, setVrOverlayOpen } = useReality();
  const [stereo, setStereo] = useState(false);
  const [gyro, setGyro] = useState(false);
  const [selectedHotspotIdx, setSelectedHotspotIdx] = useState<number | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hotspotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const infoCardRef = useRef<HTMLDivElement | null>(null);

  const stereoRef = useRef(stereo);
  const gyroRef = useRef(gyro);
  const selectedIdxRef = useRef<number | null>(selectedHotspotIdx);
  const keyInputRef = useRef({ yaw: 0, pitch: 0 });
  const gyroAnglesRef = useRef({ alpha: 0, beta: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rollRef = useRef(0);
  const externalDeltaRef = useRef({ yaw: 0, pitch: 0, zoom: 0, roll: 0 });

  stereoRef.current = stereo;
  gyroRef.current = gyro;
  selectedIdxRef.current = selectedHotspotIdx;

  const hotspotVectors = useMemo(
    () => AWGZO_PORTAL_HOTSPOTS.map((h) => new THREE.Vector3(...h.position)),
    []
  );

  useEffect(() => {
    onTargetsChanged?.();
  }, [selectedHotspotIdx, onTargetsChanged]);

  const resetView = useCallback(() => {
    const cam = cameraRef.current;
    if (cam) {
      cam.fov = 68;
      cam.position.set(16,25,31.1);
      cam.rotation.set(16,25,31);
      cam.updateProjectionMatrix();
    }
    rollRef.current = 0;
    externalDeltaRef.current = { yaw: 0, pitch: 0, zoom: 0, roll: 0 };
    controlsRef.current?.reset();
    setSelectedHotspotIdx(null);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      applySpatialDelta: ({ yaw = 0, pitch = 0, zoom = 0, roll = 0 }) => {
        externalDeltaRef.current.yaw += yaw;
        externalDeltaRef.current.pitch += pitch;
        externalDeltaRef.current.zoom += zoom;
        externalDeltaRef.current.roll += roll;
      },
      resetView,
      cycleHotspot: (dir) => {
        setSelectedHotspotIdx((prev) => {
          const total = AWGZO_PORTAL_HOTSPOTS.length;
          if (prev === null) return 0;
          return dir === 'next' ? (prev + 1) % total : (prev - 1 + total) % total;
        });
      },
      openHotspotById: (id) => {
        const idx = AWGZO_PORTAL_HOTSPOTS.findIndex((h) => h.id === id);
        if (idx >= 0) setSelectedHotspotIdx(idx);
      },
      closeInfoCard: () => setSelectedHotspotIdx(null),
    }),
    [resetView]
  );

  useEffect(() => {
    if (!gyro) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null && e.beta !== null) {
        gyroAnglesRef.current.alpha = THREE.MathUtils.degToRad(e.alpha);
        gyroAnglesRef.current.beta = THREE.MathUtils.degToRad(e.beta - 90);
      }
    };
    window.addEventListener('deviceorientation', onOrient);
    return () => window.removeEventListener('deviceorientation', onOrient);
  }, [gyro]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    let disposed = false;
    const scene = new THREE.Scene();
    const fallbackTexture = createSpatialHorizonTexture();
    let loadedPanoTex: THREE.Texture | null = null;
    const geometry = new THREE.SphereGeometry(24, 64, 40);
    const material = new THREE.MeshBasicMaterial({ map: fallbackTexture, side: THREE.DoubleSide });
    const dome = new THREE.Mesh(geometry, material);
    dome.scale.set(-1, 1, 1);
    scene.add(dome);

    if (AWGZO_SITE.panoHorizonImage) {
      const loader = new THREE.TextureLoader();
      loader.load(
        AWGZO_SITE.panoHorizonImage,
        (tex) => {
          if (disposed) {
            tex.dispose();
            return;
          }
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.needsUpdate = true;
          loadedPanoTex = tex;
          material.map = tex;
          material.needsUpdate = true;
        },
        undefined,
        () => {
          // Keep procedural horizon fallback cleanly on load failure
        }
      );
    }

    const camera = new THREE.PerspectiveCamera(68, 16 / 9, 0.1, 100);
    camera.position.set(16,25,31.1);
    cameraRef.current = camera;

    const rightCamera = new THREE.PerspectiveCamera(68, 8 / 9, 0.1, 100);

    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = -0.45;
    controls.saveState();
    controlsRef.current = controls;

    const resize = () => {
      if (!renderer || !container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const projVec = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    const toTarget = new THREE.Vector3();

    let raf = 0;
    const renderLoop = () => {
      if (!renderer || !container) return;

      if (document.hidden) {
        raf = requestAnimationFrame(renderLoop);
        return;
      }

      // Consume queued hand yaw/pitch/zoom/roll deltas cleanly
      const ext = externalDeltaRef.current;
      if (ext.yaw !== 0 || ext.pitch !== 0) {
        camera.rotation.order = 'YXZ';
        camera.rotation.y += ext.yaw;
        camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x + ext.pitch, -1.1, 1.1);
        ext.yaw = 0;
        ext.pitch = 0;
      }
      if (Math.abs(ext.zoom) > 0.001) {
        camera.fov = THREE.MathUtils.clamp(camera.fov - ext.zoom, 36, 92);
        camera.updateProjectionMatrix();
        ext.zoom = 0;
      }
      if (Math.abs(ext.roll) > 0.0005) {
        rollRef.current = THREE.MathUtils.clamp(rollRef.current + ext.roll, -0.25, 0.25);
        camera.rotation.z = rollRef.current;
        ext.roll = 0;
      }

      if (gyroRef.current) {
        camera.rotation.order = 'YXZ';
        camera.rotation.y = gyroAnglesRef.current.alpha;
        camera.rotation.x = THREE.MathUtils.clamp(gyroAnglesRef.current.beta, -1.1, 1.1);
      } else {
        controls.update();
        if (keyInputRef.current.yaw !== 0 || keyInputRef.current.pitch !== 0) {
          camera.rotation.order = 'YXZ';
          camera.rotation.y += keyInputRef.current.yaw * 0.03;
          camera.rotation.x = THREE.MathUtils.clamp(
            camera.rotation.x + keyInputRef.current.pitch * 0.03,
            -1.1,
            1.1
          );
        }
      }

      const w = container.clientWidth;
      const h = container.clientHeight;

      if (stereoRef.current && w > 0 && h > 0) {
        const halfW = Math.floor(w / 2);
        camera.aspect = halfW / h;
        camera.updateProjectionMatrix();
        rightCamera.aspect = halfW / h;
        rightCamera.fov = camera.fov;
        rightCamera.position.copy(camera.position).add(new THREE.Vector3(0.06, 0, 0));
        rightCamera.quaternion.copy(camera.quaternion);
        rightCamera.updateProjectionMatrix();

        renderer.setScissorTest(true);
        renderer.setViewport(0, 0, halfW, h);
        renderer.setScissor(0, 0, halfW, h);
        renderer.render(scene, camera);

        renderer.setViewport(halfW, 0, w - halfW, h);
        renderer.setScissor(halfW, 0, w - halfW, h);
        renderer.render(scene, rightCamera);
        renderer.setScissorTest(false);
      } else if (w > 0 && h > 0) {
        if (Math.abs(camera.aspect - w / h) > 0.01) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
        renderer.setViewport(0, 0, w, h);
        renderer.render(scene, camera);
      }

      // Project 3D hotspot pins
      camera.getWorldDirection(camDir);
      hotspotVectors.forEach((worldPt, i) => {
        const btn = hotspotRefs.current[i];
        if (!btn) return;
        toTarget.copy(worldPt).sub(camera.position).normalize();
        const inFront = camDir.dot(toTarget) > 0.08;
        if (!inFront) {
          btn.style.opacity = '0';
          btn.style.pointerEvents = 'none';
          return;
        }
        projVec.copy(worldPt).project(camera);
        const sx = (projVec.x * 0.5 + 0.5) * (stereoRef.current ? w * 0.5 : w);
        const sy = (-projVec.y * 0.5 + 0.5) * h;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
      });

      // Billboard glass info card anchored gently near active hotspot
      if (selectedIdxRef.current !== null && infoCardRef.current) {
        const worldPt = hotspotVectors[selectedIdxRef.current];
        if (worldPt) {
          projVec.copy(worldPt).project(camera);
          const clampX = Math.max(150, Math.min(w - 150, (projVec.x * 0.5 + 0.5) * w));
          const clampY = Math.max(120, Math.min(h - 115, (-projVec.y * 0.5 + 0.5) * h));
          infoCardRef.current.style.transform = `translate3d(${clampX}px, ${clampY}px, 0) translate(-50%, -50%)`;
        }
      }

      raf = requestAnimationFrame(renderLoop);
    };

    raf = requestAnimationFrame(renderLoop);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      geometry.dispose();
      material.dispose();
      fallbackTexture.dispose();
      loadedPanoTex?.dispose();
      renderer?.dispose();
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, [hotspotVectors]);

  const toggleGyro = async () => {
    const devOrient = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (!gyro && typeof devOrient?.requestPermission === 'function') {
      try {
        const res = await devOrient.requestPermission();
        if (res !== 'granted') return;
      } catch {
        return;
      }
    }
    setGyro((v) => !v);
  };

  const activeHotspot =
    selectedHotspotIdx !== null ? AWGZO_PORTAL_HOTSPOTS[selectedHotspotIdx] : null;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') keyInputRef.current = { yaw: 1, pitch: 0 };
    else if (e.key === 'ArrowRight') keyInputRef.current = { yaw: -1, pitch: 0 };
    else if (e.key === 'ArrowUp') keyInputRef.current = { yaw: 0, pitch: 1 };
    else if (e.key === 'ArrowDown') keyInputRef.current = { yaw: 0, pitch: -1 };
  };

  const onKeyUp = () => {
    keyInputRef.current = { yaw: 0, pitch: 0 };
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Interactive 360 spatial horizon viewer. Drag, use arrow keys, or hand gestures to explore."
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      className={`relative overflow-hidden rounded-2xl border border-white/15 bg-black outline-none ${className}`}
    >
      {webglUnavailable ? (
        <div
          className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-white/60"
          style={{
            background:
              'linear-gradient(180deg, #10191f 0%, #10191f 46%, rgba(232,109,34,0.35) 50%, #10191f 100%)',
          }}
        >
          360° Spatial Horizon Room
        </div>
      ) : (
        <canvas ref={canvasRef} className="block h-full w-full" />
      )}

      {stereo && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-[1px] bg-white/25"
        />
      )}

      {/* Projected 3D Hotspots with >= 72x72px hit targets */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {AWGZO_PORTAL_HOTSPOTS.map((hs, idx) => (
          <button
            key={hs.id}
            ref={(el) => {
              hotspotRefs.current[idx] = el;
            }}
            type="button"
            onClick={() => {
              setSelectedHotspotIdx(idx);
              if (hs.action === 'enter-vr') setVrOverlayOpen(true);
            }}
            data-cursor="OPEN"
            {...(handTargets ? { 'data-hand-target': `hotspot-${hs.id}` } : {})}
            aria-label={hs.label}
            className="group absolute left-0 top-0 flex min-h-[72px] min-w-[72px] items-center justify-center p-2 cursor-pointer"
            style={{ opacity: 0 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange/80 bg-black/90 px-3 py-1.5 font-mono-tabular text-[11px] font-semibold text-white backdrop-blur-md transition-transform group-hover:scale-110 group-data-[hand-hover=true]:scale-115 group-hover:bg-orange group-hover:text-black whitespace-nowrap shadow-lg">
              <span className="h-2 w-2 rounded-full bg-orange group-hover:bg-black" />
              <span>{hs.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Billboarded 3D Glass Info Card when Hotspot Clicked */}
      {activeHotspot && selectedHotspotIdx !== null && (
        <div
          ref={infoCardRef}
          className="absolute left-1/2 top-1/2 z-30 w-[min(92%,340px)] -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        >
          <GlassCard className="p-4 sm:p-5" tone="orange">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono-tabular text-[10px] font-semibold uppercase tracking-[0.18em] text-orange">
                0{selectedHotspotIdx + 1} / 0{AWGZO_PORTAL_HOTSPOTS.length} · SPATIAL NODE
              </span>
              <button
                type="button"
                onClick={() => setSelectedHotspotIdx(null)}
                aria-label="Close hotspot info card"
                {...(handTargets ? { 'data-hand-target': 'info-close' } : {})}
                className="flex min-h-[72px] min-w-[72px] -m-4 items-center justify-center rounded-full text-white/80 hover:text-white cursor-pointer"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <X className="h-4 w-4" />
                </span>
              </button>
            </div>

            <h3 className="mt-1 font-display text-lg font-bold text-white">
              {activeHotspot.label}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-white/60">
              {activeHotspot.description}
            </p>

            {/* Primary Card Actions >= 72px touch/hand area */}
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={AWGZO_SITE.contact.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                {...(handTargets ? { 'data-hand-target': 'info-book' } : {})}
                className="inline-flex min-h-[72px] flex-1 items-center justify-center gap-1.5 rounded-2xl bg-orange px-4 py-2 text-xs font-semibold text-black hover:bg-orange"
              >
                <Calendar className="h-3.5 w-3.5" /> Free Consultation
              </a>

              <button
                type="button"
                onClick={() => {
                  setPanoOpen(false);
                  setSelectedHotspotIdx(null);
                  scrollToSection('contact');
                }}
                {...(handTargets ? { 'data-hand-target': 'info-contact' } : {})}
                className="inline-flex min-h-[72px] flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:border-orange cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 text-orange" /> Contact us
              </button>
            </div>

            {/* Prev / Next Navigation */}
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() =>
                  setSelectedHotspotIdx(
                    (selectedHotspotIdx - 1 + AWGZO_PORTAL_HOTSPOTS.length) %
                      AWGZO_PORTAL_HOTSPOTS.length
                  )
                }
                {...(handTargets ? { 'data-hand-target': 'info-prev' } : {})}
                className="inline-flex min-h-[72px] min-w-[72px] items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 font-mono-tabular text-xs text-white hover:border-orange cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>

              <button
                type="button"
                onClick={() =>
                  setSelectedHotspotIdx((selectedHotspotIdx + 1) % AWGZO_PORTAL_HOTSPOTS.length)
                }
                {...(handTargets ? { 'data-hand-target': 'info-next' } : {})}
                className="inline-flex min-h-[72px] min-w-[72px] items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 font-mono-tabular text-xs text-white hover:border-orange cursor-pointer"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Top Portal Controls */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full border border-white/15 bg-black/75 px-3 py-1 font-mono-tabular text-[11px] text-white/85 backdrop-blur-md">
          360° Portal · {AWGZO_PORTAL_HOTSPOTS.length} Hotspots
        </span>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={resetView}
            title="Reset 360 View"
            {...(handTargets ? { 'data-hand-target': 'pano-reset' } : {})}
            className={`group inline-flex items-center justify-center rounded-full cursor-pointer ${
              handTargets ? 'min-h-[72px] min-w-[72px] -my-3' : 'min-h-[44px]'
            }`}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-1.5 font-mono-tabular text-[11px] text-white backdrop-blur-md transition group-hover:border-orange">
              <RotateCcw className="h-3.5 w-3.5 text-orange" /> Reset
            </span>
          </button>
          <button
            type="button"
            onClick={toggleGyro}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-1 font-mono-tabular text-[11px] backdrop-blur-md transition cursor-pointer ${
              gyro
                ? 'border-orange bg-orange text-black'
                : 'border-white/20 bg-black/75 text-white hover:border-orange'
            }`}
          >
            <Compass className="h-3.5 w-3.5" /> {gyro ? 'Gyro On' : 'Gyro'}
          </button>
          <button
            type="button"
            onClick={() => setStereo((s) => !s)}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 py-1 font-mono-tabular text-[11px] backdrop-blur-md transition cursor-pointer ${
              stereo
                ? 'border-orange bg-orange text-white'
                : 'border-white/20 bg-black/75 text-white hover:border-white/40'
            }`}
          >
            <Glasses className="h-3.5 w-3.5" /> {stereo ? 'Stereo On' : 'Stereo'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function PanoModal() {
  const { panoOpen, setPanoOpen } = useReality();

  useEffect(() => {
    if (!panoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanoOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panoOpen, setPanoOpen]);

  if (!panoOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pano-modal-title"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <GlassCard className="w-full max-w-4xl p-6 sm:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.2em] text-orange">
              Interactive 360° Spatial Room
            </span>
            <h2 id="pano-modal-title" className="mt-1 font-display text-2xl font-bold text-white">
              AWGZO 360° Portal View
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setPanoOpen(false)}
            aria-label="Close 360 viewer"
            className="rounded-full border border-white/15 bg-white/5 p-2 text-white transition hover:border-orange hover:bg-orange hover:text-black cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <PanoViewport className="h-[420px]" />
        <p className="mt-3 text-xs text-white/60">
          Drag, use arrow keys, or control with hand gestures inside Reality Lab.
        </p>
      </GlassCard>
    </div>
  );
}
