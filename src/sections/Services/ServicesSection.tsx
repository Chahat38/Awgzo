import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReality } from '../../context/RealityContext';
import { gsap, registerMotionPlugins, ScrollTrigger } from '../../lib/scroll';

const SERVICES = [
  {
    title: 'AR Development',
    body: 'AR development: AR try-on, AR business cards and WebAR product viewers that open in any phone browser.',
  },
  {
    title: 'VR Experiences',
    body: 'We build VR experiences for demos, training and immersive brand moments — scoped as a new build.',
  },
  {
    title: 'XR (WebXR) Development',
    body: 'WebXR development for browser-based AR and VR. We create immersive XR solutions that run on phones and headsets.',
  },
  {
    title: 'Snap AR Effects',
    body: 'Snap AR Lenses with face tracking, world effects and branded overlays, made for creators and campaigns.',
  },
  {
    title: 'Digital Marketing & Branding',
    body: 'AR marketing and brand strategy for businesses: clear positioning, content, search and social campaigns.',
  },
  {
    title: 'Website & E-commerce',
    body: 'Fast websites and online stores with clear CTAs, mobile-first layouts and simple checkout paths.',
  },
  {
    title: 'Software Development',
    body: 'Web and mobile software that removes repetitive work and supports better decisions.',
  },
  {
    title: 'Business Consulting & Strategy',
    body: 'Practical XR strategy and digital roadmaps that turn a short brief into clear build priorities.',
  },
];

const pad = (value: number) => String(value).padStart(2, '0');
const TAU = Math.PI * 2;
const OBJECT_SCALE = 0.72;
const STACK_BREAKPOINT = 1100;
const ALIGN = new Set([0, 1, 3]);
const BOX_W = 3.4;
const BOX_H = 2.9;
const BOX_MAXUP = 1.25;

type Shape = (index: number) => number[];

const rotateY = (p: number[], a: number) => [
  p[0] * Math.cos(a) + p[2] * Math.sin(a),
  p[1],
  -p[0] * Math.sin(a) + p[2] * Math.cos(a),
];

const rotateX = (p: number[], a: number) => [
  p[0],
  p[1] * Math.cos(a) - p[2] * Math.sin(a),
  p[1] * Math.sin(a) + p[2] * Math.cos(a),
];

