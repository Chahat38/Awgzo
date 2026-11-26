import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';

export type RealityMode = 'AR' | 'VR' | 'MIX';

export type ActiveSectionId =
  | 'hero'
  | 'services'
  | 'portfolio'
  | 'reality-lab'
  | 'model'
  | 'team'
  | 'testimonials'
  | 'contact'
  | 'footer'
  | 'detail';

export interface SceneState {
  section: ActiveSectionId;
  scrollProgress: number;
  scrollVelocity: number;
  warpProgress: number;
  wipeProgress: number;
  irisProgress: number;
  pointerX: number;
  pointerY: number;
  realityMode: RealityMode;
  targetVrMix: number;
  modelSlotBoost: number;
}

interface RealityContextValue {
  mode: RealityMode;
  setMode: (next: RealityMode) => void;
  activeSection: ActiveSectionId;
  setActiveSection: (id: ActiveSectionId) => void;
  irisOrigin: { x: number; y: number };
  setIrisOrigin: (coords: { x: number; y: number }) => void;
  contactFocused: boolean;
  setContactFocused: (focused: boolean) => void;
  vrOverlayOpen: boolean;
  setVrOverlayOpen: (open: boolean) => void;
  panoOpen: boolean;
  setPanoOpen: (open: boolean) => void;
  wholePageHandControl: boolean;
  setWholePageHandControl: (enabled: boolean) => void;
  handScrollEnabled: boolean;
  setHandScrollEnabled: (enabled: boolean) => void;
  cameraRunning: boolean;
  setCameraRunning: (running: boolean) => void;
  isWiping: boolean;
  announcement: string;
  sceneStateRef: MutableRefObject<SceneState>;
}

const STORAGE_KEY = 'awgzo-reality-mode';

function readInitialMode(): RealityMode {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'AR' || saved === 'VR' || saved === 'MIX') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'AR';
}

function modeToVrMix(mode: RealityMode): number {
  if (mode === 'VR') return 1;
  if (mode === 'MIX') return 0.5;
  return 0;
}

const RealityContext = createContext<RealityContextValue | null>(null);

export function RealityProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<RealityMode>(() => readInitialMode());
  const [activeSection, setActiveSection] = useState<ActiveSectionId>('hero');
  const [irisOrigin, setIrisOrigin] = useState({ x: 50, y: 50 });
  const [contactFocused, setContactFocused] = useState(false);
  const [vrOverlayOpen, setVrOverlayOpen] = useState(false);
  const [panoOpen, setPanoOpen] = useState(false);
  const [wholePageHandControl, setWholePageHandControl] = useState(false);
  const [handScrollEnabled, setHandScrollEnabled] = useState(false);
  const [cameraRunning, setCameraRunning] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const sceneStateRef = useRef<SceneState>({
    section: 'hero',
    scrollProgress: 0,
    scrollVelocity: 0,
    warpProgress: 0,
    wipeProgress: 0.5,
    irisProgress: 0,
    pointerX: 0,
    pointerY: 0,
    realityMode: readInitialMode(),
    targetVrMix: modeToVrMix(readInitialMode()),
    modelSlotBoost: 0,
  });

  const wipeTimerRef = useRef<number | null>(null);

  const setMode = useCallback((next: RealityMode) => {
    setModeState(next);
    sceneStateRef.current.realityMode = next;
    sceneStateRef.current.targetVrMix = modeToVrMix(next);
    setAnnouncement(`Reality mode switched to ${next}`);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures
    }

    if (wipeTimerRef.current) window.clearTimeout(wipeTimerRef.current);
    setIsWiping(true);
    wipeTimerRef.current = window.setTimeout(() => {
      setIsWiping(false);
    }, 800);
  }, []);

  useEffect(() => {
    return () => {
      if (wipeTimerRef.current) window.clearTimeout(wipeTimerRef.current);
    };
  }, []);

  return (
    <RealityContext.Provider
      value={{
        mode,
        setMode,
        activeSection,
        setActiveSection,
        irisOrigin,
        setIrisOrigin,
        contactFocused,
        setContactFocused,
        vrOverlayOpen,
        setVrOverlayOpen,
        panoOpen,
        setPanoOpen,
        wholePageHandControl,
        setWholePageHandControl,
        handScrollEnabled,
        setHandScrollEnabled,
        cameraRunning,
        setCameraRunning,
        isWiping,
        announcement,
        sceneStateRef,
      }}
    >
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </RealityContext.Provider>
  );
}

export function useReality() {
  const ctx = useContext(RealityContext);
  if (!ctx) {
    throw new Error('useReality must be used inside RealityProvider');
  }
  return ctx;
}
