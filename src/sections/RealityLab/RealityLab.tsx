import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Compass,
  Crosshair,
  Glasses,
  Hand,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { useReality } from '../../context/RealityContext';
import { GlassCard } from '../../components/ui/Glass';
import { PanoViewport, type PanoViewportHandle } from '../../components/xr/PanoViewer';
import { AWGZO_SITE } from '../../data/site';
import { gsap, scrollPageBy, scrollToSection } from '../../lib/scroll';
import {
  HandUIMachine,
  collectHandTargets,
  playHandClickSound,
  type CachedTarget,
  type HandLandmark,
} from '../../lib/handUI';

interface RadialSliceItem {
  id: string;
  label: string;
  sublabel: string;
}

const RADIAL_SLICES: RadialSliceItem[] = [
  { id: 'ar-try-on', label: 'AR Try-On', sublabel: 'Live WebAR view' },
  { id: 'ar-cards', label: 'AR Business Card', sublabel: 'Open 3D card' },
  { id: 'tiktok-effects', label: 'TikTok Effects', sublabel: 'Face shaders' },
  { id: 'web-ecom', label: 'Web & E-comm', sublabel: 'Storefronts' },
  { id: 'book-call', label: 'Book a Call', sublabel: 'Calendly node' },
  { id: 'reset-view', label: 'Reset View', sublabel: 'Center 360°' },
];

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const TUTORIAL_STORAGE_KEY = 'awgzo-hand-tutorial-done';

interface HandDetectorLike {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number
  ) => {
    landmarks?: HandLandmark[][];
    handednesses?: Array<Array<{ score?: number }>>;
  };
  close?: () => void;
}

