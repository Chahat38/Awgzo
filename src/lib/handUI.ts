/**
 * Framework-agnostic Hand-Controlled UI engine for AWGZO Reality Lab.
 * Handles One-Euro smoothing, calibrated active-zone mapping, gesture state machine
 * (IDLE, HOVER, PINCH_DOWN, DRAGGING, RADIAL_OPEN, ZOOM), pinch hysteresis,
 * dwell-click, push-click, two-hand zoom/roll, swipe, and cached hit-test snapping.
 */

export interface HandLandmark {
  x: number;
  y: number;
  z?: number;
}

export type HandGestureState =
  | 'IDLE'
  | 'HOVER'
  | 'PINCH_DOWN'
  | 'DRAGGING'
  | 'RADIAL_OPEN'
  | 'ZOOM';

export interface CachedTarget {
  id: string;
  el: HTMLElement;
  rect: DOMRect;
  cx: number;
  cy: number;
}

export interface HandUIFrameInput {
  landmarks: HandLandmark[][];
  confidence: number; // Real MediaPipe score 0..1
  timestampMs: number;
  consoleRect: { left: number; top: number; width: number; height: number };
  options: {
    dwellEnabled: boolean;
    pushClickEnabled: boolean;
    dwellMs?: number;
    radialHoldMs?: number;
    fistHoldMs?: number;
    snapRadiusPx?: number;
  };
}

export interface HandUIFrameOutput {
  detected: boolean;
  raisedPromptVisible: boolean;
  cursorX: number; // Console-relative px
  cursorY: number; // Console-relative px
  viewportX: number; // Viewport px
  viewportY: number; // Viewport px
  snappedTargetId: string | null;
  snappedTargetEl: HTMLElement | null;
  gestureState: HandGestureState;
  pinchRatio: number; // Normalized dist(4,8)/dist(0,9)
  confidence: number;
  dwellProgress: number; // 0..1
  radialHoldProgress: number; // 0..1
  fistHoldProgress: number; // 0..1
  radialCenter: { x: number; y: number } | null;
  radialSliceIndex: number; // -1 if none, 0..5 otherwise
  radialDwellProgress: number; // 0..1
  clickedTargetId: string | null;
  clickedMethod: 'pinch' | 'dwell' | 'push' | null;
  radialSelectedIndex: number | null;
  lookDelta: { yaw: number; pitch: number } | null;
  dragDelta: { yaw: number; pitch: number } | null;
  zoomDelta: number;
  rollDelta: number;
  swipeDirection: 'left' | 'right' | null;
  resetTriggered: boolean;
  closeRadialTriggered: boolean;
  handNormY: number; // Normalized 0..1 mapped Y for optional Hand Scroll
  verticalSwipeDir: 'up' | 'down' | null;
}

/* -------------------- One-Euro Filter -------------------- */
class LowPassFilter {
  private initialized = false;
  private y = 0;

  filter(value: number, alpha: number): number {
    if (!this.initialized) {
      this.initialized = true;
      this.y = value;
      return value;
    }
    this.y = alpha * value + (1 - alpha) * this.y;
    return this.y;
  }

  reset() {
    this.initialized = false;
    this.y = 0;
  }
}

export class OneEuroFilter {
  private xFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private lastTimeMs: number | null = null;
  private lastRaw = 0;

  constructor(
    private readonly minCutoff = 1.0,
    private readonly beta = 0.007,
    private readonly dCutoff = 1.0
  ) {}

  private alpha(cutoff: number, dtSec: number): number {
    const tau = 1 / (2 * Math.PI * Math.max(0.0001, cutoff));
    return 1 / (1 + tau / Math.max(1 / 240, dtSec));
  }