/** One particle shape per service, same order as SERVICES above. */
const SHAPES: Shape[] = [
  /* 01 AR Development - AR smart glasses projecting an info card, a gauge and a 3D cube */
  () => {
    const rnd = Math.random;
    const q = rnd(), LX = 0.62, LW = 0.5, LH = 0.36;
    const se = (cx: number, th: number, w: number, h: number) => {
      const c = Math.cos(th), s = Math.sin(th);
      return [cx + w * Math.sign(c) * Math.pow(Math.abs(c), 0.45), h * Math.sign(s) * Math.pow(Math.abs(s), 0.55)];
    };
    const ln = (a: number, b: number, c: number, d: number, e: number, f: number) => {
      const t = rnd();
      return [a + (c - a) * t, b + (d - b) * t, e + (f - e) * t];
    };
    let p: number[];
    if (q < 0.3) { const s = rnd() < 0.5 ? -1 : 1, e = se(s * LX, rnd() * TAU, LW, LH); p = [e[0], e[1], 0]; } /* two lens rims */
    else if (q < 0.36) { const s = rnd() < 0.5 ? -1 : 1, a = rnd() * 2 - 1, b = rnd() * 2 - 1; p = [s * LX + a * LW * 0.9, b * LH * 0.85, 0]; } /* lens glass (sparse) */
    else if (q < 0.4) { const t = rnd() * Math.PI; p = [0.14 * Math.cos(t), 0.1 + 0.06 * Math.sin(t), 0]; } /* nose bridge */
    else if (q < 0.44) p = ln(-LX - LW, 0.3, LX + LW, 0.3, 0, 0).map((v, k) => (k === 1 ? v + (rnd() - 0.5) * 0.02 : v)); /* brow bar */
    else if (q < 0.56) { const s = rnd() < 0.5 ? -1 : 1, y = rnd() < 0.5 ? 0.3 : 0.2; p = ln(s * (LX + LW), y, s * (LX + LW + 0.1), y - 0.04, 0, -1.0); } /* temples */
    else if (q < 0.68) { /* info card */
      const x0 = 0.95, y0 = 0.88, z = 0.4, w = 0.48, h = 0.3, k = rnd();
      if (k < 0.6) {
        let s = rnd() * (4 * w + 4 * h), x: number, y: number;
        if (s < 2 * w) { x = -w + s; y = -h; }
        else if ((s -= 2 * w) < 2 * h) { x = w; y = -h + s; }
        else if ((s -= 2 * h) < 2 * w) { x = w - s; y = h; }
        else { s -= 2 * w; x = -w; y = h - s; }
        p = [x0 + x, y0 + y, z];
      } else {
        const row = (rnd() * 3) | 0, len = [0.8, 0.6, 0.7][row];
        p = [x0 - w * 0.8 + rnd() * w * len * 1.2, y0 + h * 0.45 - row * 0.28 * h * 1.6, z];
      }
    } else if (q < 0.8) { /* gauge ring */
      const cx = -1.0, cy = 0.88, z = 0.4, t = rnd() * TAU, r = rnd();
      if (r < 0.55) p = [cx + Math.cos(t) * 0.34, cy + Math.sin(t) * 0.34, z];
      else if (r < 0.85) { const a = ((120 + rnd() * 240) * Math.PI) / 180; p = [cx + Math.cos(a) * 0.22, cy + Math.sin(a) * 0.22, z]; }
      else p = [cx + Math.cos(t) * 0.06 * Math.sqrt(rnd()), cy + Math.sin(t) * 0.06 * Math.sqrt(rnd()), z];
    } else if (q < 0.92) { /* mini 3D cube */
      const cx = 1.0, cy = -0.82, z = 0.4, h = 0.26, e = (rnd() * 12) | 0, ax = (e / 4) | 0, k = e % 4, a = k & 1 ? 1 : -1, b = k & 2 ? 1 : -1, t = rnd() * 2 - 1;
      const v = ax === 0 ? [t, a, b] : ax === 1 ? [a, t, b] : [a, b, t];
      p = [cx + v[0] * h, cy + v[1] * h, z + v[2] * h];
    } else if (q < 0.96) { /* projection beams */
      const k = (rnd() * 3) | 0, E = [[0.95, 0.58, 0.4, 0.3, 0.3, 0], [-1.0, 0.54, 0.4, -0.55, 0.32, 0], [1.0, -0.56, 0.4, 0.55, -0.28, 0]][k], t = rnd();
      p = [E[0] + (E[3] - E[0]) * t, E[1] + (E[4] - E[1]) * t, E[2] + (E[5] - E[2]) * t];
    } else { /* sparkles */
      const c = [[-1.4, -0.5], [-0.55, -1.15], [1.55, 0.1]][(rnd() * 3) | 0], t = rnd() * 2 - 1;
      p = rnd() < 0.5 ? [c[0] + t * 0.13, c[1], 0.3] : [c[0], c[1] + t * 0.13, 0.3];
    }
    p = rotateY(p, 0.28);
    p = rotateX(p, -0.1);
    return [p[0] * 1.1 - 0.12, p[1] * 1.1 - 0.05, p[2] * 1.1];
  },
  /* 02 VR Experiences - front-facing VR headset: visor with two lens rings, nose notch, side and top straps */
  () => {
    const rnd = Math.random;
    const q = rnd(), HX = 1.3, HY = 0.6, HZ = 0.3;
    const se = (th: number) => {
      const c = Math.cos(th), s = Math.sin(th);
      return [HX * Math.sign(c) * Math.pow(Math.abs(c), 0.4), HY * Math.sign(s) * Math.pow(Math.abs(s), 0.55)];
    };
    const ok = (e: number[]) => !(Math.abs(e[0]) < 0.34 && e[1] < -HY * 0.45);
    let p: number[];
    let e: number[];
    if (q < 0.3) { do { e = se(rnd() * TAU); } while (!ok(e)); p = [e[0], e[1], rnd() < 0.7 ? HZ : -HZ * 0.3]; } /* visor outline */
    else if (q < 0.34) { do { e = se(rnd() * TAU); } while (!ok(e)); p = [e[0], e[1], HZ - rnd() * HZ * 1.3]; } /* depth edge */
    else if (q < 0.4) { const t = rnd() * Math.PI; p = [-0.34 * Math.cos(t), -HY + 0.3 * Math.sin(t), HZ + 0.005]; } /* nose notch */
    else if (q < 0.68) { /* two lens rings */
      const s = rnd() < 0.5 ? -1 : 1, r = rnd(), rr = r < 0.5 ? 0.41 : r < 0.82 ? 0.26 : 0.08 * Math.sqrt(rnd()), t = rnd() * TAU;
      p = [s * 0.7 + Math.cos(t) * rr, 0.02 + Math.sin(t) * rr, HZ + 0.02];
    } else if (q < 0.74) { const a = rnd() * 2 - 1, b = rnd() * 2 - 1; p = [HX * a * 0.94, HY * b * 0.92, HZ]; } /* front plate (sparse) */
    else if (q < 0.9) { /* side straps */
      const s = rnd() < 0.5 ? -1 : 1, t = rnd(), y = rnd() < 0.7 ? (rnd() < 0.5 ? 0.17 : -0.17) : (rnd() - 0.5) * 0.34;
      p = [s * (HX + 0.16 * Math.sin(Math.PI * t)), y, -t * 1.1];
    } else { /* top strap */
      const t = rnd();
      p = [rnd() < 0.6 ? (rnd() < 0.5 ? 0.13 : -0.13) : (rnd() - 0.5) * 0.26, HY + 0.3 * Math.sin(Math.PI * t) * 0.9, -t * 1.1];
    }
    p = rotateY(p, 0.26);
    p = rotateX(p, -0.1);
    return [p[0] * 1.1, p[1] * 1.1, p[2] * 1.1];
  },
  /* 03 XR (WebXR) - a browser window that opens into 3D: tab dots, address bar, and an XR cube + ring popping out of the page */
  () => {
    const rnd = Math.random;
    const r = rnd(), W = 1.5, H = 1.0, Z = -0.45, cz = 0.7, cy = -0.15, h = 0.62;
    let p: number[];
    if (r < 0.2) { const q = (rnd() * 4) | 0, t = rnd() * 2 - 1; p = [q < 2 ? t * W : q === 2 ? -W : W, q < 2 ? (q ? H : -H) : t * H, Z]; } /* window frame */
    else if (r < 0.27) p = [(rnd() * 2 - 1) * W, H - 0.3 + (rnd() - 0.5) * 0.03, Z]; /* toolbar line */
    else if (r < 0.31) p = [-W + 0.28 + ((rnd() * 3) | 0) * 0.2 + (rnd() - 0.5) * 0.07, H - 0.15 + (rnd() - 0.5) * 0.07, Z]; /* 3 tab dots */
    else if (r < 0.36) p = [-0.1 + (rnd() * 2 - 1) * 0.95, H - 0.15 + (rnd() < 0.5 ? 1 : -1) * 0.07, Z]; /* address bar */
    else if (r < 0.43) p = [(rnd() * 2 - 1) * (W - 0.1), (rnd() * 2 - 1) * (H - 0.45) - 0.12, Z]; /* page */
    else if (r < 0.68) { /* XR cube */
      const e = (rnd() * 12) | 0, ax = (e / 4) | 0, k = e % 4, a = k & 1 ? 1 : -1, b = k & 2 ? 1 : -1, t = rnd() * 2 - 1;
      const v = ax === 0 ? [t, a, b] : ax === 1 ? [a, t, b] : [a, b, t];
      p = [v[0] * h, cy + v[1] * h, cz + v[2] * h];
    } else if (r < 0.84) { const t = rnd() * TAU, c = Math.cos(t) * 1.05; p = [c * Math.cos(0.4), cy + c * Math.sin(0.4), cz + Math.sin(t) * 1.05]; } /* orbit ring */
    else { /* beams from page to cube */
      const sx = rnd() < 0.5 ? -1 : 1, sy = rnd() < 0.5 ? -1 : 1, t = rnd();
      p = [sx * W * 0.8 + (sx * h - sx * W * 0.8) * t, sy * H * 0.55 + (cy + sy * h - sy * H * 0.55) * t, Z + (cz - h - Z) * t];
    }
    p = rotateY(p, 0.55);
    return [p[0], p[1] + 0.05, p[2]];
  },
  /* 04 Snap AR Effects - Snapchat-style ghost with eyes, arms, scalloped hem and AR sparkles */
  () => {
    const rnd = Math.random;
    const r = rnd(), o = (rnd() - 0.5) * 0.06, R = 0.72, CY = 0.38, BW = 0.82, YB = -0.72;
    let p: number[];
    if (r < 0.3) { const t = rnd() * Math.PI; p = [Math.cos(t) * (R + o), CY + Math.sin(t) * (R + o)]; } /* dome */
    else if (r < 0.42) { const s = rnd() < 0.5 ? -1 : 1, t = rnd(); p = [s * (R + (BW - R) * t + o), CY - t * (CY - YB)]; } /* sides */
    else if (r < 0.52) { const x = (rnd() * 2 - 1) * BW; p = [x, YB - 0.12 * Math.abs(Math.sin((Math.PI * (x + BW)) / ((2 * BW) / 3))) + o]; } /* scalloped hem */
    else if (r < 0.62) { /* arms */
      const s = rnd() < 0.5 ? -1 : 1, t = rnd(), A = [[0.76, 0.06], [1.12, -0.1], [1.0, -0.42], [0.82, -0.4]], k = Math.min(2, Math.floor(t * 3)), u = t * 3 - k;
      p = [s * (A[k][0] + (A[k + 1][0] - A[k][0]) * u + o), A[k][1] + (A[k + 1][1] - A[k][1]) * u + o];
    } else if (r < 0.72) { const s = rnd() < 0.5 ? -1 : 1, t = rnd() * TAU, rr = Math.sqrt(rnd()); p = [s * 0.27 + Math.cos(t) * 0.055 * rr, 0.5 + Math.sin(t) * 0.09 * rr]; } /* eyes */
    else if (r < 0.88) { /* soft body fill */
      const u = rnd(), v = rnd();
      p = [(u * 2 - 1) * (BW - 0.04) * (v < 0.5 ? 1 : 0.9), YB + rnd() * (CY + R * 0.9 - YB)];
      if (p[1] > CY) { const d = Math.sqrt(Math.max(0, 1 - ((p[1] - CY) / R) ** 2)) * R; p[0] = (rnd() * 2 - 1) * d * 0.94; }
    } else { /* sparkles */
      const c = [[1.35, 0.85], [-1.3, -0.55], [1.25, -0.85], [-1.1, 0.95]][(rnd() * 4) | 0], t = rnd() * 2 - 1;
      p = rnd() < 0.5 ? [c[0] + t * 0.14, c[1]] : [c[0], c[1] + t * 0.14];
    }
    return rotateY([p[0] * 1.12, (p[1] - 0.1) * 1.12, (rnd() - 0.5) * 0.16], 0.25);
  },
  /* 05 Digital Marketing & Branding - rising bars */
  () => {
    const k = (Math.random() * 5) | 0;
    const h = 0.7 + k * 0.6;
    return [(k - 2) * 0.85 + (Math.random() - 0.5) * 0.42, Math.random() * h - 1.5, (Math.random() - 0.5) * 0.42];
  },
  /* 06 Website & E-commerce - browser window */
  () => {
    const r = Math.random();
    if (r < 0.3) {
      const q = (Math.random() * 4) | 0;
      const t = Math.random() * 2 - 1;
      return [q < 2 ? t * 1.5 : q === 2 ? -1.5 : 1.5, q < 2 ? (q ? 1 : -1) : t, 0];
    }
    if (r < 0.4) return [-1.3 + ((Math.random() * 3) | 0) * 0.22 + (Math.random() - 0.5) * 0.08, 0.78 + (Math.random() - 0.5) * 0.08, 0.05];
    const b = (Math.random() * 3) | 0;
    return [[-0.9, 0.15, 0.95][b] + (Math.random() * 2 - 1) * [0.4, 0.4, 0.35][b], (Math.random() - 0.5) * 1.1 - 0.1, 0.25 * (b % 2) + 0.1];
  },
  /* 07 Software Development - </> */
  () => {
    const ends = [
      [-0.7, 0.8, -1.5, 0],
      [-1.5, 0, -0.7, -0.8],
      [0.7, 0.8, 1.5, 0],
      [1.5, 0, 0.7, -0.8],
      [0.3, 1, -0.3, -1],
    ];
    const g = ends[(Math.random() * 5) | 0];
    const t = Math.random();
    return [
      g[0] + (g[2] - g[0]) * t + (Math.random() - 0.5) * 0.14,
      g[1] + (g[3] - g[1]) * t + (Math.random() - 0.5) * 0.14,
      (Math.random() - 0.5) * 0.35,
    ];
  },
  /* 08 Business Consulting & Strategy - digital roadmap: winding path, milestones, goal flag */
  () => {
    const r = Math.random();
    const X = (u: number) => -1.9 + 3.2 * u;
    const Y = (u: number) => -1.4 + 2 * u + 0.45 * Math.sin(u * TAU * 1.5);
    if (r < 0.55) {
      const u = Math.random();
      return [X(u) + (Math.random() - 0.5) * 0.07, Y(u) + (Math.random() - 0.5) * 0.07, (Math.random() - 0.5) * 0.1];
    }
    if (r < 0.8) {
      const u = ((Math.random() * 4) | 0) / 3;
      const t = Math.random() * TAU;
      const rr = Math.random() < 0.6 ? 0.17 : 0.09 * Math.sqrt(Math.random());
      return [X(u) + Math.cos(t) * rr, Y(u) + Math.sin(t) * rr, 0];
    }
    if (r < 0.88) return [X(1), Y(1) + Math.random() * 0.9, (Math.random() - 0.5) * 0.05];
    let a = Math.random();
    let b = Math.random();
    if (a + b > 1) {
      a = 1 - a;
      b = 1 - b;
    }
    const P = [X(1), Y(1) + 0.9];
    const Q = [X(1) + 0.6, Y(1) + 0.7];
    const S = [X(1), Y(1) + 0.5];
    return [P[0] + (Q[0] - P[0]) * a + (S[0] - P[0]) * b, P[1] + (Q[1] - P[1]) * a + (S[1] - P[1]) * b, 0.02];
  },
];

