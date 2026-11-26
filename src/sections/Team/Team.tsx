import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { getTeamMembers } from '../../data/team';
import { useReality } from '../../context/RealityContext';

/* "Meet the AR VR XR Team" - 2s AR Scanner Warp scroll animation. Used on Home and About. */
const CSS = `
/* ═════════ AWGZO TEAM · AR SCANNER WARP (2s) ═════════ */
.awz-warp{--o:#e86d22;--o2:#ff9a55;--ar:232,109,34;--ink:#f7f8f7;--mute:#a7afb3;position:relative;background:#080808;color:var(--ink);font-family:var(--font-sans);padding:0 0 80px;overflow:hidden}
.awz-warp *{box-sizing:border-box}
.awz-warp .intro{padding:clamp(70px,11vh,110px) 6vw 0;text-align:center}
.awz-warp .kick{font:500 .75rem var(--font-mono);letter-spacing:.3em;color:var(--o);text-transform:uppercase}
.awz-warp .intro h2{margin:14px 0 12px;font:600 clamp(2rem,5vw,3.8rem)/1.02 var(--font-display);letter-spacing:-.02em}
.awz-warp .intro h2 em{font-style:normal;color:var(--o)}
.awz-warp .intro p{margin:0 auto;max-width:560px;color:var(--mute);line-height:1.6;font-size:.95rem}

.awz-warp .awz-spacer{height:0;pointer-events:none}
.awz-warp .grid{display:grid;grid-template-columns:repeat(12,1fr);gap:34px 26px;width:min(1240px,calc(100% - 12vw));margin:0 auto;padding:32px 0 120px}
@media(min-width:901px){
  .awz-warp .c1{grid-column:5/span 4}.awz-warp .c2{grid-column:1/span 4}.awz-warp .c3{grid-column:5/span 4}
  .awz-warp .c4{grid-column:9/span 4}.awz-warp .c5{grid-column:1/span 4}.awz-warp .c6{grid-column:5/span 4}
  .awz-warp .c7{grid-column:9/span 4}
}
@media(max-width:900px){
  .awz-warp .grid{grid-template-columns:repeat(2,1fr);width:min(760px,calc(100% - 10vw))}
  .awz-warp .c1{grid-column:1/-1;max-width:430px;width:100%;justify-self:center}
}
@media(max-width:560px){
  .awz-warp .grid{grid-template-columns:1fr;width:calc(100% - 10vw)}
  .awz-warp .c1{max-width:none}
}

.awz-warp .tcard{background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.015)),#0e0e0e;border:1px solid rgba(255,255,255,.13);border-radius:20px;overflow:visible}
.awz-warp .tcard.lead{border-color:rgba(var(--ar),.7);background:linear-gradient(160deg,rgba(var(--ar),.14),rgba(255,255,255,.015)),#0e0e0e;box-shadow:0 0 60px rgba(var(--ar),.2)}
.awz-warp .ph{position:relative;height:250px;border-radius:19px 19px 0 0;overflow:hidden;display:grid;place-items:center;background:radial-gradient(70% 70% at 50% 42%,rgba(var(--ar),.42),transparent 72%),linear-gradient(#171717,#090909)}
.awz-warp .lead .ph{height:310px}
.awz-warp .ph-fill{position:absolute;inset:-8%;background-size:cover;background-position:center;filter:blur(22px) brightness(.55);opacity:.8;transform:scale(1.06)}
.awz-warp .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom;z-index:1}
.awz-warp .ti{position:relative;z-index:1;font:600 4.2rem/1 var(--font-display);color:var(--o2);text-shadow:0 0 30px rgba(var(--ar),.6)}
.awz-warp .lead .ti{font-size:5.8rem}
.awz-warp .orb{position:absolute;width:62%;aspect-ratio:1;border-radius:50%;border:1px dashed rgba(var(--ar),.6);animation:awzOrb 14s linear infinite}
.awz-warp .orb::after{content:"";position:absolute;top:-4px;left:50%;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--o);box-shadow:0 0 12px var(--o)}
@keyframes awzOrb{to{transform:rotate(360deg)}}
.awz-warp .ph u{position:absolute;z-index:2;width:14px;height:14px;border:2px solid var(--o);opacity:.8;text-decoration:none}
.awz-warp .ph u:nth-of-type(1){top:10px;left:10px;border-right:0;border-bottom:0}
.awz-warp .ph u:nth-of-type(2){top:10px;right:10px;border-left:0;border-bottom:0}
.awz-warp .ph u:nth-of-type(3){bottom:10px;left:10px;border-right:0;border-top:0}
.awz-warp .ph u:nth-of-type(4){bottom:10px;right:10px;border-left:0;border-top:0}
.awz-warp .tag{position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:2;font:600 .62rem var(--font-mono);letter-spacing:.24em;text-transform:uppercase;white-space:nowrap;color:#080808;background:var(--o);padding:5px 13px;border-radius:99px}
.awz-warp .body{padding:18px 20px 22px}
.awz-warp .body small{font:500 .7rem var(--font-mono);letter-spacing:.2em;color:var(--o)}
.awz-warp .body h3{margin:5px 0 6px;font:600 1.45rem/1.1 var(--font-display)}
.awz-warp .lead .body{text-align:center}
.awz-warp .lead .body h3{font-size:1.95rem}
.awz-warp .role{font:500 .66rem var(--font-mono);letter-spacing:.14em;color:var(--o2);text-transform:uppercase;line-height:1.5}
.awz-warp .body p{color:#8f979b;margin:10px 0 14px;font-size:.9rem;line-height:1.55}
/* runtime warp / scan layers */
.awz-warp .awz-card{position:relative;will-change:transform,opacity;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.awz-warp .awz-holo{position:absolute;inset:0;z-index:3;pointer-events:none;border-radius:inherit;overflow:hidden}
.awz-warp .awz-holo i{position:absolute;left:0;top:0;width:100%;height:100%;will-change:transform;background:linear-gradient(180deg,rgba(10,8,6,.93),rgba(10,8,6,.86)),repeating-linear-gradient(0deg,rgba(var(--ar),.35) 0 1px,transparent 1px 16px),repeating-linear-gradient(90deg,rgba(var(--ar),.35) 0 1px,transparent 1px 16px)}
.awz-warp .awz-beam{position:absolute;left:0;top:-3px;width:100%;height:64px;pointer-events:none;opacity:0;will-change:transform,opacity;background:linear-gradient(180deg,transparent,rgba(var(--ar),1) 5%,rgba(var(--ar),.25) 34%,transparent 94%)}
.awz-warp .awz-card::before{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:inherit;opacity:var(--edge,0);will-change:opacity;box-shadow:inset 0 0 0 1px rgb(var(--ar)),0 0 36px rgba(var(--ar),.5)}
.awz-warp .awz-card::after{content:"";position:absolute;inset:-9px;z-index:5;pointer-events:none;opacity:var(--lock,0);transform:scale(calc(1.16 - var(--lock,0)*.16));background:linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 0 0/26px 2px no-repeat,linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 0 0/2px 26px no-repeat,linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 100% 0/26px 2px no-repeat,linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 100% 0/2px 26px no-repeat,linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 0 100%/26px 2px no-repeat,linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 0 100%/2px 26px no-repeat,linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 100% 100%/26px 2px no-repeat,linear-gradient(rgb(var(--ar)),rgb(var(--ar))) 100% 100%/2px 26px no-repeat}
.awz-warp .awz-aura{position:fixed;left:50%;top:50%;width:100vmin;height:100vmin;margin:-50vmin 0 0 -50vmin;border-radius:50%;pointer-events:none;z-index:0;opacity:0;will-change:opacity;background:radial-gradient(circle,rgba(var(--ar),.3),rgba(var(--ar),.07) 42%,transparent 68%)}
.awz-warp .awz-hud{position:fixed;inset:0;pointer-events:none;z-index:40;opacity:0;font:600 11px/1.2 var(--font-mono);letter-spacing:.16em;color:rgb(var(--ar))}
.awz-warp .awz-ret{position:absolute;left:50%;top:50%;width:220px;height:220px;margin:-110px 0 0 -110px}
.awz-warp .awz-ret svg{width:100%;height:100%;overflow:visible}
.awz-warp .awz-hud .t{position:absolute;left:50%;transform:translateX(-50%);white-space:nowrap;text-shadow:0 0 12px rgba(var(--ar),.7)}
.awz-warp .awz-hud .tl{position:absolute;left:24px;top:24px;opacity:.8}
.awz-warp .awz-hud .tr{position:absolute;right:24px;top:24px;opacity:.8}
.awz-warp .awz-bar{position:fixed;left:0;top:0;height:2px;width:100%;transform-origin:0 50%;transform:scaleX(0);z-index:45;pointer-events:none;background:linear-gradient(90deg,rgba(var(--ar),.2),rgb(var(--ar)))}
@media(hover:none),(pointer:coarse){.awz-warp .orb{animation:none}}
@media(prefers-reduced-motion:reduce){.awz-warp .orb{animation:none}}
`;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eOut = (t: number) => 1 - Math.pow(1 - t, 3);
const pad = (n: number) => (n < 10 ? '0' : '') + n;
const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();