  filter(value: number, timestampMs: number): number {
    if (this.lastTimeMs === null) {
      this.lastTimeMs = timestampMs;
      this.lastRaw = value;
      return this.xFilter.filter(value, 1);
    }

    const dtSec = Math.max(0.001, (timestampMs - this.lastTimeMs) / 1000);
    this.lastTimeMs = timestampMs;

    const rawDeriv = (value - this.lastRaw) / dtSec;
    this.lastRaw = value;

    const dAlpha = this.alpha(this.dCutoff, dtSec);
    const smoothDeriv = this.dxFilter.filter(rawDeriv, dAlpha);

    const cutoff = this.minCutoff + this.beta * Math.abs(smoothDeriv);
    const xAlpha = this.alpha(cutoff, dtSec);
    return this.xFilter.filter(value, xAlpha);
  }

  reset() {
    this.lastTimeMs = null;
    this.xFilter.reset();
    this.dxFilter.reset();
  }
}

/* -------------------- Geometry Helpers -------------------- */
function dist2D(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function computeHandMetrics(lm: HandLandmark[]) {
  const wrist = lm[0];
  const thumbTip = lm[4];
  const indexMcp = lm[5];
  const indexTip = lm[8];
  const middleMcp = lm[9];
  const middleTip = lm[12];
  const ringMcp = lm[13];
  const ringTip = lm[16];
  const pinkyMcp = lm[17];
  const pinkyTip = lm[20];

  const handSize = Math.max(0.04, dist2D(wrist, middleMcp));
  const pinchDist = dist2D(thumbTip, indexTip);
  const pinchRatio = pinchDist / handSize;

  // Extension heuristic per finger: tip-to-wrist noticeably further than MCP-to-wrist
  const indexExtended = dist2D(wrist, indexTip) > dist2D(wrist, indexMcp) * 1.28;
  const middleExtended = dist2D(wrist, middleTip) > dist2D(wrist, middleMcp) * 1.25;
  const ringExtended = dist2D(wrist, ringTip) > dist2D(wrist, ringMcp) * 1.22;
  const pinkyExtended = dist2D(wrist, pinkyTip) > dist2D(wrist, pinkyMcp) * 1.18;

  const isOpenPalm =
    indexExtended && middleExtended && ringExtended && pinkyExtended && pinchRatio > 0.34;

  const isFist =
    !indexExtended &&
    !middleExtended &&
    !ringExtended &&
    !pinkyExtended &&
    dist2D(indexTip, wrist) < handSize * 1.25 &&
    dist2D(middleTip, wrist) < handSize * 1.25;

  return {
    handSize,
    pinchRatio,
    isOpenPalm,
    isFist,
    palmCenterX: (wrist.x + middleMcp.x) * 0.5,
    palmCenterY: (wrist.y + middleMcp.y) * 0.5,
    indexTip,
  };
}

/* -------------------- Cached Target Rect Registry -------------------- */
export function collectHandTargets(root: ParentNode): CachedTarget[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-hand-target]'));
  const targets: CachedTarget[] = [];

  for (const el of nodes) {
    const id = el.dataset.handTarget || '';
    if (!id) continue;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    if (
      rect.bottom < -20 ||
      rect.top > window.innerHeight + 20 ||
      rect.right < -20 ||
      rect.left > window.innerWidth + 20
    ) {
      continue;
    }

    if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') continue;

    targets.push({
      id,
      el,
      rect,
      cx: rect.left + rect.width * 0.5,
      cy: rect.top + rect.height * 0.5,
    });
  }

  return targets;
}

export function findNearestTarget(
  vx: number,
  vy: number,
  targets: CachedTarget[],
  snapRadiusPx = 48
): CachedTarget | null {
  let best: CachedTarget | null = null;
  let bestDist = Infinity;

  for (const t of targets) {
    const clampedX = Math.max(t.rect.left, Math.min(t.rect.right, vx));
    const clampedY = Math.max(t.rect.top, Math.min(t.rect.bottom, vy));
    const edgeDist = Math.hypot(vx - clampedX, vy - clampedY);

    if (edgeDist <= snapRadiusPx) {
      const centerDist = Math.hypot(vx - t.cx, vy - t.cy);
      const score = edgeDist * 2 + centerDist * 0.15;
      if (score < bestDist) {
        bestDist = score;
        best = t;
      }
    }
  }

  return best;
}

