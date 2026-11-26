import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  ASSISTANT_SECTIONS,
  EXPLAIN_SECONDS,
  MAX_AUDIO_SECONDS,
} from '../../data/assistantScripts';
import { scrollToSection } from '../../lib/scroll';

/**
 * Drop-in 3D talking assistant (sir_model.glb).
 *
 * - Adds one small "i" info button only to the Hero section (the only section listed in
 *   assistantScripts.ts). Cards and other sections have no recording button.
 * - The assistant lives permanently (on every page) in a small "XR / VR" box in the bottom-left corner and
 *   only rotates inside that box. It never moves around the page.
 * - Click "i": the page scrolls to that section and the recording plays (the box glows while
 *   it talks). Click again to stop.
 * - When the Home page opens, the Hero recording starts by itself. Browsers can block sound before
 *   the visitor has touched the page; then it starts on the very first click / tap / key press.
 * - Voice: /audio/<id>.mp3 (ElevenLabs) plays to its end; if missing, browser voice reads the script.
 */

const MODEL_URL = '/assets/sir_model.glb';
const ACCENT = 0xe86d22;
/** Set to Math.PI if the model appears to face away from the screen. */
const FRONT_YAW = 0;
const WORDS_PER_SEC = 2.6;
const STYLE_ID = 'awgzo-assistant-style';