/* rotation helpers: matrix -> quaternion -> identity (tunnel pose settle) */
const rotX = (a: number): number[] => {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, c, -s, 0, s, c];
};
const rotY = (a: number): number[] => {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
};
const rotZ = (a: number): number[] => {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};
const mul = (a: number[], b: number[]): number[] => {
  const o = new Array<number>(9);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
};
const toQuat = (m: number[]): number[] => {
  const t = m[0] + m[4] + m[8];
  let w: number, x: number, y: number, z: number, s: number;
  if (t > 0) {
    s = Math.sqrt(t + 1) * 2; w = s / 4; x = (m[7] - m[5]) / s; y = (m[2] - m[6]) / s; z = (m[3] - m[1]) / s;
  } else if (m[0] > m[4] && m[0] > m[8]) {
    s = Math.sqrt(1 + m[0] - m[4] - m[8]) * 2; w = (m[7] - m[5]) / s; x = s / 4; y = (m[1] + m[3]) / s; z = (m[2] + m[6]) / s;
  } else if (m[4] > m[8]) {
    s = Math.sqrt(1 + m[4] - m[0] - m[8]) * 2; w = (m[2] - m[6]) / s; x = (m[1] + m[3]) / s; y = s / 4; z = (m[5] + m[7]) / s;
  } else {
    s = Math.sqrt(1 + m[8] - m[0] - m[4]) * 2; w = (m[3] - m[1]) / s; x = (m[2] - m[6]) / s; y = (m[5] - m[7]) / s; z = s / 4;
  }
  return [w, x, y, z];
};
const slerpToIdentity = (q: number[], t: number): number[] => {
  let w = q[0], x = q[1], y = q[2], z = q[3];
  if (w < 0) { w = -w; x = -x; y = -y; z = -z; }
  const th = Math.acos(clamp(w, -1, 1)), sn = Math.sin(th);
  const a = sn < 1e-5 ? 1 - t : Math.sin((1 - t) * th) / sn;
  const b = sn < 1e-5 ? t : Math.sin(t * th) / sn;
  return [a * w + b, a * x, a * y, a * z];
};
const fromQuat = (q: number[]): number[] => {
  let w = q[0], x = q[1], y = q[2], z = q[3];
  const n = Math.sqrt(w * w + x * x + y * y + z * z) || 1;
  w /= n; x /= n; y /= n; z /= n;
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
    2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
    2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y),
  ];
};