export function RealityLab() {
  const {
    setActiveSection,
    setVrOverlayOpen,
    wholePageHandControl,
    setWholePageHandControl,
    handScrollEnabled,
    setHandScrollEnabled,
    cameraRunning,
    setCameraRunning,
    sceneStateRef,
  } = useReality();

  const sectionRef = useRef<HTMLElement | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const panoRef = useRef<PanoViewportHandle | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<HandDetectorLike | null>(null);

  // Floating cursor + radial DOM refs updated at rAF rate without React re-renders
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const reticleRingRef = useRef<SVGCircleElement | null>(null);
  const rippleRef = useRef<HTMLDivElement | null>(null);
  const radialContainerRef = useRef<HTMLDivElement | null>(null);
  const radialBackdropRef = useRef<HTMLDivElement | null>(null);
  const radialSliceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const radialDwellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const radialTitleRef = useRef<HTMLDivElement | null>(null);

  // HUD live telemetry DOM refs (zero per-frame React state updates)
  const hudCoordsRef = useRef<HTMLSpanElement | null>(null);
  const hudStateRef = useRef<HTMLSpanElement | null>(null);
  const hudPinchTextRef = useRef<HTMLSpanElement | null>(null);
  const hudPinchBarRef = useRef<HTMLDivElement | null>(null);
  const hudFpsRef = useRef<HTMLSpanElement | null>(null);
  const hudConfRef = useRef<HTMLSpanElement | null>(null);

  // UI Toggles & Cards
  const [mobileTab, setMobileTab] = useState<'AR' | 'VR'>('AR');
  const [consentOpen, setConsentOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<'none' | 'denied' | 'not-found' | 'in-use' | 'unavailable'>('none');
  const [cameraStatus, setCameraStatus] = useState(
    'Camera off. Enable tracking to explore the AR lab hands-free.'
  );
  const [raiseHandVisible, setRaiseHandVisible] = useState(false);
  const [dwellEnabled, setDwellEnabled] = useState(true);
  const [pushClickEnabled, setPushClickEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [legendPage, setLegendPage] = useState<0 | 1>(0);
  const [radialVisible, setRadialVisible] = useState(false);
  const [lastGestureToast, setLastGestureToast] = useState<string | null>(null);

  // 3-step onboarding tutorial state
  const [tutorialStep, setTutorialStep] = useState<0 | 1 | 2 | 3>(0); // 0 = hidden, 1..3 active

  // Mirror mutable toggle values into refs for the ticker loop
  const optsRef = useRef({
    dwellEnabled,
    pushClickEnabled,
    soundEnabled,
    handScrollEnabled,
    wholePageHandControl,
    tutorialStep,
  });
  optsRef.current = {
    dwellEnabled,
    pushClickEnabled,
    soundEnabled,
    handScrollEnabled,
    wholePageHandControl,
    tutorialStep,
  };

  const machineRef = useRef(new HandUIMachine());
  const cachedTargetsRef = useRef<CachedTarget[]>([]);
  const prevHoverElRef = useRef<HTMLElement | null>(null);
  const wasRadialOpenRef = useRef(false);
  const tutorialCursorOriginRef = useRef<{ x: number; y: number } | null>(null);
  const lastFrameTimeRef = useRef(performance.now());
  const fpsSmoothRef = useRef(60);
  const latestDetectionRef = useRef<{
    landmarks: HandLandmark[][];
    confidence: number;
    videoTime: number;
  }>({ landmarks: [], confidence: 0, videoTime: -1 });

  const refreshTargetRects = useCallback(() => {
    if (typeof document === 'undefined') return;
    const scope: ParentNode | null = optsRef.current.wholePageHandControl
      ? document
      : consoleRef.current;
    if (!scope) {
      cachedTargetsRef.current = [];
      return;
    }
    cachedTargetsRef.current = collectHandTargets(scope);
  }, []);

  const showToast = useCallback((text: string) => {
    setLastGestureToast(text);
  }, []);

  useEffect(() => {
    if (!lastGestureToast) return;
    const t = window.setTimeout(() => setLastGestureToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [lastGestureToast]);

  // Intersection + initial subtle reveal + cached target rect observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActiveSection('reality-lab');
          sceneStateRef.current.section = 'reality-lab';
          refreshTargetRects();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);

    const ctx = gsap.context(() => {
      if (dividerRef.current) {
        gsap.fromTo(
          dividerRef.current,
          { opacity: 0.2, scaleY: 0.6 },
          {
            opacity: 1,
            scaleY: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 75%' },
          }
        );
      }
    }, el);

    window.addEventListener('resize', refreshTargetRects, { passive: true });
    window.addEventListener('scroll', refreshTargetRects, { passive: true });

    const mutObs = new MutationObserver(() => {
      refreshTargetRects();
    });
    mutObs.observe(wholePageHandControl ? document.body : consoleRef.current ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'disabled', 'aria-disabled'],
    });

    refreshTargetRects();

    return () => {
      obs.disconnect();
      ctx.revert();
      mutObs.disconnect();
      window.removeEventListener('resize', refreshTargetRects);
      window.removeEventListener('scroll', refreshTargetRects);
    };
  }, [setActiveSection, sceneStateRef, refreshTargetRects, wholePageHandControl]);

  useEffect(() => {
    refreshTargetRects();
  }, [
    wholePageHandControl,
    legendOpen,
    legendPage,
    consentOpen,
    cameraActive,
    tutorialStep,
    mobileTab,
    refreshTargetRects,
  ]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    try {
      detectorRef.current?.close?.();
    } catch {
      // Ignore detector teardown issues
    }
    detectorRef.current = null;
    latestDetectionRef.current = { landmarks: [], confidence: 0, videoTime: -1 };
    machineRef.current.resetAll();

    if (prevHoverElRef.current) {
      prevHoverElRef.current.removeAttribute('data-hand-hover');
      prevHoverElRef.current = null;
    }
    if (reticleRef.current) {
      reticleRef.current.style.opacity = '0';
    }
    setRadialVisible(false);
    setRaiseHandVisible(false);
    setCameraActive(false);
    setCameraRunning(false);
    setWholePageHandControl(false);
    setHandScrollEnabled(false);
    setCameraStatus('Camera stopped. Video stays strictly on your device.');

    if (hudCoordsRef.current) hudCoordsRef.current.textContent = '— / —';
    if (hudStateRef.current) hudStateRef.current.textContent = 'IDLE';
    if (hudPinchTextRef.current) hudPinchTextRef.current.textContent = '—';
    if (hudPinchBarRef.current) hudPinchBarRef.current.style.width = '0%';
    if (hudConfRef.current) hudConfRef.current.textContent = '—';
    if (hudFpsRef.current) hudFpsRef.current.textContent = '0';
  }, [setCameraRunning, setHandScrollEnabled, setWholePageHandControl]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleRadialAction = useCallback(
    (sliceIndex: number) => {
      const slice = RADIAL_SLICES[sliceIndex];
      if (!slice) return;

      if (optsRef.current.soundEnabled) playHandClickSound();
      showToast(`Menu: ${slice.label}`);

      switch (slice.id) {
        case 'ar-try-on':
          panoRef.current?.openHotspotById('ar-try-on');
          break;
        case 'ar-cards':
          panoRef.current?.openHotspotById('ar-cards');
          break;
        case 'tiktok-effects':
          panoRef.current?.openHotspotById('tiktok-effects');
          break;
        case 'web-ecom':
          panoRef.current?.openHotspotById('web-ecom');
          break;
        case 'book-call':
          panoRef.current?.openHotspotById('book-call');
          break;
        case 'reset-view':
          panoRef.current?.resetView();
          break;
      }

      machineRef.current.closeRadial();
      wasRadialOpenRef.current = false;
      setRadialVisible(false);
    },
    [showToast]
  );

  // Animate radial slices when radial menu opens/closes
  useEffect(() => {
    if (!radialVisible || !radialContainerRef.current) return;
    if (radialBackdropRef.current) {
      gsap.fromTo(radialBackdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.24, ease: 'power2.out' });
    }
    const items = radialSliceRefs.current.filter(Boolean);
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { scale: 0.45, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.34,
          stagger: 0.035,
          ease: 'back.out(1.6)',
        }
      );
    }
  }, [radialVisible]);

  const startCameraWithConsent = useCallback(async () => {
    setConsentOpen(false);
    setCameraError('none');

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setCameraError('unavailable');
      setCameraStatus('Camera requires a secure HTTPS or localhost connection.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('unavailable');
      setCameraStatus('Camera API is unavailable in this browser or blocked by frame policy.');
      return;
    }

    setCameraStatus('Requesting webcam stream…');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'user' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch (firstErr) {
      const firstName = firstErr instanceof Error ? firstErr.name : '';
      if (firstName === 'OverconstrainedError' || firstName === 'ConstraintNotSatisfiedError') {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (fallbackErr) {
          const errName = fallbackErr instanceof Error ? fallbackErr.name : '';
          setCameraActive(false);
          setCameraRunning(false);
          if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError' || errName === 'SecurityError') {
            setCameraError('denied');
            setCameraStatus('Camera permission blocked in browser or preview frame. Allow camera access or open in a new tab.');
          } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
            setCameraError('not-found');
            setCameraStatus('No camera device detected on this device.');
          } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
            setCameraError('in-use');
            setCameraStatus('Camera is busy in another app or browser tab.');
          } else {
            setCameraError('unavailable');
            setCameraStatus('Unable to access camera stream.');
          }
          return;
        }
      } else {
        setCameraActive(false);
        setCameraRunning(false);
        if (firstName === 'NotAllowedError' || firstName === 'PermissionDeniedError' || firstName === 'SecurityError') {
          setCameraError('denied');
          setCameraStatus('Camera permission blocked in browser or preview frame. Allow camera access or open in a new tab.');
        } else if (firstName === 'NotFoundError' || firstName === 'DevicesNotFoundError') {
          setCameraError('not-found');
          setCameraStatus('No camera device detected on this device.');
        } else if (firstName === 'NotReadableError' || firstName === 'TrackStartError') {
          setCameraError('in-use');
          setCameraStatus('Camera is busy in another app or browser tab.');
        } else {
          setCameraError('unavailable');
          setCameraStatus('Unable to start camera stream.');
        }
        return;
      }
    }

    streamRef.current = stream;

    const vid = videoRef.current;
    if (vid) {
      vid.muted = true;
      vid.playsInline = true;
      vid.setAttribute('playsinline', '');
      vid.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (vid.readyState >= 1) {
          resolve();
          return;
        }
        const onMeta = () => {
          vid.removeEventListener('loadedmetadata', onMeta);
          resolve();
        };
        vid.addEventListener('loadedmetadata', onMeta);
        window.setTimeout(resolve, 1500);
      });

      try {
        await vid.play();
      } catch {
        // Autoplay promise can throw harmlessly while muted stream still renders
      }
    }

    machineRef.current.resetAll();
    setCameraActive(true);
    setCameraRunning(true);
    setCameraStatus('Camera live — loading on-device 21-landmark hand tracker…');

    try {
      const done = sessionStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (!done) {
        tutorialCursorOriginRef.current = null;
        setTutorialStep(1);
      }
    } catch {
      tutorialCursorOriginRef.current = null;
      setTutorialStep(1);
    }

    try {
      const vision = await import('@mediapipe/tasks-vision');
      let fileset;
      try {
        fileset = await vision.FilesetResolver.forVisionTasks('/wasm');
      } catch {
        fileset = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm'
        );
      }

      try {
        detectorRef.current = (await vision.HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        })) as HandDetectorLike;
      } catch {
        detectorRef.current = (await vision.HandLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        })) as HandDetectorLike;
      }
      setCameraStatus('Live local tracking active · On-device only');
    } catch {
      detectorRef.current = null;
      setCameraStatus('Camera live — hand tracking model offline; mouse and touch remain active.');
    }
  }, [setCameraRunning]);

  const handleStartButtonClick = useCallback(async () => {
    try {
      if (navigator.permissions?.query) {
        const perm = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (perm.state === 'granted') {
          await startCameraWithConsent();
          return;
        }
      }
    } catch {
      // Permissions API optional across browsers
    }
    setConsentOpen(true);
  }, [startCameraWithConsent]);

  // Main GSAP ticker loop driving landmark detection + HandUIMachine + zero-rerender DOM reticle
  useEffect(() => {
    if (!cameraActive) return;

    const triggerPulseClick = (el: HTMLElement, x: number, y: number) => {
      if (optsRef.current.soundEnabled) playHandClickSound();
      el.setAttribute('data-hand-clicked', 'true');
      window.setTimeout(() => el.removeAttribute('data-hand-clicked'), 300);

      if (rippleRef.current) {
        rippleRef.current.style.left = `${x}px`;
        rippleRef.current.style.top = `${y}px`;
        gsap.fromTo(
          rippleRef.current,
          { scale: 0.4, opacity: 0.95 },
          { scale: 2.3, opacity: 0, duration: 0.42, ease: 'power2.out' }
        );
      }

      el.click();
    };

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastFrameTimeRef.current);
      lastFrameTimeRef.current = now;
      fpsSmoothRef.current = fpsSmoothRef.current * 0.88 + (1000 / dt) * 0.12;

      const vid = videoRef.current;
      const canvas = canvasRef.current;
      const detector = detectorRef.current;

      // Run MediaPipe only when a new video frame arrives
      if (detector && vid && vid.readyState >= 2 && vid.currentTime !== latestDetectionRef.current.videoTime) {
        try {
          const res = detector.detectForVideo(vid, now);
          const lms = res.landmarks ?? [];
          const score = res.handednesses?.[0]?.[0]?.score ?? (lms.length > 0 ? 0.85 : 0);
          latestDetectionRef.current = {
            landmarks: lms,
            confidence: lms.length > 0 ? score : 0,
            videoTime: vid.currentTime,
          };
        } catch {
          // Skip transient frame failure
        }
      }

      // Draw crisp mirrored 21-landmark skeleton synced to real stream resolution
      if (canvas && vid) {
        if (vid.videoWidth > 0 && vid.videoHeight > 0 && (canvas.width !== vid.videoWidth || canvas.height !== vid.videoHeight)) {
          canvas.width = vid.videoWidth;
          canvas.height = vid.videoHeight;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Calibrated active zone guide (~70% frame)
          ctx.strokeStyle = 'rgba(232, 108, 34, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(
            canvas.width * 0.15,
            canvas.height * 0.15,
            canvas.width * 0.7,
            canvas.height * 0.7
          );
          ctx.setLineDash([]);

          const hands = latestDetectionRef.current.landmarks;
          hands.forEach((hand) => {
            // Skeleton lines (mirrored X to match video CSS -scale-x-100)
            ctx.strokeStyle = 'rgba(232, 108, 34, 0.78)';
            ctx.lineWidth = 2;
            HAND_CONNECTIONS.forEach(([a, b]) => {
              const p1 = hand[a];
              const p2 = hand[b];
              if (!p1 || !p2) return;
              ctx.beginPath();
              ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
              ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
              ctx.stroke();
            });

            // Joints
            hand.forEach((pt, idx) => {
              const mx = (1 - pt.x) * canvas.width;
              const my = pt.y * canvas.height;
              const isTip = idx === 4 || idx === 8;
              ctx.beginPath();
              ctx.arc(mx, my, idx === 8 ? 7 : isTip ? 5 : 3, 0, Math.PI * 2);
              ctx.fillStyle = idx === 8 ? '#FFFFFF' : idx === 4 ? '#E86C22' : '#FD9800';
              ctx.fill();
              if (idx === 8) {
                ctx.beginPath();
                ctx.arc(mx, my, 12, 0, Math.PI * 2);
                ctx.strokeStyle = '#E86C22';
                ctx.lineWidth = 2;
                ctx.stroke();
              }
            });
          });
        }
      }

      const activeRect = optsRef.current.wholePageHandControl
        ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
        : consoleRef.current?.getBoundingClientRect() ?? {
            left: 0,
            top: 0,
            width: window.innerWidth,
            height: 600,
          };

      const out = machineRef.current.step(
        {
          landmarks: latestDetectionRef.current.landmarks,
          confidence: latestDetectionRef.current.confidence,
          timestampMs: now,
          consoleRect: activeRect,
          options: {
            dwellEnabled: optsRef.current.dwellEnabled,
            pushClickEnabled: optsRef.current.pushClickEnabled,
            dwellMs: 900,
            radialHoldMs: 700,
            fistHoldMs: 600,
            snapRadiusPx: 48,
          },
        },
        cachedTargetsRef.current
      );

      // Update floating HUD telemetry directly via DOM refs
      if (hudFpsRef.current) hudFpsRef.current.textContent = `${Math.round(fpsSmoothRef.current)}`;
      if (hudStateRef.current) hudStateRef.current.textContent = out.gestureState;

      if (!out.detected) {
        if (reticleRef.current) reticleRef.current.style.opacity = '0';
        if (prevHoverElRef.current) {
          prevHoverElRef.current.removeAttribute('data-hand-hover');
          prevHoverElRef.current = null;
        }
        setRaiseHandVisible(out.raisedPromptVisible);
        if (hudCoordsRef.current) hudCoordsRef.current.textContent = '— / —';
        if (hudConfRef.current) hudConfRef.current.textContent = '—';
        if (hudPinchTextRef.current) hudPinchTextRef.current.textContent = '—';
        if (hudPinchBarRef.current) hudPinchBarRef.current.style.width = '0%';
        return;
      }

      setRaiseHandVisible(false);

      // Telemetry text updates
      if (hudCoordsRef.current) {
        hudCoordsRef.current.textContent = `${Math.round(out.cursorX)} / ${Math.round(out.cursorY)}`;
      }
      if (hudConfRef.current) {
        hudConfRef.current.textContent = `${Math.round(out.confidence * 100)}%`;
      }
      if (hudPinchTextRef.current) {
        hudPinchTextRef.current.textContent = out.pinchRatio.toFixed(2);
      }
      if (hudPinchBarRef.current) {
        // Fill higher as fingers come closer (< 0.22 threshold)
        const clamped = Math.max(0, Math.min(1, 1 - (out.pinchRatio - 0.12) / 0.55));
        hudPinchBarRef.current.style.width = `${Math.round(clamped * 100)}%`;
      }

      // Tutorial step 1 completion: move cursor > 45px
      if (optsRef.current.tutorialStep === 1) {
        if (!tutorialCursorOriginRef.current) {
          tutorialCursorOriginRef.current = { x: out.cursorX, y: out.cursorY };
        } else {
          const moved = Math.hypot(
            out.cursorX - tutorialCursorOriginRef.current.x,
            out.cursorY - tutorialCursorOriginRef.current.y
          );
          if (moved > 45) setTutorialStep(2);
        }
      }

      // Position floating orange glass reticle
      const rx = optsRef.current.wholePageHandControl ? out.viewportX : out.cursorX;
      const ry = optsRef.current.wholePageHandControl ? out.viewportY : out.cursorY;

      if (reticleRef.current) {
        reticleRef.current.style.opacity = '1';
        const scale =
          out.gestureState === 'PINCH_DOWN'
            ? 0.85
            : out.snappedTargetEl
              ? 1.24
              : 1;
        reticleRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
      }

      // Update circular SVG progress ring (dwell / radial palm hold / fist reset hold)
      if (reticleRingRef.current) {
        const pct = Math.max(out.dwellProgress, out.radialHoldProgress, out.fistHoldProgress);
        const circ = 2 * Math.PI * 22;
        reticleRingRef.current.style.strokeDasharray = `${circ}`;
        reticleRingRef.current.style.strokeDashoffset = `${circ * (1 - pct)}`;
        reticleRingRef.current.style.stroke =
          out.fistHoldProgress > 0.15 ? '#FFFFFF' : '#E86C22';
      }

      // Toggle [data-hand-hover="true"] attribute on snapped DOM target
      if (prevHoverElRef.current !== out.snappedTargetEl) {
        prevHoverElRef.current?.removeAttribute('data-hand-hover');
        out.snappedTargetEl?.setAttribute('data-hand-hover', 'true');
        prevHoverElRef.current = out.snappedTargetEl;
      }

      // Fire DOM click when Pinch / Dwell / Push triggers on a snapped target
      if (out.clickedTargetId && out.snappedTargetEl) {
        triggerPulseClick(out.snappedTargetEl, rx, ry);
      }

      // Open / close Radial Menu DOM state synced cleanly
      const isRadialNow = out.gestureState === 'RADIAL_OPEN' && out.radialCenter !== null;
      if (isRadialNow !== wasRadialOpenRef.current) {
        wasRadialOpenRef.current = isRadialNow;
        setRadialVisible(isRadialNow);
        if (isRadialNow && optsRef.current.tutorialStep === 3) {
          setTutorialStep(0);
          try {
            sessionStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
          } catch {
            // Ignore
          }
          showToast('Tutorial Complete — Full Hand Control Unlocked');
        }
      }

      if (isRadialNow && out.radialCenter && radialContainerRef.current) {
        radialContainerRef.current.style.left = `${out.radialCenter.x}px`;
        radialContainerRef.current.style.top = `${out.radialCenter.y}px`;
        if (radialTitleRef.current) {
          radialTitleRef.current.textContent =
            out.radialSliceIndex >= 0
              ? RADIAL_SLICES[out.radialSliceIndex].label
              : 'POINT SLICE & PINCH / HOLD';
        }
        radialSliceRefs.current.forEach((btn, idx) => {
          if (!btn) return;
          const active = idx === out.radialSliceIndex;
          btn.setAttribute('data-radial-active', active ? 'true' : 'false');
          const bar = radialDwellRefs.current[idx];
          if (bar) {
            bar.style.transform = `scaleX(${active ? out.radialDwellProgress : 0})`;
          }
        });
      }

      if (out.radialSelectedIndex !== null) {
        handleRadialAction(out.radialSelectedIndex);
      }

      // Apply spatial camera updates to 360° VR Portal
      if (out.lookDelta) {
        panoRef.current?.applySpatialDelta(out.lookDelta);
      }
      if (out.dragDelta) {
        panoRef.current?.applySpatialDelta(out.dragDelta);
      }
      if (Math.abs(out.zoomDelta) > 0.001 || Math.abs(out.rollDelta) > 0.0005) {
        panoRef.current?.applySpatialDelta({
          zoom: out.zoomDelta,
          roll: out.rollDelta,
        });
      }
      if (out.swipeDirection) {
        panoRef.current?.cycleHotspot(out.swipeDirection === 'right' ? 'next' : 'prev');
        showToast(out.swipeDirection === 'right' ? 'Next 360° Node' : 'Previous 360° Node');
      }
      if (out.resetTriggered) {
        panoRef.current?.resetView();
        showToast('Fist Hold: View Reset');
      }

      // Optional Hand Scroll mode
      if (optsRef.current.handScrollEnabled && !isRadialNow && !out.snappedTargetEl) {
        if (out.verticalSwipeDir) {
          scrollPageBy(out.verticalSwipeDir === 'down' ? 420 : -420);
        } else if (out.handNormY < 0.14) {
          scrollPageBy(-14);
        } else if (out.handNormY > 0.86) {
          scrollPageBy(14);
        }
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [cameraActive, handleRadialAction, showToast]);

  const finishTutorial = () => {
    setTutorialStep(0);
    try {
      sessionStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
    } catch {
      // Ignore
    }
  };

  return (
    <section
      id="reality-lab"
      ref={sectionRef}
      className="relative z-10 border-t border-white/[0.08] py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Header Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-[#E86C22]">
              Interactive AR Lab
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Hand-Controlled <span className="text-[#E86C22]">AR</span> Experience Lab
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#A0A0A0]">
              Try WebAR product viewing, AR business cards and TikTok effect concepts in one
              interactive lab. Turn on local camera tracking to explore hands-free, or stay with
              mouse, touch and keyboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Mobile Panel Switcher (>=72x72px targets) */}
            <div className="inline-flex gap-2 rounded-2xl border border-white/15 bg-white/5 p-1.5 md:hidden">
              <button
                type="button"
                onClick={() => setMobileTab('AR')}
                data-hand-target="mobile-ar"
                className={`min-h-[72px] min-w-[72px] rounded-xl px-4 font-mono-tabular text-xs font-semibold cursor-pointer ${
                  mobileTab === 'AR'
                    ? 'bg-[#E86C22] text-[#080808]'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                AR Mirror
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('VR')}
                data-hand-target="mobile-vr"
                className={`min-h-[72px] min-w-[72px] rounded-xl px-4 font-mono-tabular text-xs font-semibold cursor-pointer ${
                  mobileTab === 'VR'
                    ? 'bg-[#3B82F6] text-white'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                WebAR View
              </button>
            </div>
          </div>
        </div>

        {/* Status Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {handScrollEnabled && cameraActive && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E86C22]/50 bg-[#E86C22]/15 px-3.5 py-1.5 font-mono-tabular text-xs font-semibold text-[#E86C22]">
              <Hand className="h-3.5 w-3.5" /> Hand scroll active — hold near top/bottom edge or flick up/down
            </span>
          )}
          {wholePageHandControl && cameraActive && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 font-mono-tabular text-xs font-semibold text-white">
              <Maximize2 className="h-3.5 w-3.5 text-[#E86C22]" /> Whole-page hand control unlocked
            </span>
          )}
          {lastGestureToast && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E86C22]/60 bg-[#080808]/90 px-3.5 py-1.5 font-mono-tabular text-xs text-white shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-[#E86C22]" /> {lastGestureToast}
            </span>
          )}
        </div>

        {/* Main Console Frame (Floating Reticle & Radial Menu mount inside here) */}
        <div
          ref={consoleRef}
          className="relative mt-5 overflow-hidden rounded-3xl border border-white/15 bg-[#080808] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        >
          {/* Floating Glass Hand Reticle (scoped to Console unless Whole Page Control is active) */}
          <div
            ref={reticleRef}
            aria-hidden="true"
            className={`pointer-events-none left-0 top-0 z-[120] transition-opacity duration-150 ${
              wholePageHandControl && cameraActive ? 'fixed' : 'absolute'
            }`}
            style={{ opacity: 0 }}
          >
            <div className="relative flex h-14 w-14 items-center justify-center">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  fill="rgba(232,108,34,0.12)"
                  stroke="rgba(255,255,255,0.28)"
                  strokeWidth="1.5"
                />
                <circle
                  ref={reticleRingRef}
                  cx="28"
                  cy="28"
                  r="22"
                  fill="none"
                  stroke="#E86C22"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute h-2.5 w-2.5 rounded-full bg-[#E86C22] shadow-[0_0_14px_#E86C22]" />
            </div>
          </div>

          {/* Expanding Orange Click Ripple */}
          <div
            ref={rippleRef}
            aria-hidden="true"
            className={`pointer-events-none left-0 top-0 z-[119] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#E86C22] opacity-0 ${
              wholePageHandControl && cameraActive ? 'fixed' : 'absolute'
            }`}
          />

          {/* "RAISE YOUR HAND" Idle Prompt inside Console */}
          {cameraActive && raiseHandVisible && !radialVisible && (
            <div className="pointer-events-none absolute inset-x-0 top-5 z-30 flex justify-center px-4">
              <div className="rounded-full border border-[#E86C22]/55 bg-[#080808]/90 px-5 py-2 font-mono-tabular text-xs font-semibold uppercase tracking-[0.2em] text-[#E86C22] shadow-[0_0_24px_rgba(232,108,34,0.3)] backdrop-blur-md">
                RAISE YOUR HAND IN FRONT OF THE CAMERA
              </div>
            </div>
          )}

          {/* Dual Panel Grid: Left AR Mirror + Right 360° VR Portal */}
          <div className="relative grid grid-cols-1 md:grid-cols-12">
            {/* PANEL 01: AR MIRROR */}
            <div
              className={`md:col-span-5 p-5 sm:p-7 ${
                mobileTab === 'VR' ? 'hidden md:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between gap-2 font-mono-tabular text-xs text-[#E86C22]">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Hand className="h-4 w-4" /> PANEL 01 · AR MIRROR
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#A0A0A0]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#E86C22]" /> On-device camera only
                </span>
              </div>

              {/* Camera Viewport + Live HUD Overlay */}
              <div className="relative mt-4 flex h-[300px] sm:h-[330px] items-center justify-center overflow-hidden rounded-2xl border border-white/12 bg-[#111111]">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  autoPlay
                  className={`h-full w-full -scale-x-100 object-contain transition-opacity duration-200 ${
                    cameraActive ? 'opacity-100' : 'pointer-events-none opacity-0'
                  }`}
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
                    cameraActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Idle Camera / Error Diagnostics View */}
                {!cameraActive && !consentOpen && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#E86C22]/50 bg-[#E86C22]/15">
                      <Camera className="h-6 w-6 text-[#E86C22]" />
                    </div>
                    <p className="font-display text-base font-semibold text-white">
                      AWGZO Spatial Hand Visor
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-[#A0A0A0]">{cameraStatus}</p>

                    {cameraError !== 'none' && (
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={startCameraWithConsent}
                          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-[#E86C22] px-4 text-xs font-semibold text-[#080808] hover:bg-[#FD9800] cursor-pointer"
                        >
                          <Camera className="h-3.5 w-3.5" /> Retry Camera
                        </button>
                        {typeof window !== 'undefined' && window.self !== window.top && (
                          <a
                            href={window.location.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-semibold text-white hover:border-[#E86C22]"
                          >
                            Open in New Tab
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {consentOpen && !cameraActive && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[#080808]/92 p-3 backdrop-blur-md sm:p-4">
                    <GlassCard className="w-full max-w-sm p-4 sm:p-5" tone="orange">
                      <div className="flex items-center gap-2 font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E86C22]">
                        <ShieldCheck className="h-4 w-4" /> Local Camera Permission
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-white/90">
                        Your camera stays strictly inside this browser tab for real-time 21-point
                        hand tracking. Zero video or landmark data is ever uploaded or recorded.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4">
                        <button
                          type="button"
                          onClick={startCameraWithConsent}
                          data-hand-target="consent-allow"
                          className="inline-flex min-h-[72px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E86C22] px-4 text-xs font-semibold text-[#080808] hover:bg-[#FD9800] cursor-pointer"
                        >
                          <Camera className="h-4 w-4" /> Allow Camera
                        </button>
                        <button
                          type="button"
                          onClick={() => setConsentOpen(false)}
                          data-hand-target="consent-decline"
                          className="inline-flex min-h-[72px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white hover:border-[#E86C22] cursor-pointer"
                        >
                          <X className="h-4 w-4" /> Not Now
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </div>

              {/* 3-Step Interactive Hand Onboarding Tutorial */}
              {cameraActive && tutorialStep > 0 && (
                <div className="mt-4 rounded-2xl border border-[#E86C22]/55 bg-[#111111]/95 p-4 shadow-[0_0_28px_rgba(232,108,34,0.2)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono-tabular text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E86C22]">
                      Hand Setup · Step {tutorialStep} of 3
                    </span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3].map((step) => (
                        <span
                          key={step}
                          className={`h-2 w-5 rounded-full ${
                            step <= tutorialStep ? 'bg-[#E86C22]' : 'bg-white/15'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {tutorialStep === 1 && (
                    <p className="mt-2 text-xs text-white/90">
                      1. Hold your hand comfortably inside the orange dashed box and move it slightly
                      to steer the orange reticle.
                    </p>
                  )}
                  {tutorialStep === 2 && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                      <p className="flex-1 text-xs text-white/90">
                        2. Aim at the glowing target button and pinch thumb + index (or hold still
                        0.9s to dwell-click).
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setTutorialStep(3);
                          showToast('Nice Pinch!');
                        }}
                        data-hand-target="tutorial-pinch-btn"
                        className="inline-flex min-h-[76px] min-w-[116px] items-center justify-center gap-2 rounded-2xl border border-[#E86C22] bg-[#E86C22]/25 px-4 text-xs font-bold text-white shadow-[0_0_24px_rgba(232,108,34,0.45)] cursor-pointer"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#E86C22]" /> Pinch Me
                      </button>
                    </div>
                  )}
                  {tutorialStep === 3 && (
                    <p className="mt-2 text-xs text-white/90">
                      3. Spread all 5 fingers and hold your open palm still for 0.7s over empty
                      space to fan open the 6-slice Radial Menu.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        tutorialStep < 3 ? setTutorialStep((s) => (s + 1) as 1 | 2 | 3) : finishTutorial()
                      }
                      data-hand-target="tutorial-next"
                      className="inline-flex min-h-[72px] min-w-[96px] items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 font-mono-tabular text-xs font-semibold text-white hover:border-[#E86C22] cursor-pointer"
                    >
                      {tutorialStep < 3 ? 'Next Step' : 'Finish'}
                    </button>
                    <button
                      type="button"
                      onClick={finishTutorial}
                      data-hand-target="tutorial-skip"
                      className="inline-flex min-h-[72px] min-w-[96px] items-center justify-center rounded-2xl border border-white/15 bg-transparent px-4 font-mono-tabular text-xs text-[#A0A0A0] hover:border-[#E86C22] hover:text-white cursor-pointer"
                    >
                      Skip Guide
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Camera Launch Button (>= 72px height) */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {cameraActive ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    data-hand-target="stop-camera"
                    className="inline-flex min-h-[72px] min-w-[168px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white hover:border-[#E86C22] cursor-pointer"
                  >
                    <Square className="h-4 w-4 text-[#E86C22]" /> Stop Camera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartButtonClick}
                    data-hand-target="start-camera"
                    className="inline-flex min-h-[72px] min-w-[180px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E86C22] px-5 text-sm font-semibold text-[#080808] shadow-[0_0_24px_rgba(232,108,34,0.4)] hover:bg-[#FD9800] cursor-pointer"
                  >
                    <Camera className="h-4 w-4" /> Start AR Experience
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    machineRef.current.recenter();
                    showToast('Rest pose centered');
                  }}
                  data-hand-target="ctrl-recenter"
                  className="inline-flex min-h-[72px] min-w-[110px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 font-mono-tabular text-xs font-semibold text-white hover:border-[#E86C22] cursor-pointer"
                >
                  <Crosshair className="h-4 w-4 text-[#E86C22]" /> Recenter
                </button>
              </div>
            </div>

            {/* Center Vertical Energy Divider (Desktop) */}
            <div
              ref={dividerRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-[41.666%] hidden w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#E86C22] to-transparent md:block"
            >
              <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E86C22] bg-[#080808] font-mono-tabular text-[10px] font-bold text-[#E86C22] shadow-[0_0_20px_rgba(232,108,34,0.65)]">
                XR
              </div>
            </div>

            {/* PANEL 02: 360° VR PORTAL */}
            <div
              className={`md:col-span-7 bg-gradient-to-br from-[#0b1024]/70 via-[#080808] to-[#111111] p-5 sm:p-7 ${
                mobileTab === 'AR' ? 'hidden md:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between gap-2 font-mono-tabular text-xs text-[#3B82F6]">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Compass className="h-4 w-4" /> PANEL 02 · 360° VIEW
                </span>
                <span className="text-[11px] text-[#A0A0A0]">
                  Pinch Drag, Open Palm Look, or Swipe Left/Right
                </span>
              </div>

              <div className="mt-4">
                <PanoViewport
                  ref={panoRef}
                  handTargets
                  onTargetsChanged={refreshTargetRects}
                  className="h-[340px] sm:h-[380px]"
                />
              </div>

              {/* Portal Primary Actions (all >= 72x72px with >= 16px spacing) */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setVrOverlayOpen(true)}
                  data-hand-target="ctrl-enter-vr"
                  className="inline-flex min-h-[72px] min-w-[152px] items-center justify-center gap-2 rounded-2xl border border-[#3B82F6]/60 bg-[#3B82F6]/20 px-5 text-sm font-semibold text-white hover:bg-[#3B82F6]/35 cursor-pointer"
                >
                  <Glasses className="h-4 w-4 text-[#3B82F6]" /> Open 360° View
                </button>

                <button
                  type="button"
                  onClick={() => {
                    panoRef.current?.resetView();
                    showToast('360° View Reset');
                  }}
                  data-hand-target="ctrl-reset-view"
                  className="inline-flex min-h-[72px] min-w-[120px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 font-mono-tabular text-xs font-semibold text-white hover:border-[#E86C22] cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 text-[#E86C22]" /> Reset View
                </button>

              </div>
            </div>
          </div>

          {/* GSAP Radial "Hand Menu" Overlay (Fanned Around Palm Center) */}
          {radialVisible && (
            <div
              className={`pointer-events-none inset-0 z-[115] ${
                wholePageHandControl && cameraActive ? 'fixed' : 'absolute'
              }`}
            >
              <div
                ref={radialBackdropRef}
                className="pointer-events-auto absolute inset-0 bg-[#080808]/65 backdrop-blur-[4px]"
                onClick={() => {
                  machineRef.current.closeRadial();
                  wasRadialOpenRef.current = false;
                  setRadialVisible(false);
                }}
              />
              <div
                ref={radialContainerRef}
                className="pointer-events-none absolute left-1/2 top-1/2"
              >
                {/* Center Hub Ring */}
                <div className="flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#E86C22]/75 bg-[#080808]/95 px-3 text-center shadow-[0_0_40px_rgba(232,108,34,0.45)] backdrop-blur-xl">
                  <span className="font-mono-tabular text-[9px] uppercase tracking-[0.2em] text-[#E86C22]">
                    RADIAL MENU
                  </span>
                  <div
                    ref={radialTitleRef}
                    className="mt-1 font-display text-xs font-bold leading-tight text-white"
                  >
                    POINT SLICE &amp; PINCH
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      machineRef.current.closeRadial();
                      wasRadialOpenRef.current = false;
                      setRadialVisible(false);
                    }}
                    className="pointer-events-auto mt-1.5 rounded-full border border-white/20 px-2.5 py-0.5 font-mono-tabular text-[10px] text-[#A0A0A0] hover:border-[#E86C22] hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* 6 Radial Fanned Slices at 60° Intervals */}
                {RADIAL_SLICES.map((slice, idx) => {
                  const angleRad = ((idx * 60 - 60) * Math.PI) / 180;
                  const radius = 138;
                  const tx = Math.cos(angleRad) * radius;
                  const ty = Math.sin(angleRad) * radius;

                  return (
                    <button
                      key={slice.id}
                      ref={(el) => {
                        radialSliceRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => handleRadialAction(idx)}
                      style={{
                        transform: `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`,
                      }}
                      className="pointer-events-auto absolute left-0 top-0 flex min-h-[76px] w-[144px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-[#111111]/95 px-3 py-2 text-center shadow-xl backdrop-blur-xl transition-colors data-[radial-active=true]:border-[#E86C22] data-[radial-active=true]:bg-[#E86C22]/25 cursor-pointer"
                    >
                      <span className="font-mono-tabular text-[10px] text-[#E86C22]">
                        0{idx + 1}
                      </span>
                      <span className="font-display text-xs font-bold text-white">
                        {slice.label}
                      </span>
                      <span className="font-mono-tabular text-[10px] text-[#A0A0A0]">
                        {slice.sublabel}
                      </span>
                      <div
                        ref={(el) => {
                          radialDwellRefs.current[idx] = el;
                        }}
                        className="mt-1.5 h-1 w-full origin-left bg-[#E86C22]"
                        style={{ transform: 'scaleX(0)' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Direct Calendly link reference kept cleanly in DOM */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px] text-[#A0A0A0]">
          <span>Mouse, touch, and keyboard navigation remain active at all times.</span>
          <a
            href={AWGZO_SITE.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link-draw text-white hover:text-[#E86C22]"
          >
            Direct booking: Calendly · AWGZO
          </a>
        </div>
      </div>
    </section>
  );
}