const CSS = `
.awgzo-assist-btn{
  position:absolute;top:96px;right:14px;z-index:30;
  width:30px;height:30px;border-radius:9999px;
  display:grid;place-items:center;cursor:pointer;
  border:1px solid rgba(232,109,34,.55);
  background:rgba(16,25,31,.72);color:#e86d22;
  font:italic 700 15px/1 Georgia,'Times New Roman',serif;
  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);
  transition:background .2s,color .2s,transform .2s,box-shadow .2s;
}
.awgzo-assist-btn:hover{transform:scale(1.08);background:rgba(232,109,34,.18)}
.awgzo-assist-btn:focus-visible{outline:2px solid #ee8a52;outline-offset:2px}
.awgzo-assist-btn[aria-pressed="true"]{
  background:#e86d22;color:#10191f;
  box-shadow:0 0 0 4px rgba(232,109,34,.25);
}
.awgzo-assist-btn--card{top:10px;right:10px;width:26px;height:26px;font-size:13px}
.awgzo-assist-btn--br{top:auto;bottom:16px;right:16px}
@media (max-width:640px){
  .awgzo-assist-btn:not(.awgzo-assist-btn--card){top:84px;right:10px;width:28px;height:28px}
}
.awgzo-assist-box{position:fixed;left:24px;bottom:16px;z-index:55;pointer-events:none}
.awgzo-assist-box::before{
  content:"";position:absolute;left:-12px;bottom:-12px;width:30px;height:30px;
  border-left:1px solid rgba(232,109,34,.55);border-bottom:1px solid rgba(232,109,34,.55);
}
.awgzo-assist-frame{
  position:relative;width:100%;height:100%;overflow:hidden;border-radius:22px;
  border:1px solid rgba(232,109,34,.6);
  background:radial-gradient(120% 90% at 50% 30%,rgba(232,109,34,.16),rgba(16,25,31,.94) 70%),#10191f;
  box-shadow:0 10px 30px rgba(16,25,31,.55);
  transition:box-shadow .3s ease,border-color .3s ease;
}
.awgzo-assist-box.is-speaking .awgzo-assist-frame{
  border-color:#e86d22;box-shadow:0 0 0 3px rgba(232,109,34,.2),0 0 26px rgba(232,109,34,.4);
}
.awgzo-assist-label{
  position:absolute;left:0;right:0;bottom:9px;text-align:center;
  font:600 10px/1 ui-monospace,'JetBrains Mono',Menlo,Consolas,monospace;
  letter-spacing:.28em;text-indent:.28em;color:#e86d22;
}
@media (max-width:640px){
  .awgzo-assist-box{left:16px;bottom:12px}
  .awgzo-assist-frame{border-radius:18px}
  .awgzo-assist-label{font-size:8px;bottom:7px}
}
`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export default function SirAssistant({ ready = true }: { ready?: boolean }) {
  const readyRef = useRef(ready);
  const autoRef = useRef<(() => void) | null>(null);

  // the page loader finished: start the Hero recording (once)
  useEffect(() => {
    readyRef.current = ready;
    if (ready) autoRef.current?.();
  }, [ready]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- renderer ----------
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // WebGL unavailable: skip the assistant, site stays untouched
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 640 ? 1.5 : 2));
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.addEventListener('webglcontextlost', (event) => event.preventDefault());
    canvas.style.cssText = 'display:block;opacity:0;transition:opacity .6s ease;';

    // fixed box in the bottom-left corner: [canvas + "XR / VR" label]
    const box = document.createElement('div');
    box.className = 'awgzo-assist-box';
    box.setAttribute('aria-hidden', 'true');
    box.style.display = 'none';
    const frame = document.createElement('div');
    frame.className = 'awgzo-assist-frame';
    const label = document.createElement('span');
    label.className = 'awgzo-assist-label';
    label.textContent = 'XR / VR';
    frame.append(canvas, label);
    box.appendChild(frame);
    document.body.appendChild(box);

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);

    // ---------- scene ----------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

    scene.add(new THREE.HemisphereLight(0xf7f8f7, 0x4b5563, 1.9));
    const key = new THREE.DirectionalLight(0xf7f8f7, 2.8);
    key.position.set(4, 7, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(ACCENT, 1.6);
    rim.position.set(-6, 3, -4);
    scene.add(rim);

    const bot = new THREE.Group();
    const body = new THREE.Group();
    bot.add(body);
    bot.visible = false;
    scene.add(bot);

    let loaded = false;
    let disposed = false;

    const loadModel = (attempt: number) => {
      new GLTFLoader().load(
        MODEL_URL,
        (gltf) => {
          if (disposed) return;
          const model = gltf.scene;
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          model.position.sub(center); // centre on origin

          // normalise to height 1 so on-screen size is easy to control
          const holder = new THREE.Group();
          holder.add(model);
          holder.scale.setScalar(1 / Math.max(size.y, 0.0001));
          model.traverse((o) => {
            o.frustumCulled = false;
          });
          body.add(holder);
          loaded = true;
          bot.visible = true;
          layout(true);
          canvas.style.opacity = '1';
        },
        undefined,
        () => {
          // slow phone / flaky network: try again a couple of times before giving up
          if (!disposed && attempt < 3) window.setTimeout(() => loadModel(attempt + 1), 1500 * attempt);
        }
      );
    };
    loadModel(1);

    // ---------- layout: the assistant lives in a fixed box in the bottom-left corner ----------
    const visH = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

    function layout(_snap = false) {
      void _snap;
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const size = vw < 640 ? 88 : 124;
      box.style.width = `${size}px`;
      box.style.height = `${size}px`;
      renderer.setSize(size, size);
      camera.aspect = 1;
      camera.updateProjectionMatrix();
      // the model is normalised to height 1: fill ~70% of the box and leave room for the label underneath
      bot.scale.setScalar(visH * 0.7);
      bot.position.set(0, visH * 0.09, 0);
    }
    layout(true);

    // ---------- audio / voice ----------
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let freqBins: Uint8Array<ArrayBuffer> | null = null;
    let currentAudio: HTMLAudioElement | null = null;
    let speaking = false;
    let session = 0;
    let activeId: string | null = null;
    let activeBtn: HTMLElement | null = null;
    let pending: { id: string; token: number; since: number } | null = null;
    let startTimer: number | undefined;
    let endTimer: number | undefined;

    const ensureCtx = () => {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === 'suspended') void audioCtx.resume();
      } catch {
        /* ignore */
      }
    };

    const setPressed = (btn: HTMLElement | null) => {
      document.querySelectorAll<HTMLElement>('[data-assistant-trigger]').forEach((b) => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
    };

    const stop = () => {
      session += 1;
      window.clearTimeout(startTimer);
      window.clearTimeout(endTimer);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeAttribute('src');
        currentAudio = null;
      }
      try {
        window.speechSynthesis?.cancel();
      } catch {
        /* ignore */
      }
      analyser = null;
      freqBins = null;
      speaking = false;
      activeId = null;
      activeBtn = null;
      pending = null;
      setPressed(null);
    };

    const speakFallback = (text: string, token: number) => {
      const synth = window.speechSynthesis;
      if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
        speaking = true; // still animate for the window
        return;
      }
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      const words = text.split(/\s+/).length;
      u.rate = clamp(words / WORDS_PER_SEC / (EXPLAIN_SECONDS - 1), 0.85, 1.3);
      u.onstart = () => {
        if (token === session) speaking = true;
      };
      u.onend = u.onerror = () => {
        if (token === session) speaking = false;
      };
      synth.speak(u);
    };

    // ---------- automatic Hero recording on page open ----------
    const GESTURES = ['pointerup', 'touchend', 'keydown', 'click'] as const;
    let gestureArmed = false;
    let autoDone = false;

    const startHeroNow = (auto: boolean) => {
      inject(); // make sure the Hero "i" button exists
      const hero = document.getElementById('hero');
      if (!hero || disposed) return false;
      const btn = hero.querySelector<HTMLElement>(':scope > [data-assistant-trigger]');
      stop();
      if (!auto) ensureCtx();
      activeId = 'hero';
      activeBtn = btn;
      setPressed(btn);
      begin('hero', session, auto);
      return true;
    };

    const onFirstGesture = (e: Event) => {
      // the "i" button handles its own click
      if ((e.target as Element | null)?.closest?.('[data-assistant-trigger]')) return;
      if (e instanceof KeyboardEvent && e.key === 'Escape') return;
      disarmGesture();
      if (!activeId) startHeroNow(false);
    };
    function armGesture() {
      if (gestureArmed || disposed) return;
      gestureArmed = true;
      GESTURES.forEach((g) => window.addEventListener(g, onFirstGesture, true));
    }
    function disarmGesture() {
      if (!gestureArmed) return;
      gestureArmed = false;
      GESTURES.forEach((g) => window.removeEventListener(g, onFirstGesture, true));
    }

    const runAuto = () => {
      if (autoDone || disposed || !readyRef.current) return;
      autoDone = true;
      // only when the Hero section is on screen (Home page); wait a moment for it to mount
      let tries = 0;
      const attempt = () => {
        if (disposed) return;
        if (document.getElementById('hero')) {
          if (!activeId) startHeroNow(true);
        } else if (tries++ < 20) {
          window.setTimeout(attempt, 150);
        }
      };
      attempt();
    };
    autoRef.current = runAuto;

    const scriptFor = (id: string): { script: string; audioUrl?: string } | null => {
      const sec = ASSISTANT_SECTIONS.find((x) => x.id === id);
      return sec ?? null;
    };

    const armEnd = (token: number, ms: number) => {
      window.clearTimeout(endTimer);
      endTimer = window.setTimeout(() => {
        if (token === session) stop();
      }, ms);
    };

    const begin = (id: string, token: number, auto = false) => {
      if (token !== session) return;
      const cfg = scriptFor(id);
      if (!cfg) return;

      // recorded voice plays to its end; this is only a safety limit
      armEnd(token, MAX_AUDIO_SECONDS * 1000);

      let fellBack = false;
      const fallback = () => {
        if (fellBack || token !== session) return;
        if (auto) {
          stop(); // automatic start: never fall back to the browser voice
          armGesture(); // Safari/Firefox may report a different autoplay refusal
          return;
        }
        fellBack = true;
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        analyser = null;
        freqBins = null;
        armEnd(token, EXPLAIN_SECONDS * 1000);
        speakFallback(cfg.script, token);
      };

      const audio = new Audio(cfg.audioUrl ?? `/audio/${id}.mp3`);
      audio.preload = 'auto';
      currentAudio = audio;
      audio.addEventListener('error', fallback);
      audio.addEventListener('playing', () => {
        if (token === session && !fellBack) speaking = true;
      });
      audio.addEventListener('ended', () => {
        if (token === session && !fellBack) stop();
      });

      try {
        // automatic start: only route through the analyser when audio is already unlocked, otherwise it would stay silent
        if (audioCtx && (!auto || audioCtx.state === 'running')) {
          const src = audioCtx.createMediaElementSource(audio);
          const an = audioCtx.createAnalyser();
          an.fftSize = 64;
          src.connect(an);
          an.connect(audioCtx.destination);
          analyser = an;
          freqBins = new Uint8Array(new ArrayBuffer(an.frequencyBinCount));
        }
      } catch {
        analyser = null;
        freqBins = null;
      }

      audio.play().catch(() => {
        if (!auto) {
          fallback();
          return;
        }
        // Autoplay with sound is blocked until the visitor interacts. Arm the
        // first gesture fallback for every refusal, not only NotAllowedError.
        if (token === session) stop();
        armGesture();
      });
    };

    // ---------- info buttons ----------
    let hasTargets = false;

    /** Click handler shared by every info button. */
    const trigger = (btn: HTMLElement, sectionId: string, kind: 'section' | 'card', resolve?: () => string | null) => {
      const id = resolve ? resolve() : (btn.dataset.assistantId ?? null);
      if (!id) return;

      if (activeBtn === btn && activeId === id) {
        stop();
        return;
      }
      disarmGesture(); // the visitor started a recording by hand
      stop();
      ensureCtx(); // unlock audio inside the user gesture
      activeId = id;
      activeBtn = btn;
      setPressed(btn);
      const token = session;
      if (kind === 'section') scrollToSection(sectionId);
      // the assistant stays in its corner box: the recording simply starts
      begin(id, token);
    };

    const addButton = (
      host: HTMLElement,
      sectionId: string,
      kind: 'section' | 'card',
      opts: { id?: string; resolve?: () => string | null; extraClass?: string; label?: string } = {}
    ) => {
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `awgzo-assist-btn${kind === 'card' ? ' awgzo-assist-btn--card' : ''}${
        opts.extraClass ? ` ${opts.extraClass}` : ''
      }`;
      b.dataset.assistantTrigger = kind === 'section' ? sectionId : `${sectionId}-card`;
      if (opts.id) b.dataset.assistantId = opts.id;
      const label = opts.label ?? (kind === 'section' ? 'Explain this section' : 'Explain this card');
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-pressed', 'false');
      b.title = label;
      b.textContent = 'i';
      b.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // never trigger the card underneath (e.g. project page link)
        trigger(b, sectionId, kind, opts.resolve);
      });
      host.appendChild(b);
    };

    const hasBtn = (host: Element | null | undefined) =>
      !!host && !!host.querySelector(':scope > [data-assistant-trigger]');

    const inject = () => {
      let found = 0;
      for (const s of ASSISTANT_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        found += 1;
        if (hasBtn(el)) continue;
        addButton(el, s.id, 'section', { id: s.id });
      }
      hasTargets = found > 0;
      // the assistant box is shown on every page, even where no "i" button exists
      box.style.display = loaded ? 'block' : 'none';
      if (!hasTargets && activeId) stop();
    };

    let injectQueued = false;
    const queueInject = () => {
      if (injectQueued) return;
      injectQueued = true;
      requestAnimationFrame(() => {
        injectQueued = false;
        if (!disposed) inject();
      });
    };
    inject();
    const mo = new MutationObserver(queueInject);
    mo.observe(document.body, { childList: true, subtree: true });
    runAuto(); // no-op until the loader is done (see the `ready` prop)

    const onResize = () => {
      layout();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // ---------- animation ----------
    let raf = 0;
    let last = performance.now();
    let level = 0;
    let spin = FRONT_YAW + 0.35;
    const TAU = Math.PI * 2;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      if (!loaded) return;
      if (box.style.display === 'none') box.style.display = 'block';
      if (activeId && activeBtn && !activeBtn.isConnected) stop();

      // speaking level (real audio if available, otherwise a synthetic pulse)
      let target = 0;
      if (speaking) {
        if (analyser && freqBins) {
          analyser.getByteFrequencyData(freqBins);
          let sum = 0;
          const n = Math.min(20, freqBins.length);
          for (let i = 1; i < n; i++) sum += freqBins[i];
          target = clamp(sum / (n * 130), 0, 1);
        } else {
          target = 0.45 + 0.4 * Math.abs(Math.sin(t * 9) * Math.sin(t * 4.1));
        }
      }
      level = THREE.MathUtils.damp(level, target, 14, dt);

      const motion = reduced ? 0.3 : 1;
      body.position.y = Math.sin(t * 2.2) * 0.012 * motion;
      // the model only ever turns inside its box: slow turntable when idle,
      // a gentle sway facing the viewer while it is talking
      if (speaking) {
        const front = Math.round((spin - FRONT_YAW) / TAU) * TAU + FRONT_YAW;
        spin = THREE.MathUtils.damp(spin, front + Math.sin(t * 1.6) * 0.45, 4, dt);
      } else {
        spin += dt * (reduced ? 0.15 : 0.7);
      }
      body.rotation.y = spin;
      box.classList.toggle('is-speaking', speaking);
      body.rotation.x = THREE.MathUtils.damp(
        body.rotation.x,
        speaking ? Math.sin(t * 8) * 0.035 * level * motion : 0,
        10,
        dt
      );
      body.scale.set(1 - level * 0.012, 1 + level * 0.03 * motion, 1 - level * 0.012);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    // ---------- cleanup ----------
    return () => {
      disposed = true;
      autoRef.current = null;
      disarmGesture();
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      stop();
      document.querySelectorAll('[data-assistant-trigger]').forEach((b) => b.remove());
      style.remove();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
        mats.forEach((m) => {
          const map = (m as THREE.MeshStandardMaterial).map;
          if (map) map.dispose();
          m.dispose();
        });
      });
      renderer.dispose();
      box.remove();
      void audioCtx?.close();
    };
  }, []);

  return null;
}