const VERTEX_SHADER = `
  attribute vec3 p1, p2, p3, p4, p5, p6, p7;
  attribute float aR;
  uniform float uP, uT, uPx;
  uniform vec2 uM;
  uniform vec2 uS;
  varying float vC;
  varying float vA;

  vec3 hash(vec3 p) {
    p = fract(p * vec3(.1031, .103, .0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxz) * p.zyx) - .5;
  }

  void main() {
    float w0 = max(0., 1. - abs(uP));
    float w1 = max(0., 1. - abs(uP - 1.));
    float w2 = max(0., 1. - abs(uP - 2.));
    float w3 = max(0., 1. - abs(uP - 3.));
    float w4 = max(0., 1. - abs(uP - 4.));
    float w5 = max(0., 1. - abs(uP - 5.));
    float w6 = max(0., 1. - abs(uP - 6.));
    float w7 = max(0., 1. - abs(uP - 7.));

    vec3 pos = position * w0 + p1 * w1 + p2 * w2 + p3 * w3 + p4 * w4 + p5 * w5 + p6 * w6 + p7 * w7;
    float tr = sin(3.14159 * fract(uP));
    pos += normalize(hash(position * 9. + aR * 17.) + vec3(.001)) * tr * (uS.x + aR * uS.y);

    vec4 mv = modelViewMatrix * vec4(pos, 1.);
    vec2 dm = mv.xy - uM;
    float f = 1. - smoothstep(0., 1.1, length(dm));
    mv.xy += normalize(dm + vec2(.0001)) * f * .45;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = (2.4 + aR * 2.4) * (8. / -mv.z) * uPx;
    vC = aR;
    vA = .6 + .4 * f + tr * .3;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  varying float vC;
  varying float vA;

  void main() {
    float d = length(gl_PointCoord - .5);
    if (d > .5) discard;
    float a = smoothstep(.5, 0., d);
    vec3 col = mix(vec3(.91, .43, .13), vec3(.97, .97, .97), step(.72, vC));
    gl_FragColor = vec4(col, a * vA);
  }
`;

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLDivElement | null>(null);
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    const el = sectionRef.current;
    const canvas = canvasRef.current;
    if (!el) return;

    registerMotionPlugins();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (window.innerWidth < 700) ScrollTrigger.config({ ignoreMobileResize: true });

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveSection('services');
          sceneStateRef.current.section = 'services';
        }
      },
      { threshold: 0.25 }
    );
    sectionObserver.observe(el);

    const items = Array.from(textRef.current?.children ?? []) as HTMLElement[];
    const dots = Array.from(railRef.current?.children ?? []) as HTMLElement[];
    const setTextProgress = (progress: number) => {
      items.forEach((item, i) => {
        const weight = Math.max(0, 1 - Math.abs(progress - i));
        item.style.opacity = (weight * weight).toFixed(3);
        item.style.visibility = weight > 0.01 ? 'visible' : 'hidden';
        item.style.transform = `translate3d(0, ${((i - progress) * 60).toFixed(1)}px, 0)`;
        item.style.pointerEvents = weight > 0.6 ? 'auto' : 'none';
      });
      const activeIndex = Math.round(progress);
      dots.forEach((dot, i) => dot.classList.toggle('on', i === activeIndex));
      if (countRef.current) countRef.current.textContent = `${pad(activeIndex + 1)} / ${pad(SERVICES.length)}`;
    };

    if (reducedMotion) {
      setTextProgress(0);
      return () => sectionObserver.disconnect();
    }

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      if (canvas) {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(
          window.innerWidth < 700
            ? Math.min(window.devicePixelRatio || 1, 2)
            : Math.min(Math.max(window.devicePixelRatio, 1.5), 2)
        );
      }
    } catch {
      renderer = null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 9;

    const isPhone = window.innerWidth < 700;
    const particleCount = isPhone ? 9000 : 20000;
    const geometry = new THREE.BufferGeometry();
    const attributes = ['position', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];

    SHAPES.forEach((shape, shapeIndex) => {
      const values = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i += 1) {
        const point = shape(i);
        values[i * 3] = Number.isFinite(point[0]) ? point[0] : 0;
        values[i * 3 + 1] = Number.isFinite(point[1]) ? point[1] : 0;
        values[i * 3 + 2] = Number.isFinite(point[2]) ? point[2] : 0;
      }
      if (ALIGN.has(shapeIndex)) {
        // centre the redrawn shapes and fit them into the same box the other shapes fill, so every shape sits in the middle
        const xs = new Float32Array(particleCount);
        const ys = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i += 1) {
          xs[i] = values[i * 3];
          ys[i] = values[i * 3 + 1];
        }
        xs.sort();
        ys.sort();
        const lo = Math.floor(particleCount * 0.003);
        const hi = particleCount - 1 - lo;
        const cx = (xs[lo] + xs[hi]) / 2;
        const cy = (ys[lo] + ys[hi]) / 2;
        const w = Math.max(0.01, xs[hi] - xs[lo]);
        const h = Math.max(0.01, ys[hi] - ys[lo]);
        const k = Math.min(BOX_W / w, BOX_H / h, BOX_MAXUP);
        for (let i = 0; i < particleCount; i += 1) {
          values[i * 3] = (values[i * 3] - cx) * k;
          values[i * 3 + 1] = (values[i * 3 + 1] - cy) * k;
          values[i * 3 + 2] *= k;
        }
      }
      geometry.setAttribute(attributes[shapeIndex], new THREE.BufferAttribute(values, 3));
    });

    const randoms = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i += 1) randoms[i] = Math.random();
    geometry.setAttribute('aR', new THREE.BufferAttribute(randoms, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uP: { value: 0 },
        uT: { value: 0 },
        uPx: { value: renderer?.getPixelRatio() ?? 1 },
        uM: { value: new THREE.Vector2(99, 99) },
        uS: { value: new THREE.Vector2(isPhone ? 0.6 : 1.0, isPhone ? 1.0 : 2.0) },
      },
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const resize = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      renderer?.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();

      const halfHeight = Math.tan(0.3927) * 9;
      const halfWidth = halfHeight * camera.aspect;
      const worldPerPx = (2 * halfHeight) / Math.max(1, height);
      const sectionRect = el.getBoundingClientRect();
      const headBottom = (headRef.current?.getBoundingClientRect().bottom ?? sectionRect.top + 200) - sectionRect.top;
      const textRect = textRef.current?.getBoundingClientRect();
      const activeText = items.find((item) => parseFloat(item.style.opacity || '0') > 0.6);
      const textTop = ((activeText ?? textRef.current)?.getBoundingClientRect().top ?? sectionRect.top + height * 0.8) - sectionRect.top;

      if (width <= STACK_BREAKPOINT) {
        // phones and tablets: heading on top, shape in the free space, service copy below
        const gapTop = headBottom + 8;
        const gapBottom = Math.max(gapTop + 60, textTop - 8);
        const centerPx = (gapTop + gapBottom) / 2;
        const halfGapWorld = ((gapBottom - gapTop) / 2) * worldPerPx;
        // largest shape is about 2.1 wide and 1.8 tall (half extents)
        const fit = Math.min((halfWidth * 0.9) / 2.1, (halfGapWorld * 0.95) / 1.8);
        points.position.set(0, -(centerPx - height / 2) * worldPerPx, 0);
        points.scale.setScalar(fit);
        // laptop look: ~20000 particles at scale 0.86; keep the same density for a smaller shape
        const density = Math.round(Math.min(particleCount, Math.max(2500, 20000 * (fit / 0.86) ** 2)));
        geometry.setDrawRange(0, density);
      } else {
        // desktop: keep the shape entirely between the copy block and the dot rail
        const textRight = (textRect?.right ?? sectionRect.left + width * 0.6) - sectionRect.left;
        const railLeft = (railRef.current?.getBoundingClientRect().left ?? sectionRect.right - 40) - sectionRect.left;
        const availableLeft = textRight + 24;
        const availableRight = Math.max(availableLeft + 60, railLeft - 24);
        const centerPx = Math.min(width * 0.72, (availableLeft + availableRight) / 2);
        const centerX = ((centerPx / width) * 2 - 1) * halfWidth;
        const roomPx = Math.min(centerPx - availableLeft, availableRight - centerPx);
        const scale = Math.min(1.2, (roomPx * worldPerPx) / (2.1 * OBJECT_SCALE), (halfHeight * 0.9) / (2.5 * OBJECT_SCALE));
        // the text block starts a little below the section title, so centre the shape on it
        const blockCenter = Math.min(Math.max(230, height * 0.34), 300) + 180;
        const offsetY = -((blockCenter - height / 2) / (height / 2)) * halfHeight;
        points.position.set(centerX, offsetY, 0);
        points.scale.setScalar(scale * OBJECT_SCALE);
        geometry.setDrawRange(0, particleCount);
      }
    };
    let drawnP = -1;
    let drawnX = 0;
    let drawnY = 0;
    const onResize = () => {
      resize();
      drawnP = -1;
    };
    resize();
    window.requestAnimationFrame(onResize);
    document.fonts?.ready.then(onResize);
    window.addEventListener('resize', onResize);
    const onContextLost = (event: Event) => event.preventDefault();
    const onContextRestored = () => {
      drawnP = -1;
    };
    canvas?.addEventListener('webglcontextlost', onContextLost);
    canvas?.addEventListener('webglcontextrestored', onContextRestored);

    const morph = { p: 0 };
    let target = 0;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: `+=${(SERVICES.length - 1) * 130}%`,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // each shape holds fully formed for part of its scroll, then morphs smoothly to the next
        const last = SERVICES.length - 1;
        const v = self.progress * last;
        const j = Math.min(last - 1, Math.floor(v));
        const q = Math.max(0, Math.min(1, (v - j - 0.3) / 0.4));
        target = j + q * q * q * (q * (q * 6 - 15) + 10);
      },
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        trigger.scroll(trigger.start + (trigger.end - trigger.start) * (i / (SERVICES.length - 1)));
      });
    });

    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let visible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '120px' }
    );
    visibilityObserver.observe(el);

    let frame = 0;
    let lastTime = 0;
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!visible) return;
      // phones: cap at ~30 fps
      if (isPhone && lastTime && now - lastTime < 32) return;

      // frame-rate independent easing with a speed limit, so fast scrolling never makes particles whip around
      const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 0.016);
      lastTime = now;
      const maxStep = 2.2 * dt;
      const delta = (target - morph.p) * (1 - Math.exp(-dt * 6));
      morph.p += Math.max(-maxStep, Math.min(maxStep, delta));
      if (Math.abs(target - morph.p) < 0.0005) morph.p = target;
      const progress = Math.max(0, Math.min(SERVICES.length - 1, morph.p));

      smoothX += (pointerX - smoothX) * 0.08;
      smoothY += (pointerY - smoothY) * 0.08;
      // phones: nothing moved since the last drawn frame -> skip drawing (saves battery and keeps scrolling smooth)
      if (
        isPhone &&
        Math.abs(progress - drawnP) < 0.0004 &&
        Math.abs(smoothX - drawnX) < 0.0004 &&
        Math.abs(smoothY - drawnY) < 0.0004
      ) {
        return;
      }
      drawnP = progress;
      drawnX = smoothX;
      drawnY = smoothY;

      material.uniforms.uP.value = progress;
      material.uniforms.uT.value = now / 1000;
      const halfHeight = Math.tan(0.3927) * 9;
      material.uniforms.uM.value.set(smoothX * 2 * halfHeight * camera.aspect, -smoothY * 2 * halfHeight);
      points.rotation.y = -0.12 + smoothX * 0.2;
      points.rotation.x = smoothY * 0.12;

      setTextProgress(progress);
      renderer?.render(scene, camera);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      canvas?.removeEventListener('webglcontextlost', onContextLost);
      canvas?.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('pointermove', onPointerMove);
      visibilityObserver.disconnect();
      sectionObserver.disconnect();
      trigger.kill();
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
    };
  }, [sceneStateRef, setActiveSection]);

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-label="Services section"
      className="relative z-10 h-[100svh] min-h-[640px] overflow-hidden border-t border-white/[0.08]"
      style={{
        background:
          'radial-gradient(800px 520px at 72% 50%, rgba(232,109,34,0.13), transparent 60%), #10191f',
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      <div ref={headRef} className="pointer-events-none absolute inset-x-0 top-[calc(6vh+28px)] z-10 text-center">
        <span className="font-mono-tabular text-[0.75rem] uppercase tracking-[0.25em] text-[#ee8a52]">
          What we do
        </span>
        <h2 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-none tracking-[0.03em]">
          AR VR XR Services
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#9fa3a5] sm:text-base">
          We build AR try-on, VR experiences, WebXR, Snap AR effects, websites, software and
          marketing.
        </p>
      </div>

      <div
        ref={textRef}
        className="absolute left-[clamp(18px,6vw,112px)] top-[clamp(230px,34svh,300px)] z-10 h-[360px] w-[min(540px,88vw)] max-[1100px]:bottom-[112px] max-[1100px]:left-[6vw] max-[1100px]:top-auto max-[1100px]:h-[226px]"
      >
        {SERVICES.map((service, index) => (
          <div
            key={service.title}
            className="absolute left-0 top-0 w-full max-[1100px]:bottom-0 max-[1100px]:top-auto"
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            <span className="font-mono-tabular block text-[1.6rem] text-[#e86d22] max-[1100px]:text-[1.25rem]">{pad(index + 1)}</span>
            <h3 className="mt-1 font-display text-[clamp(2.3rem,4.6vw,4.4rem)] leading-[1] max-[1100px]:text-[clamp(1.9rem,4vw,2.3rem)]">
              {service.title}
            </h3>
            <p className="mt-3 max-w-[440px] text-[0.98rem] leading-relaxed text-[#9fa3a5] max-[1100px]:mt-2 max-[1100px]:text-[0.8rem] max-[1100px]:leading-[1.5]">
              {service.body}
            </p>
            <a href="#contact" className="mt-4 inline-block font-semibold text-[#ee8a52] max-[1100px]:mt-3">
              Learn more →
            </a>
          </div>
        ))}
      </div>

      <div
        ref={railRef}
        className="svc-rail absolute right-[clamp(12px,3vw,40px)] top-1/2 z-20 grid -translate-y-1/2 gap-4"
      >
        {SERVICES.map((service, index) => (
          <button
            key={service.title}
            type="button"
            aria-label={`Learn about ${service.title}`}
            className={`h-2.5 w-2.5 rounded-full bg-white/20 transition-all duration-300 hover:bg-[#e86d22] ${
              index === 0 ? 'scale-[1.7] bg-[#e86d22] shadow-[0_0_14px_#e86d22]' : ''
            }`}
          />
        ))}
      </div>

      <div
        ref={countRef}
        className="absolute bottom-[5vh] right-[clamp(12px,3vw,40px)] z-20 font-mono-tabular text-[0.8rem] tracking-[0.25em] text-[#ee8a52] max-[700px]:hidden"
      >
        01 / 08
      </div>
    </section>
  );
}