type CardInfo = { cx: number; cy: number; w: number; h: number };
type HoverState = { rx: number; ry: number; trx: number; try_: number };

export function Team() {
  const members = useMemo(() => getTeamMembers(), []);
  const N = members.length;
  const { setActiveSection, sceneStateRef } = useReality();
  const rootRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const auraRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const r1Ref = useRef<SVGGElement | null>(null);
  const r2Ref = useRef<SVGGElement | null>(null);
  const t1Ref = useRef<HTMLDivElement | null>(null);
  const t2Ref = useRef<HTMLDivElement | null>(null);
  const pctRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveSection('team');
          sceneStateRef.current.section = 'team';
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sceneStateRef, setActiveSection]);

  useEffect(() => {
    const root = rootRef.current;
    const grid = gridRef.current;
    const spacer = spacerRef.current;
    if (!root || !grid || !spacer) return;

    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.awz-card'));
    const hiEls = cards.map((c) => c.querySelector<HTMLElement>('.awz-holo i'));
    const beamEls = cards.map((c) => c.querySelector<HTMLElement>('.awz-beam'));
    const aura = auraRef.current;
    const bar = barRef.current;
    const hud = hudRef.current;
    const r1 = r1Ref.current;
    const r2 = r2Ref.current;
    const t1 = t1Ref.current;
    const t2 = t2Ref.current;
    const pct = pctRef.current;

    if (RM || cards.length === 0) {
      cards.forEach((c) => {
        c.style.opacity = '1';
        c.style.visibility = 'visible';
        c.style.pointerEvents = 'auto';
      });
      spacer.style.height = '0px';
      return;
    }

    const TOUCH = window.matchMedia('(hover:none),(pointer:coarse)').matches;
    const DUR = 2000;
    const PI = Math.PI;
    let vw = 0, vh = 0, Z0 = 1900, R0 = 0, ST = 0, P0 = 0, Pend = 0, gx = 0, gy = 0;
    let info: CardInfo[] = [], startS: number[] = [], endS: number[] = [], settled: boolean[] = [];
    let Scur = window.scrollY, TRIG = 0, played = false, t0 = 0;
    let running = false, idle = 0, lastLocked = -1, lastScan = '', raf = 0;
    let resizeTimer = 0;
    const hov: HoverState[] = cards.map(() => ({ rx: 0, ry: 0, trx: 0, try_: 0 }));

    const measure = () => {
      settled = [];
      cards.forEach((c) => {
        c.style.transform = 'none';
        c.style.opacity = '';
        c.style.filter = '';
      });
      grid.style.perspective = 'none';
      vw = window.innerWidth;
      vh = window.innerHeight;
      R0 = Math.min(vw, vh) * 0.42;
      spacer.style.height = '0px';
      const SP = vh * 0.08;
      spacer.style.height = `${SP}px`;
      const sy = window.scrollY, sx = window.scrollX;
      const gr = grid.getBoundingClientRect();
      gx = gr.left + sx;
      gy = gr.top + sy;
      ST = spacer.getBoundingClientRect().top + sy;
      info = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return { cx: r.left + sx + r.width / 2, cy: r.top + sy + r.height / 2, w: r.width, h: r.height };
      });
      const maxS = document.documentElement.scrollHeight - vh - 24;
      let col = 0, lastRow: number | null = null;
      const order = info.map((_, i) => i).sort((p, q) => info[p].cy - info[q].cy || info[p].cx - info[q].cx);
      order.forEach((i) => {
        if (lastRow === null || Math.abs(info[i].cy - lastRow) > 12) {
          col = 0;
          lastRow = info[i].cy;
        } else col++;
        const e = Math.min(info[i].cy - vh * 0.6 + col * vh * 0.26, maxS);
        endS[i] = e;
        startS[i] = e - vh * 1.25;
      });
      P0 = Math.min(...startS);
      Pend = Math.max(...endS);
      if (P0 < ST - vh * 0.5) {
        const d = ST - vh * 0.5 - P0;
        for (let k = 0; k < N; k++) startS[k] += d;
        P0 += d;
      }
      // Begin the warp exactly where the virtual scroll begins: just under the
      // heading. This removes the dead scroll gap before the cards appear.
      TRIG = Math.max(0, P0);
    };

    const frame = () => {
      const sy = window.scrollY, sx = window.scrollX, now = performance.now();
      if (!played && sy >= TRIG) {
        played = true;
        t0 = now;
      } else if (played && sy < TRIG - vh * 0.6) played = false;

      const tp = played ? clamp((now - t0) / DUR, 0, 1) : 0;
      Scur = played ? P0 + tp * (Pend - P0) : P0 - 1;
      const P = clamp((Scur - P0) / (Pend - P0), 0, 1);
      let work = played && tp < 1;
      const done = P >= 1;
      const vcx = vw / 2 + sx, vcy = vh / 2 + sy;
      let locked = 0, scanNow = '';

      grid.style.perspective = done ? 'none' : '1300px';
      grid.style.perspectiveOrigin = `${vw / 2 - (gx - sx)}px ${vh / 2 - (gy - sy)}px`;
      const fadeIn = clamp(P * 10, 0, 1);

      cards.forEach((c, i) => {
        const inf = info[i], s = c.style;
        if (P <= 0) {
          s.opacity = '0';
          s.visibility = 'hidden';
          s.pointerEvents = 'none';
          return;
        }
        s.visibility = 'visible';
        const raw = clamp((Scur - startS[i]) / (endS[i] - startS[i]), 0, 1);
        const u = eOut(raw);
        const m = clamp((raw - 0.55) / 0.42, 0, 1);
        if (raw >= 1) locked++;
        if (m > 0 && m < 1) scanNow = c.getAttribute('data-name') || '';

        if (done) {
          const h = hov[i];
          h.rx = lerp(h.rx, h.trx, 0.14);
          h.ry = lerp(h.ry, h.try_, 0.14);
          if (Math.abs(h.rx - h.trx) + Math.abs(h.ry - h.try_) > 0.01) work = true;
          s.transform = Math.abs(h.rx) + Math.abs(h.ry) < 0.02
            ? 'none'
            : `perspective(1000px) rotateX(${h.rx.toFixed(2)}deg) rotateY(${h.ry.toFixed(2)}deg)`;
          s.opacity = '1';
          s.filter = 'none';
          s.zIndex = '';
          s.pointerEvents = 'auto';
          if (hiEls[i]) hiEls[i].style.transform = 'translate3d(0,100%,0)';
          if (beamEls[i]) beamEls[i].style.opacity = '0';
          s.setProperty('--lock', '0');
          s.setProperty('--edge', '0');
          return;
        }

        const rest = raw >= 1 && fadeIn >= 1 && Scur - endS[i] > vh * 0.22;
        if (rest) {
          if (!settled[i]) {
            s.transform = 'none';
            s.opacity = '1';
            s.filter = 'none';
            s.zIndex = '1000';
            if (hiEls[i]) hiEls[i].style.transform = 'translate3d(0,100%,0)';
            if (beamEls[i]) beamEls[i].style.opacity = '0';
            s.setProperty('--lock', '0');
            s.setProperty('--edge', '0');
            settled[i] = true;
          }
          return;
        }
        settled[i] = false;
        s.pointerEvents = 'none';

        const phi = i * 0.95 + (1 - u) * 2.4 + Scur * 0.0016 * (1 - u);
        const rad = R0 * Math.pow(1 - u, 0.75);
        const tx = (vcx - inf.cx) * (1 - u) + Math.cos(phi) * rad * 1.15;
        const ty = (vcy - inf.cy) * (1 - u) + Math.sin(phi) * rad * 0.62;
        const tz = -(1 - u) * Z0 + Math.sin(PI * raw) * 90;
        const Rin = mul(rotZ((1 - u) * (phi * 0.5 + 1.4)), mul(rotY(Math.sin(phi) * 0.8 * (1 - u)), rotX(Math.cos(phi) * 0.55 * (1 - u) + (1 - u) * 0.5)));
        const q = fromQuat(slerpToIdentity(toQuat(Rin), u));
        const sc = lerp(0.95, 1, u);
        s.transform = 'matrix3d(' +
          (q[0] * sc).toFixed(5) + ',' + (q[3] * sc).toFixed(5) + ',' + (q[6] * sc).toFixed(5) + ',0,' +
          (q[1] * sc).toFixed(5) + ',' + (q[4] * sc).toFixed(5) + ',' + (q[7] * sc).toFixed(5) + ',0,' +
          q[2].toFixed(5) + ',' + q[5].toFixed(5) + ',' + q[8].toFixed(5) + ',0,' +
          tx.toFixed(2) + ',' + ty.toFixed(2) + ',' + tz.toFixed(2) + ',1)';
        const fog = 0.55 + 0.45 * u;
        s.opacity = (fadeIn * fog).toFixed(3);
        const ca = (1 - u) * 7;
        s.filter = !TOUCH && (1 - u) > 0.02
          ? `drop-shadow(${(-ca).toFixed(1)}px 0 0 rgba(232,109,34,.65)) drop-shadow(${ca.toFixed(1)}px 0 0 rgba(247,248,247,.45))`
          : 'none';
        s.zIndex = String(1000 + Math.round(tz));

        const lock = clamp((raw - 0.6) / 0.18, 0, 1) * (1 - clamp((Scur - endS[i]) / (vh * 0.22), 0, 1));
        s.setProperty('--lock', lock.toFixed(3));
        if (hiEls[i]) hiEls[i].style.transform = `translate3d(0,${(m * 100).toFixed(2)}%,0)`;
        if (beamEls[i]) {
          beamEls[i].style.transform = `translate3d(0,${(m * inf.h).toFixed(1)}px,0)`;
          beamEls[i].style.opacity = (m > 0 && m < 1 ? Math.min(1, Math.sin(PI * m) * 2.2) : 0).toFixed(3);
        }
        s.setProperty('--edge', clamp(0.75 * (1 - raw) + 0.5 * Math.sin(PI * clamp(raw * 1.1, 0, 1)) + 0.6 * lock, 0, 1).toFixed(3));
      });

      const hudOn = clamp(P * 9, 0, 1) * (1 - clamp((P - 0.42) / 0.3, 0, 1));
      if (hud) hud.style.opacity = hudOn.toFixed(3);
      if (aura) aura.style.opacity = (clamp(P * 6, 0, 1) * (1 - clamp((P - 0.6) / 0.35, 0, 1))).toFixed(3);
      if (r1) r1.style.transform = `rotate(${(P * 540).toFixed(1)}deg)`;
      if (r2) r2.style.transform = `rotate(${(-P * 900).toFixed(1)}deg)`;
      if (locked !== lastLocked || scanNow !== lastScan) {
        lastLocked = locked;
        lastScan = scanNow;
        if (t1) t1.textContent = locked >= N ? 'ALL CREW LOCKED' : (scanNow ? `SCANNING · ${scanNow.toUpperCase()}` : 'SCANNING');
        if (t2) t2.textContent = `CREW LOCKED ${pad(locked)} / ${pad(N)}`;
      }
      if (pct) pct.textContent = `00${Math.round(P * 100)}`.slice(-3) + '%';
      if (bar) bar.style.transform = `scaleX(${P.toFixed(4)})`;

      if (work) {
        idle = 0;
        raf = window.requestAnimationFrame(frame);
      } else if (++idle < 12) raf = window.requestAnimationFrame(frame);
      else running = false;
    };

    const wake = () => {
      if (!running) {
        running = true;
        idle = 0;
        raf = window.requestAnimationFrame(frame);
      }
    };
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        measure();
        wake();
      }, 120);
    };
    const pointerHandlers = cards.map((c, i) => {
      const move = (e: PointerEvent) => {
        const r = c.getBoundingClientRect();
        hov[i].try_ = ((e.clientX - r.left) / r.width - 0.5) * 12;
        hov[i].trx = (0.5 - (e.clientY - r.top) / r.height) * 12;
        wake();
      };
      const leave = () => {
        hov[i].trx = 0;
        hov[i].try_ = 0;
        wake();
      };
      if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
        c.addEventListener('pointermove', move);
        c.addEventListener('pointerleave', leave);
      }
      return { move, leave };
    });

    measure();
    wake();
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', onResize);
    const bootTimer = window.setTimeout(() => {
      measure();
      wake();
    }, 300);

    return () => {
      window.clearTimeout(bootTimer);
      window.clearTimeout(resizeTimer);
      window.cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', onResize);
      cards.forEach((c, i) => {
        c.removeEventListener('pointermove', pointerHandlers[i].move);
        c.removeEventListener('pointerleave', pointerHandlers[i].leave);
        c.style.transform = '';
        c.style.opacity = '';
        c.style.visibility = '';
        c.style.filter = '';
        c.style.pointerEvents = '';
        c.style.zIndex = '';
      });
      grid.style.perspective = '';
      grid.style.perspectiveOrigin = '';
      spacer.style.height = '0px';
    };
  }, [N]);

  return (
    <section id="team" ref={rootRef} className="awz-warp" aria-label="Meet the AR VR XR team">
      <style>{CSS}</style>

      <div className="awz-aura" ref={auraRef} aria-hidden="true" />
      <div className="awz-bar" ref={barRef} aria-hidden="true" />
      <div className="awz-hud" ref={hudRef} aria-hidden="true">
        <div className="awz-ret">
          <svg viewBox="-110 -110 220 220" fill="none" stroke="currentColor" strokeWidth="1.5">
            <g className="r1" ref={r1Ref}>
              <circle r="100" strokeDasharray="4 10" opacity=".7" />
            </g>
            <g className="r2" ref={r2Ref}>
              <circle r="78" strokeDasharray="46 20" opacity=".9" />
              <path d="M0-108v14M0 94v14M-108 0h14M94 0h14" />
            </g>
            <circle r="3" fill="currentColor" />
          </svg>
        </div>
        <div className="t" style={{ top: 'calc(50% + 138px)' }} ref={t1Ref}>
          SCANNING
        </div>
        <div className="t" style={{ top: 'calc(50% + 158px)', opacity: 0.7 }} ref={t2Ref} />
        <div className="tl">AWGZO · CREW SCAN</div>
        <div className="tr" ref={pctRef}>
          000%
        </div>
      </div>

      <div className="intro">
        <span className="kick">04 · The crew / no superheroes</span>
        <h2>
          Meet the <em>AR VR XR</em> Team
        </h2>
        <p>Seven specialists, one studio. Scroll — the crew warps in through the scanner tunnel and locks on one by one.</p>
      </div>

      <div className="awz-spacer" ref={spacerRef} aria-hidden="true" />
      <div className="grid" ref={gridRef}>
        {members.map((m, i) => (
          <article
            className={`tcard awz-card c${i + 1}${i === 0 ? ' lead' : ''}`}
            data-name={m.name}
            key={m.id}
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            <div className="ph">
              {i === 0 && <em className="tag">Founder &amp; CEO</em>}
              {m.image ? (
                <>
                  <div className="ph-fill" style={{ backgroundImage: `url("${m.image}")` }} />
                  <img src={m.image} alt={m.name} decoding="async" draggable={false} />
                </>
              ) : (
                <>
                  <span className="ti">{initials(m.name)}</span>
                  <span className="orb" />
                </>
              )}
              <u /><u /><u /><u />
            </div>
            <div className="awz-holo" aria-hidden="true"><i /></div>
            <div className="awz-beam" aria-hidden="true" />
            <div className="body">
              <small>{pad(i + 1)} / {pad(N)}</small>
              <h3>{m.name}</h3>
              <div className="role">{m.role}</div>
              <p>{m.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