/* -------------------- WebAudio Click Feedback (Muted by Default) -------------------- */
let sharedAudioCtx: AudioContext | null = null;
export function playHandClickSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx();
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    const now = sharedAudioCtx.currentTime;
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  } catch {
    // Ignore audio context restriction
  }
}

/* -------------------- Hand UI State Machine -------------------- */
export class HandUIMachine {
  private xFilter = new OneEuroFilter(1.0, 0.007, 1.0);
  private yFilter = new OneEuroFilter(1.0, 0.007, 1.0);
  private depthFilter = new OneEuroFilter(1.2, 0.01, 1.0);

  private activeCenterOffsetX = 0; // Recenter calibration shift (-0.2..0.2)
  private activeCenterOffsetY = 0;
  private lastRawMirroredX = 0.5;
  private lastRawY = 0.5;

  private state: HandGestureState = 'IDLE';
  private pendingState: HandGestureState | null = null;
  private pendingStateSince = 0;
  private readonly gestureDebounceMs = 120;

  private lastDetectedTimeMs = 0;
  private firstDetectedTimeMs = 0;

  // Pinch tracking with hysteresis (<0.22 press, >0.32 release)
  private pinchActive = false;
  private pinchDownTimeMs = 0;
  private pinchStartCursor = { x: 0, y: 0 };
  private pinchStartScale = 0;
  private prevDragCursor = { x: 0, y: 0 };
  private prevDragScale = 0;

  // Dwell tracking
  private dwellTargetId: string | null = null;
  private dwellStartMs = 0;
  private dwellFiredForId: string | null = null;

  // Radial menu tracking
  private palmStillStartMs = 0;
  private palmStillAnchor = { x: 0, y: 0 };
  private radialCenter: { x: number; y: number } | null = null;
  private radialOpen = false;
  private radialDwellSlice = -1;
  private radialDwellStartMs = 0;

  // Fist reset hold
  private fistStartMs = 0;
  private fistFired = false;

  // Push-click history
  private scaleHistory: { t: number; s: number }[] = [];
  private lastPushClickMs = 0;

  // Swipe history
  private xHistory: { t: number; x: number; y: number }[] = [];
  private lastSwipeMs = 0;

  // Two-hand zoom / roll baseline
  private prevTwoHandDist: number | null = null;
  private prevTwoHandAngle: number | null = null;

  // Open palm portal look tracking
  private prevPalmX: number | null = null;
  private prevPalmY: number | null = null;

  recenter() {
    this.activeCenterOffsetX = Math.max(-0.2, Math.min(0.2, this.lastRawMirroredX - 0.5));
    this.activeCenterOffsetY = Math.max(-0.2, Math.min(0.2, this.lastRawY - 0.5));
  }

  resetCalibration() {
    this.activeCenterOffsetX = 0;
    this.activeCenterOffsetY = 0;
  }

  resetAll() {
    this.xFilter.reset();
    this.yFilter.reset();
    this.depthFilter.reset();
    this.pinchActive = false;
    this.dwellTargetId = null;
    this.dwellFiredForId = null;
    this.palmStillStartMs = 0;
    this.fistStartMs = 0;
    this.fistFired = false;
    this.scaleHistory = [];
    this.xHistory = [];
    this.prevTwoHandDist = null;
    this.prevTwoHandAngle = null;
    this.prevPalmX = null;
    this.prevPalmY = null;
    this.firstDetectedTimeMs = 0;
    this.lastDetectedTimeMs = 0;
    this.closeRadial();
  }

  closeRadial() {
    this.radialOpen = false;
    this.radialCenter = null;
    this.radialDwellSlice = -1;
    this.radialDwellStartMs = 0;
    if (this.state === 'RADIAL_OPEN') {
      this.state = 'IDLE';
    }
  }

  private transitionState(next: HandGestureState, nowMs: number) {
    if (next === this.state) {
      this.pendingState = null;
      return;
    }
    if (this.pendingState !== next) {
      this.pendingState = next;
      this.pendingStateSince = nowMs;
      return;
    }
    if (nowMs - this.pendingStateSince >= this.gestureDebounceMs) {
      this.state = next;
      this.pendingState = null;
    }
  }

