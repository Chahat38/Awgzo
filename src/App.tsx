import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const PreviewPage = lazy(() => import('./pages/PreviewPage'));

function AppShell() {
  const location = useLocation();
  const { sceneStateRef, vrOverlayOpen, panoOpen } = useReality();
  const [loaded, setLoaded] = useState(false);

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
    <div className="relative min-h-screen bg-[#080808] text-white selection:bg-[#E86C22] selection:text-[#080808]">
      {!loaded && <BrandedLoader onComplete={() => setLoaded(true)} />}

      <RealityCursor />

      <Suspense fallback={null}>
        <PersistentCanvas />
      </Suspense>

      <Navbar />

      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center font-mono-tabular text-xs text-[#A0A0A0]">
            Loading AWGZO…
          </div>
        }
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage loaderDone={loaded} />} />
          <Route path="/work/:slug" element={<ProjectDetailPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Chatbot />

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
