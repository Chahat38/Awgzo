import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { RealityProvider, useReality } from './context/RealityContext';
import { BrandedLoader } from './components/common/BrandedLoader';
import { RealityCursor } from './components/ui/RealityCursor';
import { Navbar } from './sections/Navbar/Navbar';
import { Chatbot } from './sections/Chatbot/Chatbot';
import { initSmoothScroll } from './lib/scroll';

const PersistentCanvas = lazy(() => import('./components/canvas/PersistentCanvas'));
const WebXROverlay = lazy(() => import('./components/xr/WebXROverlay'));
const PanoModal = lazy(() => import('./components/xr/PanoViewer'));
const SirAssistant = lazy(() => import('./components/assistant/SirAssistant'));

const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const PreviewPage = lazy(() => import('./pages/PreviewPage'));

/**
 * Plays the Hero recording immediately, independently of the heavy 3D
 * assistant. If autoplay is refused, the first click/tap retries once.
 */
function HeroVoice() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const GESTURES = ['pointerup', 'touchend', 'keydown', 'click'] as const;
    let disposed = false;
    let done = false;
    let armed = false;
    let gestureTried = false;
    let audio: HTMLAudioElement | null = null;

    function disarm() {
      if (!armed) return;
      armed = false;
      GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
    }
    function arm() {
      if (armed || disposed) return;
      armed = true;
      GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
    }
    function onGesture() {
      start(true);
    }
    function start(fromGesture = false) {
      if (done || disposed) return;
      if (fromGesture) {
        if (gestureTried) return;
        gestureTried = true;
        disarm();
      }
      if (!audio) {
        audio = new Audio('/audio/hero-dramatic.mp3');
        audio.preload = 'auto';
      }
      audio.play().then(
        () => {
          done = true;
          disarm();
        },
        () => {
          if (fromGesture) done = true;
          else arm();
        }
      );
    }

    start();
    return () => {
      disposed = true;
      disarm();
      audio?.pause();
    };
  }, []);
  return null;
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sceneStateRef, vrOverlayOpen, panoOpen } = useReality();
  const [loaded, setLoaded] = useState(false);
  const [heavyReady, setHeavyReady] = useState(false);

  useEffect(() => {
    document.querySelectorAll('[data-static-seo]').forEach((element) => element.remove());
  }, []);

  // Three.js, the GLB assistant and the atmospheric canvas are not needed for
  // the first paint. Load them once the browser is idle after the loader.
  useEffect(() => {
    if (!loaded || heavyReady) return;
    let cancelled = false;
    let raf1 = 0;
    let raf2 = 0;
    let timer = 0;
    const run = () => {
      if (!cancelled) setHeavyReady(true);
    };
    // Wait for the hero to paint before downloading Three.js and the GLB model.
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        timer = window.setTimeout(run, 300);
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(timer);
    };
  }, [loaded, heavyReady]);

  // In-page links like href="#contact": if that section is not on the current page, open its own page.
  useEffect(() => {
    const PAGE_FOR: Record<string, string> = {
      services: '/services',
      contact: '/contact',
      'reality-lab': '/products',
      products: '/products',
      about: '/about',
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      if (!link || !id || document.getElementById(id)) return;
      e.preventDefault();
      navigate(PAGE_FOR[id] ?? `/?section=${id}`);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanup = initSmoothScroll(({ progress, velocity }) => {
      sceneStateRef.current.scrollProgress = progress;
      sceneStateRef.current.scrollVelocity = velocity;
    });

    const onPointer = (e: PointerEvent) => {
      sceneStateRef.current.pointerX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      sceneStateRef.current.pointerY = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointer);
      cleanup();
    };
  }, [sceneStateRef]);

  return (
    <div className="relative min-h-screen bg-[#10191f] text-white selection:bg-[#e86d22] selection:text-[#10191f]">
      {!loaded && <BrandedLoader onComplete={() => setLoaded(true)} />}

      <HeroVoice />
      <RealityCursor />

      {heavyReady && (
        <Suspense fallback={null}>
          <PersistentCanvas />
        </Suspense>
      )}

      <Navbar />

      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center font-mono-tabular text-xs text-[#9fa3a5]">
            Loading AWGZO…
          </div>
        }
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage loaderDone={loaded} />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/work/:slug" element={<ProjectDetailPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Chatbot />

      {heavyReady && (
        <Suspense fallback={null}>
          <SirAssistant ready={loaded} autoVoice={false} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        {vrOverlayOpen && <WebXROverlay />}
        {panoOpen && <PanoModal />}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <RealityProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </RealityProvider>
    </HelmetProvider>
  );
}