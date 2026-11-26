import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { getTeamMembers } from '../../data/team';
import { useReality } from '../../context/RealityContext';
import { gsap, registerMotionPlugins, ScrollTrigger } from '../../lib/scroll';

/* "Meet the AR VR XR Team" - scroll / drag scrubber. Used on the Home page and the About page. */
const CSS = `
/* ═════════ AWGZO TEAM · SCRUBBER ═════════ */
.awz-scrub{height:100vh;height:100svh;--o:#e86d22;--o2:#ff9a55;--ar:232,109,34;--mute:#a7afb3;position:relative;background:#080808;color:#f7f8f7;font-family:var(--font-sans)}
.awz-scrub *{box-sizing:border-box}
.awz-scrub .stage{position:relative;height:100%;overflow:hidden;display:flex;flex-direction:column;padding:clamp(18px,3.4vh,34px) clamp(16px,4vw,64px) clamp(12px,2.4vh,24px)}
.awz-scrub .stage::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(55% 50% at 50% 55%,rgba(var(--ar),.12),transparent 70%),repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 1px,transparent 1px 56px),repeating-linear-gradient(90deg,rgba(255,255,255,.02) 0 1px,transparent 1px 56px)}
.awz-scrub .hd{position:relative;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex:none}
.awz-scrub .kick{font:500 .74rem var(--font-mono);letter-spacing:.26em;color:var(--o);text-transform:uppercase}
.awz-scrub h2{margin:8px 0 0;font:600 clamp(2rem,3.9vw,3.6rem)/1.04 var(--font-display);letter-spacing:-.02em}
.awz-scrub h2 em{font-style:normal;color:var(--o)}
.awz-scrub .sub{margin:8px 0 0;max-width:54ch;color:var(--mute);font-size:clamp(.82rem,1vw,.96rem);line-height:1.55}
.awz-scrub .hud{text-align:right;flex:none}
.awz-scrub .hud b{display:block;font:700 clamp(2.6rem,5vw,4.6rem)/.85 var(--font-display);color:transparent;-webkit-text-stroke:1.5px var(--o);letter-spacing:-.03em}
.awz-scrub .hud b em{font-style:normal;font-size:.36em;-webkit-text-stroke:0;color:#555;margin-left:.35em;letter-spacing:0}
.awz-scrub .hud span{display:block;margin-top:8px;font:500 .68rem var(--font-mono);letter-spacing:.22em;color:#8d9498;text-transform:uppercase;white-space:nowrap}
.awz-scrub .hud span i{font-style:normal;color:var(--o)}

/* liquid accordion */
.awz-scrub .lane{position:relative;flex:1;min-height:0;display:flex;gap:10px;margin-top:clamp(14px,2.6vh,26px)}
.awz-scrub .pn{position:relative;flex:1 1 0;min-width:0;border-radius:18px;overflow:hidden;cursor:pointer;background:#101010;border:1px solid rgba(var(--ar),calc(.12 + var(--w,0)*.5));box-shadow:0 0 calc(var(--w,0)*56px) rgba(var(--ar),calc(var(--w,0)*.26))}
.awz-scrub .pn.on{cursor:default}
.awz-scrub .pbg{position:absolute;inset:0;overflow:hidden;background:radial-gradient(80% 70% at 50% 100%,rgba(var(--ar),.45),transparent 70%),linear-gradient(180deg,#1c1c1c,#0e0e0e);filter:grayscale(calc(1 - var(--w,0))) brightness(calc(.42 + var(--v,0)*.2 + var(--w,0)*.38));transform:scale(calc(1.1 - var(--w,0)*.1))}
.awz-scrub .pbg::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(var(--ar),.08) 0 1px,transparent 1px 18px),repeating-linear-gradient(90deg,rgba(var(--ar),.08) 0 1px,transparent 1px 18px)}
.awz-scrub .pbg-fill{position:absolute;inset:-8%;background-image:var(--pbg-img);background-size:cover;background-position:center;filter:blur(26px) brightness(.55);opacity:.78;transform:scale(1.06)}
.awz-scrub .pbg img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom}
.awz-scrub .pbg svg{position:absolute;left:50%;bottom:-2px;width:min(78%,420px);min-width:150px;transform:translateX(-50%);fill:url(#awsG)}
.awz-scrub .pbg b{position:absolute;left:50%;top:14%;transform:translateX(-50%);font:700 clamp(3.4rem,8vw,7rem)/1 var(--font-display);color:rgba(255,255,255,.07);letter-spacing:-.04em}
.awz-scrub .pn::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(8,8,8,.94));opacity:var(--w,0);pointer-events:none}
.awz-scrub .ix{position:absolute;z-index:2;left:50%;top:16px;transform:translateX(-50%);font:500 .74rem var(--font-mono);letter-spacing:.16em;color:var(--o)}
.awz-scrub .vt{position:absolute;z-index:2;left:50%;bottom:20px;transform:translateX(-50%) rotate(180deg);writing-mode:vertical-rl;white-space:nowrap;font:600 1.05rem var(--font-display);letter-spacing:.16em;text-transform:uppercase;opacity:calc(1 - var(--w,0)*2.2);color:#e9ecec}
.awz-scrub .st{position:absolute;z-index:2;right:16px;top:16px;display:flex;align-items:center;gap:8px;font:500 .64rem var(--font-mono);letter-spacing:.2em;color:var(--o);opacity:calc((var(--w,0) - .4)*2);white-space:nowrap}
.awz-scrub .st::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--o);box-shadow:0 0 10px var(--o)}
.awz-scrub .pn.on .st::before{animation:awsBl 1.1s steps(2) infinite}
@keyframes awsBl{50%{opacity:.2}}
.awz-scrub .body{position:absolute;z-index:4;left:0;bottom:0;width:100%;min-width:370px;padding:clamp(18px,2.2vw,32px);opacity:calc((var(--w,0) - .35)*1.8);transform:translateY(calc((1 - var(--w,0))*18px))}
.awz-scrub .tg{font:500 .68rem var(--font-mono);letter-spacing:.2em;color:var(--o);text-transform:uppercase}
.awz-scrub .nm{margin:8px 0 4px;font:600 clamp(1.9rem,3.2vw,3rem)/1 var(--font-display);letter-spacing:-.02em}
.awz-scrub .rl{margin:0 0 10px;color:var(--o2);font-size:.86rem;line-height:1.45}
.awz-scrub .ds{margin:0 0 16px;max-width:44ch;color:#c4c9cb;font-size:.9rem;line-height:1.6}
.awz-scrub .lk{display:flex;gap:8px;flex-wrap:wrap}
.awz-scrub .lk a{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid rgba(255,255,255,.2);border-radius:99px;background:rgba(0,0,0,.35);color:#fff;text-decoration:none;font:500 .78rem var(--font-display);transition:.2s}
.awz-scrub .lk a:hover,.awz-scrub .lk a:focus-visible{border-color:var(--o);background:rgba(var(--ar),.25);outline:none}
.awz-scrub .lk svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}

/* the scrollbar: ruler + nodes + draggable scanner head */
.awz-scrub .rail{position:relative;flex:none;margin-top:clamp(12px,2.2vh,22px)}
.awz-scrub .hint{font:500 .66rem var(--font-mono);letter-spacing:.22em;color:var(--o);text-transform:uppercase;margin:0 0 8px;transition:opacity .4s;animation:awsBl 1.6s steps(2) infinite}
.awz-scrub .rl2{position:relative;height:78px;margin:0 28px;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none;outline:none}
.awz-scrub .rl2.drag{cursor:grabbing}
.awz-scrub .rl2:focus-visible .thumb{outline:2px solid #fff;outline-offset:4px}
.awz-scrub .ruler{position:absolute;left:0;right:0;top:20px;height:9px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.22) 0 1px,transparent 1px calc(100%/36))}
.awz-scrub .track{position:absolute;left:0;right:0;top:32px;height:4px;border-radius:4px;background:rgba(255,255,255,.12)}
.awz-scrub .fill{height:100%;border-radius:4px;width:calc(var(--f,0)*100%);background:linear-gradient(90deg,#a8470c,var(--o),#ffb27a);box-shadow:0 0 16px rgba(var(--ar),.8)}
.awz-scrub .nd{position:absolute;top:0;width:0}
.awz-scrub .nd i{position:absolute;left:0;top:29px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:#0c0c0c;border:2px solid rgba(255,255,255,.3);transition:.25s}
.awz-scrub .nd.lit i{background:var(--o);border-color:var(--o);box-shadow:0 0 12px var(--o)}
.awz-scrub .nd s{position:absolute;left:0;top:0;transform:translateX(-50%);text-decoration:none;font:500 .66rem var(--font-mono);letter-spacing:.14em;color:#6e767a;transition:color .25s}
.awz-scrub .nd u{position:absolute;left:0;top:50px;transform:translateX(-50%);text-decoration:none;white-space:nowrap;font:500 .72rem var(--font-display);color:#6e767a;transition:color .25s}
.awz-scrub .nd.lit s,.awz-scrub .nd.lit u{color:#d6dadc}.awz-scrub .nd.cur s,.awz-scrub .nd.cur u{color:var(--o2)}
.awz-scrub .thumb{position:absolute;top:34px;left:calc(var(--f,0)*100%);width:58px;height:30px;margin:-15px 0 0 -29px;border-radius:99px;background:linear-gradient(180deg,#ffa15f,#e86d22);box-shadow:0 0 0 5px rgba(var(--ar),.2),0 8px 28px rgba(var(--ar),.6);display:grid;place-items:center}
.awz-scrub .thumb::before{content:"";width:16px;height:12px;background:repeating-linear-gradient(90deg,rgba(20,8,0,.75) 0 2px,transparent 2px 5px)}
.awz-scrub .thumb::after{content:"";position:absolute;left:50%;bottom:100%;width:2px;height:20px;margin-left:-1px;background:linear-gradient(0deg,var(--o),transparent)}

@media (max-width:720px){
  .awz-scrub .sub{display:none}.awz-scrub .hud span{display:none}
  .awz-scrub .lane{flex-direction:column;gap:0}
  /* one full-height card at a time: the portrait gets the room it needs */
  .awz-scrub .pn{display:none;border-radius:16px}
  .awz-scrub .pn.on{display:block;flex:1 1 auto}
  .awz-scrub .ix{left:14px;top:14px;transform:none;opacity:1}
  .awz-scrub .vt{left:50%;top:8px;bottom:auto;transform:translateX(-50%);writing-mode:horizontal-tb;font-size:.82rem}
  .awz-scrub .st{top:12px;right:12px}
  .awz-scrub .pbg svg{width:min(72%,320px);left:50%;right:auto;top:7%;bottom:auto;transform:translateX(-50%)}
  .awz-scrub .pbg b{top:7%;left:50%;right:auto;transform:translateX(-50%);font-size:clamp(2.6rem,12vw,4rem)}
  .awz-scrub .pn::after{background:linear-gradient(0deg,rgba(8,8,8,.95) 0%,rgba(8,8,8,.5) 45%,transparent 80%)}
  .awz-scrub .body{min-width:0;padding:16px 18px;background:linear-gradient(0deg,rgba(8,8,8,.94) 0%,rgba(8,8,8,.7) 60%,transparent 100%)}
  .awz-scrub .nm{font-size:1.7rem}.awz-scrub .ds{font-size:.8rem;margin-bottom:10px;line-height:1.5}
  .awz-scrub .rl{margin-bottom:6px;font-size:.76rem}.awz-scrub .lk a{padding:7px 13px}
  .awz-scrub .rl2{height:56px;margin:0 16px}.awz-scrub .nd u{display:none}.awz-scrub .nd i{top:29px}.awz-scrub .ruler{top:18px}
}
@media (prefers-reduced-motion:reduce){.awz-scrub *{animation:none!important}}
`;

