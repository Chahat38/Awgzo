import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useReality } from '../../context/RealityContext';
import { gsap, registerMotionPlugins, ScrollTrigger } from '../../lib/scroll';

const SERVICES = [
  {
    title: 'AR Development',
    body: 'AR development in Pakistan: AR try-on, AR business cards and WebAR product viewers that open in any phone browser.',
  },
  {
    title: 'VR Experiences',
    body: 'We build VR experiences for demos, training and immersive brand moments — scoped as a new build in Pakistan.',
  },
  {
    title: 'XR (WebXR) Development',
    body: 'WebXR development for browser-based AR and VR. We create immersive XR solutions that run on phones and headsets.',
  },
  {
    title: 'TikTok Effects',
    body: 'TikTok AR effects with face tracking and branded overlays, made for creators and campaigns in Pakistan.',
  },
  {
    title: 'Digital Marketing & Branding',
    body: 'AR marketing and brand strategy for Islamabad businesses: clear positioning, content, search and social campaigns.',
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

type Shape = (index: number) => number[];

const SHAPES: Shape[] = [
  (i) => {
    if (i % 5 === 0) return sphere().map((v) => v * 0.55);
    const point = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
    point[(Math.random() * 3) | 0] = Math.random() < 0.5 ? -1 : 1;
    return point.map((v) => v * 1.5);
  },
  () => {
    const t = Math.random() * TAU;
    const r = (2 + Math.cos(3 * t)) * 0.6;
    const jitter = () => (Math.random() - 0.5) * 0.14;
    return [r * Math.cos(2 * t) + jitter(), r * Math.sin(2 * t) + jitter(), Math.sin(3 * t) * 0.6 + jitter()];
  },
  () => {
    const k = (Math.random() * 5) | 0;
    const h = 0.7 + k * 0.6;
    return [(k - 2) * 0.85 + (Math.random() - 0.5) * 0.42, Math.random() * h - 1.5, (Math.random() - 0.5) * 0.42];
  },
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
  (i) => {
    const k = i % 4;
    if (k === 3) return sphere().map((v) => v * 0.45);
    const t = Math.random() * TAU;
    const radius = [1.6, 1.3, 1][k];
    const c = Math.cos(t) * radius;
    const s = Math.sin(t) * radius;
    const j = (Math.random() - 0.5) * 0.06;
    return k === 0 ? [c, s, j] : k === 1 ? [c, j, s] : [j, c, s];
  },
];

function sphere(): number[] {
  const u = Math.random() * 2 - 1;
  const t = Math.random() * TAU;
  const r = Math.sqrt(1 - u * u);
  return [r * Math.cos(t), u, r * Math.sin(t)];
}

const VERTEX_SHADER = `
  attribute vec3 p1, p2, p3, p4, p5;
  attribute float aR;
  uniform float uP, uT, uPx;
  uniform vec2 uM;
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

    vec3 pos = position * w0 + p1 * w1 + p2 * w2 + p3 * w3 + p4 * w4 + p5 * w5;
    float tr = sin(3.14159 * fract(uP));
    pos += normalize(hash(position * 9. + aR * 17.) + vec3(.001)) * tr * (1.5 + aR * 2.5);

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
        renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
      }
    } catch {
      renderer = null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 9;

    const isMobile = window.innerWidth < 700;
    const particleCount = isMobile ? 8000 : 20000;
    const geometry = new THREE.BufferGeometry();
    const attributes = ['position', 'p1', 'p2', 'p3', 'p4', 'p5'];

    SHAPES.forEach((shape, shapeIndex) => {
      const values = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i += 1) {
        const point = shape(i);
        values[i * 3] = point[0];
        values[i * 3 + 1] = point[1];
        values[i * 3 + 2] = point[2];
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
      if (isMobile) {
        points.position.set(0, halfHeight * 0.42, 0);
        points.scale.setScalar(Math.min(0.8, (halfWidth * 0.92) / 2.6));
      } else {
        const centerX = halfWidth * 0.4;
        const scale = Math.min(1.2, (halfWidth * 0.95 - centerX) / 2.5, (halfHeight * 0.9) / 2.5);
        points.position.set(centerX, 0, 0);
        points.scale.setScalar(scale);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const morph = { p: 0 };
    let target = 0;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '+=500%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        target = Math.max(0, Math.min(1, (self.progress - 0.04) / 0.92)) * (SERVICES.length - 1);
      },
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        trigger.scroll(trigger.start + (trigger.end - trigger.start) * (0.04 + (0.92 * i) / (SERVICES.length - 1)));
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
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      if (!visible) return;

      morph.p += (target - morph.p) * 0.14;
      if (Math.abs(target - morph.p) < 0.0005) morph.p = target;
      const progress = Math.max(0, Math.min(SERVICES.length - 1, morph.p));

      material.uniforms.uP.value = progress;
      material.uniforms.uT.value = now / 1000;
      smoothX += (pointerX - smoothX) * 0.08;
      smoothY += (pointerY - smoothY) * 0.08;
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
      window.removeEventListener('resize', resize);
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
          'radial-gradient(800px 520px at 72% 50%, rgba(232,109,34,0.13), transparent 60%), #080808',
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      <div className="pointer-events-none absolute inset-x-0 top-[6vh] z-10 text-center">
        <span className="font-mono-tabular text-[0.75rem] uppercase tracking-[0.25em] text-[#FF9A55]">
          What we do
        </span>
        <h2 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] leading-none tracking-[0.03em]">
          AR VR XR Services
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[#A0A0A0] sm:text-base">
          We build AR try-on, VR experiences, WebXR, TikTok effects, websites, software and
          marketing from Islamabad.
        </p>
      </div>

      <div
        ref={textRef}
        className="absolute left-[clamp(18px,6vw,90px)] top-1/2 z-10 h-[300px] w-[min(460px,88vw)] -translate-y-1/2 max-[700px]:bottom-[5vh] max-[700px]:left-[6vw] max-[700px]:top-auto max-[700px]:h-[280px] max-[700px]:translate-y-0"
      >
        {SERVICES.map((service, index) => (
          <div
            key={service.title}
            className="absolute left-0 top-0 w-full"
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            <span className="font-mono-tabular block text-[1.6rem] text-[#E86C22] max-[700px]:text-[1.25rem]">{pad(index + 1)}</span>
            <h3 className="mt-1 font-display text-[clamp(2.8rem,6.2vw,5.2rem)] leading-[0.92] max-[700px]:text-[clamp(2rem,8.5vw,2.35rem)]">
              {service.title}
            </h3>
            <p className="mt-3 max-w-[400px] text-[0.98rem] leading-relaxed text-[#A0A0A0] max-[700px]:mt-2 max-[700px]:text-[0.8rem] max-[700px]:leading-[1.5]">
              {service.body}
            </p>
            <a href="#contact" className="mt-4 inline-block font-semibold text-[#FF9A55] max-[700px]:mt-3">
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
            className={`h-2.5 w-2.5 rounded-full bg-white/20 transition-all duration-300 hover:bg-[#E86C22] ${
              index === 0 ? 'scale-[1.7] bg-[#E86C22] shadow-[0_0_14px_#E86C22]' : ''
            }`}
          />
        ))}
      </div>

      <div
        ref={countRef}
        className="absolute bottom-[5vh] right-[clamp(12px,3vw,40px)] z-20 font-mono-tabular text-[0.8rem] tracking-[0.25em] text-[#FF9A55] max-[700px]:hidden"
      >
        01 / 06
      </div>
    </section>
  );
}