  private mapNormalized(rawMirroredX: number, rawY: number): { nx: number; ny: number } {
    // Central ~70% active window [0.15 .. 0.85] shifted by recenter offset
    const minX = 0.15 + this.activeCenterOffsetX;
    const minY = 0.15 + this.activeCenterOffsetY;
    const nx = Math.max(0, Math.min(1, (rawMirroredX - minX) / 0.7));
    const ny = Math.max(0, Math.min(1, (rawY - minY) / 0.7));
    return { nx, ny };
  }

  step(input: HandUIFrameInput, cachedTargets: CachedTarget[]): HandUIFrameOutput {
    const { landmarks, confidence, timestampMs, consoleRect, options } = input;
    const dwellMs = options.dwellMs ?? 900;
    const radialHoldMs = options.radialHoldMs ?? 700;
    const fistHoldMs = options.fistHoldMs ?? 600;
    const snapRadius = options.snapRadiusPx ?? 48;

    const emptyOutput = (lostLong: boolean): HandUIFrameOutput => ({
      detected: false,
      raisedPromptVisible: lostLong,
      cursorX: 0,
      cursorY: 0,
      viewportX: 0,
      viewportY: 0,
      snappedTargetId: null,
      snappedTargetEl: null,
      gestureState: this.radialOpen ? 'RADIAL_OPEN' : 'IDLE',
      pinchRatio: 1,
      confidence: 0,
      dwellProgress: 0,
      radialHoldProgress: 0,
      fistHoldProgress: 0,
      radialCenter: this.radialCenter,
      radialSliceIndex: -1,
      radialDwellProgress: 0,
      clickedTargetId: null,
      clickedMethod: null,
      radialSelectedIndex: null,
      lookDelta: null,
      dragDelta: null,
      zoomDelta: 0,
      rollDelta: 0,
      swipeDirection: null,
      resetTriggered: false,
      closeRadialTriggered: false,
      handNormY: 0.5,
      verticalSwipeDir: null,
    });

    const hasValidHand = landmarks.length > 0 && landmarks[0]?.length >= 21 && confidence >= 0.6;

    if (!hasValidHand) {
      if (this.firstDetectedTimeMs === 0) {
        return emptyOutput(true);
      }
      const lostElapsed = timestampMs - this.lastDetectedTimeMs;
      if (lostElapsed >= 1500) {
        this.pinchActive = false;
        this.dwellTargetId = null;
        this.palmStillStartMs = 0;
        this.fistStartMs = 0;
        this.prevTwoHandDist = null;
        this.prevTwoHandAngle = null;
        this.prevPalmX = null;
        this.prevPalmY = null;
        if (this.radialOpen) this.closeRadial();
      }
      return emptyOutput(lostElapsed >= 1500);
    }

    if (this.firstDetectedTimeMs === 0) {
      this.firstDetectedTimeMs = timestampMs;
    }
    this.lastDetectedTimeMs = timestampMs;

    const hand0 = landmarks[0];
    const m0 = computeHandMetrics(hand0);

    // Mirror X and map central ~70% active frame -> 100% console coordinates
    const mirroredX = 1 - m0.indexTip.x;
    const rawY = m0.indexTip.y;
    this.lastRawMirroredX = mirroredX;
    this.lastRawY = rawY;

    const { nx, ny } = this.mapNormalized(mirroredX, rawY);
    const smoothNx = this.xFilter.filter(nx, timestampMs);
    const smoothNy = this.yFilter.filter(ny, timestampMs);
    const smoothDepth = this.depthFilter.filter(m0.handSize, timestampMs);

    let cursorX = smoothNx * consoleRect.width;
    let cursorY = smoothNy * consoleRect.height;
    let viewportX = consoleRect.left + cursorX;
    let viewportY = consoleRect.top + cursorY;

    let snappedTarget: CachedTarget | null = null;
    if (!this.radialOpen && !this.pinchActive) {
      snappedTarget = findNearestTarget(viewportX, viewportY, cachedTargets, snapRadius);
      if (snappedTarget) {
        viewportX = snappedTarget.cx;
        viewportY = snappedTarget.cy;
        cursorX = viewportX - consoleRect.left;
        cursorY = viewportY - consoleRect.top;
      }
    }

    let clickedTargetId: string | null = null;
    let clickedMethod: 'pinch' | 'dwell' | 'push' | null = null;
    let radialSelectedIndex: number | null = null;
    let radialSliceIndex = -1;
    let radialDwellProgress = 0;
    let lookDelta: { yaw: number; pitch: number } | null = null;
    let dragDelta: { yaw: number; pitch: number } | null = null;
    let zoomDelta = 0;
    let rollDelta = 0;
    let swipeDirection: 'left' | 'right' | null = null;
    let verticalSwipeDir: 'up' | 'down' | null = null;
    let resetTriggered = false;
    let closeRadialTriggered = false;

    /* -------- Two-Hand Zoom & Subtle Horizon Roll -------- */
    if (landmarks.length >= 2 && landmarks[1]?.length >= 21) {
      const m1 = computeHandMetrics(landmarks[1]);
      const p0x = 1 - m0.palmCenterX;
      const p0y = m0.palmCenterY;
      const p1x = 1 - m1.palmCenterX;
      const p1y = m1.palmCenterY;
      const curDist = Math.hypot(p1x - p0x, p1y - p0y);
      const curAngle = Math.atan2(p1y - p0y, p1x - p0x);

      if (this.prevTwoHandDist !== null && this.prevTwoHandAngle !== null) {
        const dDist = curDist - this.prevTwoHandDist;
        const dAngle = curAngle - this.prevTwoHandAngle;
        if (Math.abs(dDist) > 0.002) {
          zoomDelta = dDist * 18;
          this.transitionState('ZOOM', timestampMs);
        }
        if (Math.abs(dAngle) > 0.004 && Math.abs(dAngle) < 0.4) {
          rollDelta = dAngle * 0.45;
        }
      }
      this.prevTwoHandDist = curDist;
      this.prevTwoHandAngle = curAngle;
    } else {
      this.prevTwoHandDist = null;
      this.prevTwoHandAngle = null;
    }

    /* -------- Horizontal & Vertical Swipe Tracking -------- */
    this.xHistory.push({ t: timestampMs, x: mirroredX, y: rawY });
    while (this.xHistory.length > 0 && timestampMs - this.xHistory[0].t > 250) {
      this.xHistory.shift();
    }
    if (
      !this.pinchActive &&
      !this.radialOpen &&
      timestampMs - this.lastSwipeMs > 700 &&
      this.xHistory.length >= 2
    ) {
      const oldest = this.xHistory[0];
      const dx = mirroredX - oldest.x;
      const dy = rawY - oldest.y;
      if (Math.abs(dx) > 0.6 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        swipeDirection = dx > 0 ? 'right' : 'left';
        this.lastSwipeMs = timestampMs;
        this.xHistory = [];
      } else if (Math.abs(dy) > 0.55 && Math.abs(dy) > Math.abs(dx) * 1.6) {
        verticalSwipeDir = dy > 0 ? 'down' : 'up';
        this.lastSwipeMs = timestampMs;
        this.xHistory = [];
      }
    }

    /* -------- Fist Hold (600ms) -> Reset View & Close Radial -------- */
    let fistHoldProgress = 0;
    if (m0.isFist && !this.pinchActive) {
      if (this.fistStartMs === 0) {
        this.fistStartMs = timestampMs;
        this.fistFired = false;
      }
      const held = timestampMs - this.fistStartMs;
      fistHoldProgress = Math.min(1, held / fistHoldMs);
      if (held >= fistHoldMs && !this.fistFired) {
        this.fistFired = true;
        resetTriggered = true;
        if (this.radialOpen) {
          this.closeRadial();
          closeRadialTriggered = true;
        }
      }
    } else {
      this.fistStartMs = 0;
      this.fistFired = false;
    }

    /* -------- Open Palm Hold Still (700ms) -> Open Radial Menu -------- */
    let radialHoldProgress = 0;
    if (m0.isOpenPalm && !this.radialOpen && !this.pinchActive && !snappedTarget) {
      const px = smoothNx * consoleRect.width;
      const py = smoothNy * consoleRect.height;
      if (this.palmStillStartMs === 0) {
        this.palmStillStartMs = timestampMs;
        this.palmStillAnchor = { x: px, y: py };
      } else {
        const moveDist = Math.hypot(px - this.palmStillAnchor.x, py - this.palmStillAnchor.y);
        if (moveDist > 26) {
          // Moving open palm = Look around 360 portal!
          this.palmStillStartMs = timestampMs;
          this.palmStillAnchor = { x: px, y: py };
          if (this.prevPalmX !== null && this.prevPalmY !== null) {
            lookDelta = {
              yaw: -(px - this.prevPalmX) * 0.006,
              pitch: -(py - this.prevPalmY) * 0.005,
            };
          }
        } else {
          const held = timestampMs - this.palmStillStartMs;
          radialHoldProgress = Math.min(1, held / radialHoldMs);
          if (held >= radialHoldMs) {
            this.radialOpen = true;
            this.radialCenter = {
              x: Math.max(160, Math.min(consoleRect.width - 160, px)),
              y: Math.max(160, Math.min(consoleRect.height - 160, py)),
            };
            this.state = 'RADIAL_OPEN';
            this.palmStillStartMs = 0;
          }
        }
      }
      this.prevPalmX = px;
      this.prevPalmY = py;
    } else {
      this.palmStillStartMs = 0;
      this.prevPalmX = null;
      this.prevPalmY = null;
    }

    /* -------- Radial Menu Slice Calculation (Before Pinch Check) -------- */
    if (this.radialOpen && this.radialCenter) {
      const dx = cursorX - this.radialCenter.x;
      const dy = cursorY - this.radialCenter.y;
      const dist = Math.hypot(dx, dy);

      // Lowering hand way down closes radial cleanly
      if (rawY > 0.92) {
        this.closeRadial();
        closeRadialTriggered = true;
      } else if (dist > 34) {
        // Map angle -PI..PI into 6 equal 60-degree wedges starting from top (-PI/2)
        const angle = Math.atan2(dy, dx);
        const norm = (angle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        radialSliceIndex = Math.floor(norm / ((Math.PI * 2) / 6)) % 6;
      } else {
        this.radialDwellSlice = -1;
      }
    }

    /* -------- Pinch Hysteresis (< 0.22 press, > 0.32 release, hold >= 80ms) -------- */
    if (!this.pinchActive && m0.pinchRatio < 0.22) {
      this.pinchActive = true;
      this.pinchDownTimeMs = timestampMs;
      this.pinchStartCursor = { x: cursorX, y: cursorY };
      this.pinchStartScale = smoothDepth;
      this.prevDragCursor = { x: cursorX, y: cursorY };
      this.prevDragScale = smoothDepth;
      if (!this.radialOpen) {
        this.transitionState('PINCH_DOWN', timestampMs);
      }
    } else if (this.pinchActive) {
      const movedFromStart = Math.hypot(
        cursorX - this.pinchStartCursor.x,
        cursorY - this.pinchStartCursor.y
      );

      if (m0.pinchRatio > 0.32) {
        // Release event!
        const heldMs = timestampMs - this.pinchDownTimeMs;
        const wasDrag = movedFromStart > 20;
        this.pinchActive = false;

        if (heldMs >= 80 && !wasDrag) {
          if (this.radialOpen && radialSliceIndex >= 0) {
            radialSelectedIndex = radialSliceIndex;
          } else if (snappedTarget) {
            clickedTargetId = snappedTarget.id;
            clickedMethod = 'pinch';
          }
        }
      } else if (!this.radialOpen && movedFromStart > 20) {
        // Pinch + Move -> grab/drag 360 scene + forward depth zoom
        this.transitionState('DRAGGING', timestampMs);
        dragDelta = {
          yaw: -(cursorX - this.prevDragCursor.x) * 0.0085,
          pitch: -(cursorY - this.prevDragCursor.y) * 0.007,
        };
        const scaleDiff = smoothDepth - this.prevDragScale;
        if (Math.abs(scaleDiff) > 0.0015) {
          zoomDelta += scaleDiff * 60;
        }
        this.prevDragCursor = { x: cursorX, y: cursorY };
        this.prevDragScale = smoothDepth;
      }
    }

    /* -------- Radial Menu 700ms Dwell Confirmation -------- */
    if (this.radialOpen && radialSliceIndex >= 0 && !this.pinchActive && radialSelectedIndex === null) {
      if (this.radialDwellSlice !== radialSliceIndex) {
        this.radialDwellSlice = radialSliceIndex;
        this.radialDwellStartMs = timestampMs;
      } else {
        const held = timestampMs - this.radialDwellStartMs;
        radialDwellProgress = Math.min(1, held / 700);
        if (held >= 700) {
          radialSelectedIndex = radialSliceIndex;
          this.radialDwellSlice = -1;
        }
      }
    }

    /* -------- Push-Click (Optional, >18% scale jump in 200ms) -------- */
    this.scaleHistory.push({ t: timestampMs, s: m0.handSize });
    while (this.scaleHistory.length > 0 && timestampMs - this.scaleHistory[0].t > 200) {
      this.scaleHistory.shift();
    }
    if (
      options.pushClickEnabled &&
      snappedTarget &&
      !clickedTargetId &&
      !this.radialOpen &&
      timestampMs - this.lastPushClickMs > 650 &&
      this.scaleHistory.length >= 2
    ) {
      const earliest = this.scaleHistory[0];
      if (m0.handSize > earliest.s * 1.18) {
        clickedTargetId = snappedTarget.id;
        clickedMethod = 'push';
        this.lastPushClickMs = timestampMs;
      }
    }

    /* -------- Dwell-Click (900ms default) -------- */
    let dwellProgress = 0;
    if (options.dwellEnabled && snappedTarget && !this.pinchActive && !this.radialOpen) {
      if (this.dwellTargetId !== snappedTarget.id) {
        this.dwellTargetId = snappedTarget.id;
        this.dwellStartMs = timestampMs;
        this.dwellFiredForId = null;
      } else if (this.dwellFiredForId !== snappedTarget.id) {
        const held = timestampMs - this.dwellStartMs;
        dwellProgress = Math.min(1, held / dwellMs);
        if (held >= dwellMs) {
          clickedTargetId = snappedTarget.id;
          clickedMethod = 'dwell';
          this.dwellFiredForId = snappedTarget.id;
          dwellProgress = 1;
        }
      }
    } else {
      this.dwellTargetId = null;
      this.dwellStartMs = 0;
      if (!snappedTarget) this.dwellFiredForId = null;
    }

    /* -------- Final State Transition Arbitration -------- */
    if (this.radialOpen) {
      this.state = 'RADIAL_OPEN';
    } else if (!this.pinchActive && Math.abs(zoomDelta) <= 0.001) {
      this.transitionState(snappedTarget ? 'HOVER' : 'IDLE', timestampMs);
    }

    return {
      detected: true,
      raisedPromptVisible: false,
      cursorX,
      cursorY,
      viewportX,
      viewportY,
      snappedTargetId: snappedTarget?.id ?? null,
      snappedTargetEl: snappedTarget?.el ?? null,
      gestureState: this.state,
      pinchRatio: m0.pinchRatio,
      confidence,
      dwellProgress,
      radialHoldProgress,
      fistHoldProgress,
      radialCenter: this.radialCenter,
      radialSliceIndex,
      radialDwellProgress,
      clickedTargetId,
      clickedMethod,
      radialSelectedIndex,
      lookDelta,
      dragDelta,
      zoomDelta,
      rollDelta,
      swipeDirection,
      resetTriggered,
      closeRadialTriggered,
      handNormY: smoothNy,
      verticalSwipeDir,
    };
  }
}