const pad = (n: number) => (n < 10 ? '0' : '') + n;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase();

const PAD0 = 0.04;
const SPAN = 0.92;

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 9.5h3.6V20H4zM5.8 4a2 2 0 110 4 2 2 0 010-4zM10 9.5h3.4v1.5h.1c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.1 2.3 4.1 5.3V20h-3.6v-4.9c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V20H10z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" />
  </svg>
);
const Silhouette = () => (
  <svg viewBox="0 0 200 150" aria-hidden="true">
    <circle cx="100" cy="58" r="30" />
    <path d="M28 150c0-38 32-60 72-60s72 22 72 60z" />
  </svg>
);

export function Team() {
  const members = useMemo(() => getTeamMembers(), []);
  const N = members.length;
  const M = Math.max(1, N - 1);
  const { setActiveSection, sceneStateRef } = useReality();
  const rootRef = useRef<HTMLElement | null>(null);

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
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [sceneStateRef, setActiveSection]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    registerMotionPlugins();

    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = <T extends Element>(s: string) => root.querySelector(s) as T;
    const rail = $<HTMLElement>('.rl2');
    const hint = $<HTMLElement>('.hint');
    const cnt = $<HTMLElement>('.cnt');
    const cn = $<HTMLElement>('.cn');
    const pns = Array.from(root.querySelectorAll<HTMLElement>('.pn'));
    const sts = pns.map((p) => p.querySelector('.st') as HTMLElement);
    const lks = pns.map((p) => Array.from(p.querySelectorAll<HTMLAnchorElement>('a')));
    const nds = Array.from(root.querySelectorAll<HTMLElement>('.nd'));

    let G = 5.5;
    let fs = 0;
    let rmP = PAD0;
    let cur = -1;
    let inView = false;
    let running = false;
    let drag = false;
    let raf = 0;
    const stTxt = pns.map(() => '');

    const layout = () => {
      G = window.innerWidth < 720 ? 5 : 5.5;
    };

    // pinned like the other scroll sections of the site (the page has overflow-x:hidden, so sticky is not used)
    const trigger = RM
      ? null
      : ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * M * 0.6)}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

    const pOf = () => (RM || !trigger ? rmP : clamp(trigger.progress, 0, 1));

    // f: 0..1 along the rail
    const goF = (f: number, smooth: boolean) => {
      const p = PAD0 + clamp(f, 0, 1) * SPAN;
      if (RM || !trigger) {
        rmP = p;
        return;
      }
      const y = trigger.start + p * (trigger.end - trigger.start);
      if (smooth) gsap.to(window, { scrollTo: { y, autoKill: false }, duration: 0.7, ease: 'power2.inOut', overwrite: true });
      else {
        gsap.killTweensOf(window);
        window.scrollTo({ top: y, behavior: 'auto' });
      }
    };
    const goI = (i: number, smooth: boolean) => goF(clamp(i, 0, N - 1) / M, smooth);

    const frame = () => {
      const f = clamp((pOf() - PAD0) / SPAN, 0, 1);
      fs += (f - fs) * (RM ? 1 : 0.13);
      if (Math.abs(f - fs) < 0.0003) fs = f;
      const pos = fs * M;
      for (let i = 0; i < N; i++) {
        let w = Math.max(0, 1 - Math.abs(pos - i));
        w = w * w * (3 - 2 * w);
        const v = clamp(pos - i + 1, 0, 1);
        const p = pns[i];
        p.style.flexGrow = (1 + G * w).toFixed(3);
        p.style.setProperty('--w', w.toFixed(3));
        p.style.setProperty('--v', v.toFixed(3));
        const t = v < 1 ? 'STANDBY' : w > 0.5 ? 'SCANNING' : 'LOCKED';
        if (t !== stTxt[i]) {
          stTxt[i] = t;
          sts[i].textContent = t;
        }
        nds[i].classList.toggle('lit', pos >= i - 0.02);
      }
      rail.style.setProperty('--f', fs.toFixed(4));
      const a = Math.round(pos);
      if (a !== cur) {
        cur = a;
        cnt.textContent = pad(a + 1);
        cn.textContent = members[a].name;
        rail.setAttribute('aria-valuenow', String(a + 1));
        rail.setAttribute('aria-valuetext', `${pad(a + 1)} ${members[a].name}`);
        pns.forEach((p, i) => {
          p.classList.toggle('on', i === a);
          lks[i].forEach((l) => {
            l.tabIndex = i === a ? 0 : -1;
          });
        });
        nds.forEach((n, i) => n.classList.toggle('cur', i === a));
      }
      hint.style.opacity = f > 0.02 ? '0' : '1';
    };
    const tick = () => {
      if (!inView) {
        running = false;
        return;
      }
      frame();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    // drag the scanner head like a real scrollbar; it snaps to the nearest member on release
    const fx = (e: PointerEvent) => {
      const r = rail.getBoundingClientRect();
      return clamp((e.clientX - r.left) / r.width, 0, 1);
    };
    const onDown = (e: PointerEvent) => {
      drag = true;
      rail.classList.add('drag');
      rail.setPointerCapture(e.pointerId);
      goF(fx(e), false);
    };
    const onMove = (e: PointerEvent) => {
      if (drag) goF(fx(e), false);
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      drag = false;
      rail.classList.remove('drag');
      goI(Math.round(fx(e) * M), true);
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      const a = Math.round(fs * M);
      let n: number | null = null;
      if (k === 'ArrowRight' || k === 'ArrowDown') n = a + 1;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') n = a - 1;
      else if (k === 'Home') n = 0;
      else if (k === 'End') n = N - 1;
      if (n !== null) {
        e.preventDefault();
        goI(n, true);
      }
    };
    rail.addEventListener('pointerdown', onDown);
    rail.addEventListener('pointermove', onMove);
    rail.addEventListener('pointerup', onUp);
    rail.addEventListener('pointercancel', onUp);
    rail.addEventListener('keydown', onKey);
    const clickers = pns.map((p, i) => {
      const fn = (e: MouseEvent) => {
        if ((e.target as Element).closest('a')) return;
        if (!p.classList.contains('on')) goI(i, true);
      };
      p.addEventListener('click', fn);
      return fn;
    });

    window.addEventListener('resize', layout);
    layout();
    frame();

    let io: IntersectionObserver | null = null;
    if (RM) {
      inView = true;
      start();
    } else {
      io = new IntersectionObserver(
        ([entry]) => {
          inView = Boolean(entry?.isIntersecting);
          if (inView) start();
        },
        { rootMargin: '120px' }
      );
      io.observe(root);
    }
    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.clearTimeout(refreshTimer);
      cancelAnimationFrame(raf);
      running = false;
      io?.disconnect();
      window.removeEventListener('resize', layout);
      rail.removeEventListener('pointerdown', onDown);
      rail.removeEventListener('pointermove', onMove);
      rail.removeEventListener('pointerup', onUp);
      rail.removeEventListener('pointercancel', onUp);
      rail.removeEventListener('keydown', onKey);
      pns.forEach((p, i) => p.removeEventListener('click', clickers[i]));
      gsap.killTweensOf(window);
      trigger?.kill();
    };
  }, [members, N, M]);

  return (
    <section
      id="team"
      ref={rootRef}
      className="awz-scrub"
      aria-label="Meet the AR VR XR team"
    >
      <style>{CSS}</style>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="awsG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e86d22" stopOpacity=".6" />
            <stop offset="1" stopColor="#e86d22" stopOpacity=".14" />
          </linearGradient>
        </defs>
      </svg>
      <div className="stage">
        <header className="hd">
          <div>
            <span className="kick">04 · The crew</span>
            <h2>
              Meet the <em>AR VR XR</em> Team
            </h2>
            <p className="sub">
              Seven specialists, one studio. Scroll, or drag the scanner below, to move through the crew.
            </p>
          </div>
          <div className="hud" aria-hidden="true">
            <b>
              <i className="cnt" style={{ fontStyle: 'normal' }}>
                01
              </i>
              <em>/ {pad(N)}</em>
            </b>
            <span>
              Scanning · <i className="cn" />
            </span>
          </div>
        </header>

        <div className="lane">
          {members.map((m, i) => (
            <article className="pn" data-i={i} key={m.id}>
              <div
                className="pbg"
                style={
                  m.image
                    ? ({ '--pbg-img': `url("${m.image}")` } as CSSProperties)
                    : undefined
                }
              >
                {m.image && <div className="pbg-fill" aria-hidden="true" />}
                <b>{initials(m.name)}</b>
                {m.image ? (
                  <>
                    <img
                      src={m.image}
                      alt={m.name}
                      decoding="async"
                      draggable={false}
                    />
                  </>
                ) : (
                  <Silhouette />
                )}
              </div>
              <span className="ix">{pad(i + 1)}</span>
              <span className="st">STANDBY</span>
              <span className="vt">{m.name}</span>
              <div className="body">
                <div className="tg">
                  Node {pad(i + 1)} / {pad(N)}
                  {i ? '' : ' · Founder'}
                </div>
                <h3 className="nm">{m.name}</h3>
                <p className="rl">{m.role}</p>
                <p className="ds">{m.bio}</p>
                <div className="lk">
                  <a href={m.links.linkedin || '#'} target="_blank" rel="noopener noreferrer">
                    <IconLinkedIn />
                    LinkedIn
                  </a>
                  <a href={m.links.instagram || '#'} target="_blank" rel="noopener noreferrer">
                    <IconInstagram />
                    Instagram
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="rail">
          <p className="hint">Scroll or drag the scanner →</p>
          <div
            className="rl2"
            role="slider"
            tabIndex={0}
            aria-label="Team member"
            aria-valuemin={1}
            aria-valuemax={N}
            aria-valuenow={1}
          >
            <div className="ruler" />
            <div className="track">
              <div className="fill" />
            </div>
            {members.map((m, i) => (
              <div className="nd" key={m.id} style={{ left: `${(i / M) * 100}%` }}>
                <s>{pad(i + 1)}</s>
                <i />
                <u>{m.name.split(' ')[0]}</u>
              </div>
            ))}
            <div className="thumb" />
          </div>
        </div>
      </div>
    </section>
  );
}