import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { getTeamMembers } from '../../data/team';
import { useReality } from '../../context/RealityContext';
import { gsap, registerMotionPlugins, ScrollTrigger } from '../../lib/scroll';

/* "Meet the AR VR XR Team" - 3 second line scroll. Used on the Home page and the About page. */
const CSS = `
/* ═════════ AWGZO TEAM · 3 SECOND LINE SCROLL ═════════ */
.awz-line{height:100vh;height:100svh;--o:#e86d22;--o2:#ff9a55;--ar:232,109,34;--mute:#a7afb3;position:relative;background:#080808;color:#f7f8f7;font-family:var(--font-sans);overflow:hidden}
.awz-line *{box-sizing:border-box}
.awz-line .stage{position:relative;height:100%;display:flex;flex-direction:column;padding:clamp(18px,3.2vh,32px) 0 clamp(14px,2.4vh,26px)}
.awz-line .stage::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(55% 50% at 50% 55%,rgba(var(--ar),.12),transparent 70%),repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 1px,transparent 1px 56px),repeating-linear-gradient(90deg,rgba(255,255,255,.02) 0 1px,transparent 1px 56px)}
.awz-line .hd{position:relative;flex:none;padding:0 clamp(16px,4vw,64px);display:flex;justify-content:space-between;align-items:flex-end;gap:20px}
.awz-line .kick{font:500 .74rem var(--font-mono);letter-spacing:.26em;color:var(--o);text-transform:uppercase}
.awz-line h2{margin:8px 0 0;font:600 clamp(1.8rem,3.4vw,3.2rem)/1.04 var(--font-display);letter-spacing:-.02em}
.awz-line h2 em{font-style:normal;color:var(--o)}
.awz-line .sub{margin:8px 0 0;max-width:56ch;color:var(--mute);font-size:clamp(.8rem,.95vw,.94rem);line-height:1.5}
.awz-line .hud{text-align:right;flex:none}
.awz-line .hud b{display:block;font:700 clamp(2.2rem,4vw,3.8rem)/.85 var(--font-display);color:transparent;-webkit-text-stroke:1.5px var(--o);letter-spacing:-.03em}
.awz-line .hud b em{font-style:normal;font-size:.36em;-webkit-text-stroke:0;color:#555;margin-left:.35em;letter-spacing:0}
.awz-line .hud span{display:block;margin-top:8px;font:500 .68rem var(--font-mono);letter-spacing:.22em;color:#8d9498;text-transform:uppercase;white-space:nowrap}
.awz-line .hud span i{font-style:normal;color:var(--o)}

/* horizontal line of cards */
.awz-line .view{position:relative;flex:1;min-height:0;display:flex;align-items:center;overflow:hidden}
.awz-line .track{--card-w:min(72vw,440px);display:flex;gap:clamp(14px,2.5vw,32px);padding:0 calc(50vw - var(--card-w)/2);width:max-content;will-change:transform;transform:translateX(var(--x,0px))}
.awz-line .card{position:relative;flex:none;width:var(--card-w);height:min(54vh,430px);border-radius:24px;overflow:hidden;background:linear-gradient(180deg,#202020,#0d0d0d);border:1px solid rgba(var(--ar),.28);box-shadow:0 24px 70px rgba(0,0,0,.5);transform:scale(var(--s,.92));opacity:var(--o,.7);will-change:transform,opacity}
.awz-line .card.on{border-color:var(--o);box-shadow:0 24px 70px rgba(0,0,0,.5),0 0 0 1px var(--o),0 0 46px rgba(var(--ar),.28)}
.awz-line .card .pbg{position:absolute;inset:0;overflow:hidden;background:radial-gradient(80% 70% at 50% 100%,rgba(var(--ar),.45),transparent 70%),linear-gradient(180deg,#1c1c1c,#0e0e0e)}
.awz-line .card .pbg::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(var(--ar),.08) 0 1px,transparent 1px 18px),repeating-linear-gradient(90deg,rgba(var(--ar),.08) 0 1px,transparent 1px 18px)}
.awz-line .card .pbg-fill{position:absolute;inset:-8%;background-image:var(--pbg-img);background-size:cover;background-position:center;filter:blur(26px) brightness(.55);opacity:.78;transform:scale(1.06)}
.awz-line .card .pbg img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom}
.awz-line .card .pbg svg{position:absolute;left:50%;bottom:-2px;width:min(78%,420px);min-width:150px;transform:translateX(-50%);fill:url(#awsG)}
.awz-line .card .pbg b{position:absolute;left:50%;top:13%;transform:translateX(-50%);font:700 clamp(3.4rem,8vw,7rem)/1 var(--font-display);color:rgba(255,255,255,.07);letter-spacing:-.04em}
.awz-line .card::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,rgba(8,8,8,.97) 0%,rgba(8,8,8,.62) 46%,transparent 78%)}
.awz-line .card .ix{position:absolute;z-index:2;left:22px;top:20px;font:500 .74rem var(--font-mono);letter-spacing:.16em;color:var(--o)}
.awz-line .card .st{position:absolute;z-index:2;right:20px;top:20px;display:flex;align-items:center;gap:8px;font:500 .64rem var(--font-mono);letter-spacing:.2em;color:var(--o);white-space:nowrap}
.awz-line .card .st::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--o);box-shadow:0 0 10px var(--o)}
.awz-line .card.on .st::before{animation:awsBl 1.1s steps(2) infinite}
@keyframes awsBl{50%{opacity:.2}}
.awz-line .card .body{position:absolute;z-index:3;left:0;right:0;bottom:0;padding:22px 24px}
.awz-line .card .tg{font:500 .68rem var(--font-mono);letter-spacing:.2em;color:var(--o);text-transform:uppercase}
.awz-line .card .nm{margin:8px 0 4px;font:600 clamp(1.7rem,3vw,2.6rem)/1 var(--font-display);letter-spacing:-.02em}
.awz-line .card .rl{margin:0 0 10px;color:var(--o2);font-size:.84rem;line-height:1.45}
.awz-line .card .ds{margin:0 0 16px;max-width:44ch;color:#c4c9cb;font-size:.86rem;line-height:1.55}
.awz-line .card .lk{display:flex;gap:8px;flex-wrap:wrap}
.awz-line .card .lk a{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid rgba(255,255,255,.2);border-radius:99px;background:rgba(0,0,0,.45);color:#fff;text-decoration:none;font:500 .78rem var(--font-display);transition:.2s}
.awz-line .card .lk a:hover,.awz-line .card .lk a:focus-visible{border-color:var(--o);background:rgba(var(--ar),.25);outline:none}
.awz-line .card .lk svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}

/* the line: progress fill, member dots and the moving head */
.awz-line .prog{position:relative;flex:none;height:3px;margin:clamp(14px,2.2vh,24px) clamp(16px,8vw,120px) 0;border-radius:3px;background:rgba(255,255,255,.16)}
.awz-line .prog i{position:absolute;left:0;top:0;height:100%;width:100%;border-radius:3px;background:linear-gradient(90deg,#a8470c,var(--o),#ffb27a);box-shadow:0 0 16px rgba(var(--ar),.7);transform-origin:left;transform:scaleX(var(--sp,0))}
.awz-line .prog .dot{position:absolute;top:50%;left:calc(var(--i,0)*100%);width:13px;height:13px;margin:-6.5px 0 0 -6.5px;padding:0;border-radius:50%;background:#080808;border:2px solid rgba(255,255,255,.3);cursor:pointer;transition:border-color .2s,background .2s,box-shadow .2s}
.awz-line .prog .dot:hover,.awz-line .prog .dot.on{border-color:var(--o);background:var(--o)}
.awz-line .prog .dot.cur{box-shadow:0 0 0 5px rgba(var(--ar),.25)}
.awz-line .prog s{position:absolute;top:50%;left:calc(var(--sp,0)*100%);width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:3px solid var(--o);background:#080808;box-shadow:0 0 0 6px rgba(var(--ar),.2);pointer-events:none}

/* 3 second controller */
.awz-line .awz-ctrl{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:30;transform:translateX(-50%) translateY(18px);display:flex;align-items:center;gap:14px;padding:8px 10px 8px 20px;border-radius:999px;background:rgba(8,8,8,.94);border:2px solid var(--o);box-shadow:0 12px 40px rgba(0,0,0,.65);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s}
.awz-line .awz-ctrl.show{opacity:1;pointer-events:auto;transform:translateX(-50%) translateY(0)}
.awz-line .awz-t{font:700 1.25rem var(--font-mono);font-variant-numeric:tabular-nums;min-width:3.6ch;color:var(--o2)}
.awz-line .awz-go{font:700 .82rem var(--font-display);cursor:pointer;border:0;background:var(--o);color:#fff;padding:11px 20px;border-radius:999px}
.awz-line .awz-go:hover,.awz-line .awz-go:focus-visible{background:var(--o2);color:#1a0b02;outline:none}

@media (max-width:720px){
  .awz-line .sub{display:none}
  .awz-line .hd{align-items:flex-start}
  .awz-line .hud span{display:none}
  .awz-line .hud b{font-size:2.4rem}
  .awz-line .track{--card-w:78vw;gap:12px}
  .awz-line .card{height:min(52vh,400px);border-radius:18px}
  .awz-line .card .body{padding:16px 18px}
  .awz-line .card .nm{font-size:1.6rem}
  .awz-line .card .ds{font-size:.78rem;line-height:1.45;max-height:3.2em;overflow:hidden}
  .awz-line .card .lk a{padding:7px 12px;font-size:.72rem}
  .awz-line .prog{margin-inline:16px}
  .awz-line .awz-t{font-size:1rem}
  .awz-line .awz-go{padding:10px 16px;font-size:.74rem}
}
@media (prefers-reduced-motion:reduce){
  .awz-line .view{overflow-x:auto}
  .awz-line .track{transform:none!important}
  .awz-line .card{transform:none;opacity:1}
  .awz-line .awz-ctrl{display:none}
  .awz-line .card.on .st::before{animation:none}
}
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
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);

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
    const track = $<HTMLElement>('.track');
    const prog = $<HTMLElement>('.prog');
    const cnt = $<HTMLElement>('.cnt');
    const cn = $<HTMLElement>('.cn');
    const ctrl = $<HTMLElement>('.awz-ctrl');
    const btn = btnRef.current;
    const time = timeRef.current;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.card'));
    const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('.dot'));
    const links = cards.map((c) => Array.from(c.querySelectorAll<HTMLAnchorElement>('a')));

    let dist = 0;
    let rmP = 0;
    let cur = -1;
    let auto: ReturnType<typeof gsap.to> | null = null;
    let running = false;

    const measure = () => {
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
    };

    const trigger = RM
      ? null
      : ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 3.2)}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onToggle: (self) => ctrl.classList.toggle('show', self.isActive),
        });

    const pOf = () => (RM || !trigger ? rmP : clamp(trigger.progress, 0, 1));

    const frame = () => {
      const p = pOf();
      if (!RM) track.style.setProperty('--x', `${(-p * dist).toFixed(1)}px`);
      prog.style.setProperty('--sp', p.toFixed(4));
      const vw = window.innerWidth;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.min(1, Math.abs(r.left + r.width / 2 - vw / 2) / (vw * 0.62));
        c.style.setProperty('--s', (1 - d * 0.12).toFixed(3));
        c.style.setProperty('--o', (1 - d * 0.45).toFixed(3));
        dots[i].classList.toggle('on', p >= i / M - 0.001);
      });
      const a = Math.round(p * M);
      if (a !== cur) {
        cur = a;
        cnt.textContent = pad(a + 1);
        cn.textContent = members[a].name;
        cards.forEach((c, i) => {
          c.classList.toggle('on', i === a);
          links[i].forEach((l) => (l.tabIndex = i === a ? 0 : -1));
        });
        dots.forEach((d, i) => d.classList.toggle('cur', i === a));
      }
    };

    const stopAuto = () => {
      auto?.kill();
      auto = null;
      running = false;
      if (btn) btn.textContent = 'Scroll in 3 seconds';
    };
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const runAuto = () => {
      if (RM || !trigger || !btn) {
        window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY + root.offsetHeight, behavior: 'smooth' });
        return;
      }
      const from = window.scrollY;
      const to = from >= trigger.end - 4 ? trigger.start : trigger.end;
      stopAuto();
      running = true;
      btn.textContent = 'Stop';
      if (time) time.textContent = '0.00s';
      auto = gsap.to(window, {
        scrollTo: { y: to, autoKill: false },
        duration: 3,
        ease,
        onUpdate: () => {
          if (auto && time) time.textContent = `${(auto.progress() * 3).toFixed(2)}s`;
        },
        onComplete: () => {
          if (time) time.textContent = '3.00s';
          stopAuto();
        },
      });
    };
    const onBtn = () => (running ? stopAuto() : runAuto());
    const onStop = () => {
      if (running) stopAuto();
    };
    const onKeyStop = (e: KeyboardEvent) => {
      if (e.target !== btn) onStop();
    };
    const goDot = (i: number) => {
      stopAuto();
      if (RM || !trigger) {
        cards[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        return;
      }
      const y = trigger.start + (i / M) * (trigger.end - trigger.start);
      gsap.to(window, { scrollTo: { y, autoKill: false }, duration: 0.7, ease: 'power2.inOut', overwrite: true });
    };
    const dotFns = dots.map((d, i) => {
      const fn = () => goDot(i);
      d.addEventListener('click', fn);
      return fn;
    });

    btn?.addEventListener('click', onBtn);
    window.addEventListener('wheel', onStop, { passive: true });
    window.addEventListener('touchstart', onStop, { passive: true });
    window.addEventListener('keydown', onKeyStop);
    window.addEventListener('resize', measure);
    measure();
    gsap.ticker.add(frame);
    frame();

    const refreshTimer = window.setTimeout(() => {
      measure();
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(frame);
      stopAuto();
      btn?.removeEventListener('click', onBtn);
      window.removeEventListener('wheel', onStop);
      window.removeEventListener('touchstart', onStop);
      window.removeEventListener('keydown', onKeyStop);
      window.removeEventListener('resize', measure);
      dots.forEach((d, i) => d.removeEventListener('click', dotFns[i]));
      trigger?.kill();
    };
  }, [members, M]);

  return (
    <section id="team" ref={rootRef} className="awz-line" aria-label="Meet the AR VR XR team">
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
              Seven specialists, one studio. Scroll — the crew slides in a line, or hit the button for a 3-second run.
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

        <div className="view">
          <div className="track">
            {members.map((m, i) => (
              <article className="card" data-i={i} key={m.id}>
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
                    <img src={m.image} alt={m.name} decoding="async" draggable={false} />
                  ) : (
                    <Silhouette />
                  )}
                </div>
                <span className="ix">{pad(i + 1)}</span>
                <span className="st">STANDBY</span>
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
        </div>

        <div className="prog" aria-hidden="true">
          <i />
          {members.map((m, i) => (
            <button
              type="button"
              className="dot"
              key={m.id}
              style={{ '--i': i / M } as CSSProperties}
              aria-label={`Go to ${m.name}`}
              tabIndex={-1}
            />
          ))}
          <s />
        </div>
      </div>

      <div className="awz-ctrl">
        <span className="awz-t" ref={timeRef}>
          0.00s
        </span>
        <button className="awz-go" type="button" ref={btnRef}>
          Scroll in 3 seconds
        </button>
      </div>
    </section>
  );
}
