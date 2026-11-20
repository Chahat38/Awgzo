import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { AWGZO_SITE } from '../../data/site';
import { useReality } from '../../context/RealityContext';
import { gsap, registerMotionPlugins, ScrollTrigger } from '../../lib/scroll';

const HEADING = 'Let Us Take Care Of You';
const MODEL_URL = '/assets/vr-headset.glb';
const DRACO_PATH = '/draco/';

function cloneMaterialsAndGeometry(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry = mesh.geometry.clone();
    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) => material.clone());
    } else if (mesh.material) {
      mesh.material = mesh.material.clone();
    }
  });
}

function fitToLogoSize(source: THREE.Object3D) {
  const model = source.clone(true);
  cloneMaterialsAndGeometry(model);

  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const scale = 2.6 / maxDimension;

  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

  const group = new THREE.Group();
  group.add(model);
  return group;
}

function createFallbackHeadset() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new RoundedBoxGeometry(2.2, 0.95, 0.55, 4, 0.18),
    new THREE.MeshPhysicalMaterial({
      color: 0x111318,
      metalness: 0.7,
      roughness: 0.22,
      clearcoat: 0.85,
      clearcoatRoughness: 0.16,
      emissive: 0x050608,
    })
  );
  group.add(body);

  const strap = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.09, 12, 48, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.65, metalness: 0.2 })
  );
  strap.position.set(0, 0.16, -0.34);
  strap.rotation.x = Math.PI / 2;
  group.add(strap);

  [-0.52, 0.52].forEach((x) => {
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.27, 48),
      new THREE.MeshStandardMaterial({ color: 0x04060a, metalness: 0.35, roughness: 0.12 })
    );
    lens.position.set(x, 0, 0.3);
    group.add(lens);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.34, 48),
      new THREE.MeshStandardMaterial({
        color: 0xe86c22,
        emissive: 0xe86c22,
        emissiveIntensity: 1.35,
        toneMapped: false,
      })
    );
    ring.position.set(x, 0, 0.312);
    group.add(ring);
  });

  return fitToLogoSize(group);
}

function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.geometry) geometries.add(mesh.geometry);
    const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    meshMaterials.forEach((material) => {
      if (!material) return;
      materials.add(material);
      Object.values(material).forEach((value) => {
        if (value && (value as THREE.Texture).isTexture) {
          textures.add(value as THREE.Texture);
        }
      });
    });
  });

  geometries.forEach((geometry) => geometry.dispose());
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
}

export function FooterSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colsRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    registerMotionPlugins();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveSection('footer');
          sceneStateRef.current.section = 'footer';
        }
      },
      { threshold: 0.2 }
    );
    sectionObserver.observe(el);

    const motionContext = gsap.context(() => {
      if (reducedMotion) return;

      gsap.from('.ch', {
        z: -500,
        rotationX: -90,
        opacity: 0,
        y: 60,
        stagger: 0.025,
        duration: 1.1,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: el, start: 'top 55%', toggleActions: 'play none none reverse' },
      });

      gsap.from('.fcol', {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: colsRef.current, start: 'top 92%', toggleActions: 'play none none reverse' },
      });
    }, el);

    if (reducedMotion) {
      return () => {
        motionContext.revert();
        sectionObserver.disconnect();
      };
    }

    const canvas = canvasRef.current;
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      if (canvas) {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
    } catch {
      renderer = null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 6;
    scene.add(camera);

    const particleCount = 900;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = Math.random() * -45 + 10;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xff9a55,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    let logo: THREE.Group | null = null;
    let logoProgress = 0;
    let disposed = false;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_PATH);
    const modelLoader = new GLTFLoader();
    modelLoader.setDRACOLoader(dracoLoader);

    modelLoader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        logo = fitToLogoSize(gltf.scene);
        logo.visible = logoProgress > 0.01;
        camera.add(logo);
      },
      undefined,
      () => {
        if (disposed) return;
        logo = createFallbackHeadset();
        logo.visible = logoProgress > 0.01;
        camera.add(logo);
      }
    );

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(2, 3, 2);
    camera.add(key);
    const rim = new THREE.PointLight(0xf7f8f7, 2, 20);
    rim.position.set(-3, -1, -2);
    camera.add(rim);
    camera.add(new THREE.AmbientLight(0xffffff, 0.45));

    let logoX = 3;
    let logoY = 0.2;
    let logoScale = 1;
    const resize = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      renderer?.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      const wide = window.innerWidth > 900;
      logoX = wide ? 3 : 0;
      logoY = wide ? 0.1 : 2.3;
      logoScale = wide ? 1 : 0.6;
    };
    resize();
    window.addEventListener('resize', resize);

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX / window.innerWidth - 0.5;
      pointerY = event.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const logoTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'top 20%',
      scrub: 1,
      onUpdate: (self) => {
        logoProgress = self.progress;
      },
    });

    let visible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '120px' }
    );
    visibilityObserver.observe(el);

    const easeOut = gsap.parseEase('power3.out');
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (!visible || !renderer) return;

      const max = document.documentElement.scrollHeight - window.innerHeight || 1;
      const pageProgress = window.scrollY / max;
      camera.position.z += (6 - pageProgress * 38 - camera.position.z) * 0.08;
      camera.position.x += (pointerX * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (-pointerY * 0.8 - camera.position.y) * 0.05;
      particles.rotation.z += 0.0003;

      if (logo) {
        logo.visible = logoProgress > 0.01;
        const eased = easeOut(logoProgress);
        logo.position.set(logoX, -6 + (logoY + 6) * eased, -5.5);
        logo.scale.setScalar((0.2 + 0.8 * eased) * logoScale);
        logo.rotation.y += 0.006;
        logo.rotation.x = pointerY * 0.8;
        logo.rotation.z = pointerX * 0.6;
      }

      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      visibilityObserver.disconnect();
      sectionObserver.disconnect();
      logoTrigger.kill();
      motionContext.revert();
      disposed = true;
      particleGeometry.dispose();
      particleMaterial.dispose();
      if (logo) {
        camera.remove(logo);
        disposeObject(logo);
      }
      dracoLoader.dispose();
      renderer?.dispose();
    };
  }, [sceneStateRef, setActiveSection]);

  const handleCtaMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    const cta = ctaRef.current;
    if (!cta) return;
    const rect = cta.getBoundingClientRect();
    gsap.to(cta, {
      x: (event.clientX - rect.left - rect.width / 2) * 0.35,
      y: (event.clientY - rect.top - rect.height / 2) * 0.5,
      duration: 0.3,
    });
  };

  const handleCtaLeave = () => {
    const cta = ctaRef.current;
    if (!cta) return;
    gsap.to(cta, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,.4)' });
  };

  const handleNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string };
      setStatus(response.ok ? 'Subscribed to AWGZO updates.' : data.message || 'Please enter a valid email.');
      if (response.ok) setEmail('');
    } catch {
      setStatus("Couldn't subscribe right now. Please try again.");
    }
  };

  return (
    <footer
      id="footer"
      ref={sectionRef}
      aria-label="Site footer"
      className="relative z-10 overflow-hidden border-t border-white/[0.08] bg-[#080808] px-[clamp(16px,4vw,56px)] pb-[28px] pt-[clamp(56px,8vh,96px)]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      <div className="relative z-10 flex flex-col gap-[clamp(28px,4vw,48px)]">
        <div className="max-w-[min(760px,100%)]">
          <span className="font-mono-tabular text-[0.75rem] uppercase tracking-[0.25em] text-[#FF9A55]">
            Hey Business Tycoons
          </span>
          <h2
            className="mt-[10px] font-display text-[clamp(2.4rem,5vw,4.25rem)] leading-[1.02] tracking-[0.01em] max-lg:text-[clamp(2.1rem,6.4vw,3.25rem)] max-sm:text-[clamp(1.85rem,9vw,2.6rem)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {HEADING.split(' ').map((word, wordIndex) => (
              <span
                key={wordIndex}
                className="mr-[0.25em] inline-block whitespace-nowrap"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {Array.from(word).map((char, charIndex) => (
                  <span key={charIndex} className="ch inline-block">
                    {char}
                  </span>
                ))}
              </span>
            ))}
          </h2>
          <a
            ref={ctaRef}
            href={AWGZO_SITE.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerMove={handleCtaMove}
            onPointerLeave={handleCtaLeave}
            className="mt-5 inline-block rounded-full bg-gradient-to-br from-[#E86C22] to-[#FF9A55] px-6 py-[12px] font-bold text-[#10191f] no-underline"
          >
            BOOK Free APPOINTMENT ⟶
          </a>
        </div>

        <div>
          <div
            ref={colsRef}
            className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[24px] border-t border-white/[0.18] pt-[26px]"
          >
            <div className="fcol">
              <h4 className="mb-[10px] text-xs uppercase tracking-[0.2em] text-[#FF9A55]">Visit Us</h4>
              <p className="text-sm leading-relaxed text-[#A7AFB3]">{AWGZO_SITE.contact.address}</p>
              <a href={`mailto:${AWGZO_SITE.contact.email}`} className="text-sm text-[#A7AFB3] no-underline">
                {AWGZO_SITE.contact.email}
              </a>
              <div className="mt-2 flex flex-wrap gap-[10px]">
                {AWGZO_SITE.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-white/[0.18] bg-white/[0.06] px-[13px] py-[9px] text-xs text-white no-underline transition-transform duration-300 hover:[transform:perspective(500px)_rotateX(-22deg)_translateZ(14px)] hover:shadow-[0_14px_22px_-8px_#E86C22]"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="fcol">
              <h4 className="mb-[10px] text-xs uppercase tracking-[0.2em] text-[#FF9A55]">Working Hours</h4>
              <p className="text-sm leading-relaxed text-[#A7AFB3]">Monday – Friday</p>
              <p className="text-sm leading-relaxed text-[#A7AFB3]">Morning: 09:00 am – 04:00 pm</p>
              <p className="text-sm leading-relaxed text-[#A7AFB3]">Evening: 07:00 pm – 02:00 am</p>
              <p className="text-sm leading-relaxed text-[#A7AFB3]">Saturday – Sunday – Closed</p>
            </div>

            <div className="fcol">
              <h4 className="mb-[10px] text-xs uppercase tracking-[0.2em] text-[#FF9A55]">Quick Links</h4>
              <a href="#hero" className="block text-sm leading-[1.8] text-[#A7AFB3] no-underline">Home</a>
              <a href="#team" className="block text-sm leading-[1.8] text-[#A7AFB3] no-underline">About</a>
              <a href="#services" className="block text-sm leading-[1.8] text-[#A7AFB3] no-underline">Services</a>
              <a href="#contact" className="block text-sm leading-[1.8] text-[#A7AFB3] no-underline">Contact</a>
            </div>

            <div className="fcol">
              <h4 className="mb-[10px] text-xs uppercase tracking-[0.2em] text-[#FF9A55]">Newsletter</h4>
              <p className="text-sm leading-relaxed text-[#A7AFB3]">
                Stay up to date with our latest news, receive exclusive deals, and more.
              </p>
              <form onSubmit={handleNewsletter} className="mt-2 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email"
                  className="min-w-0 flex-1 rounded-full border border-white/[0.18] bg-white/[0.06] px-[14px] py-[11px] text-sm text-white outline-none transition-all duration-300 placeholder:text-white/40 focus:border-[#FF9A55] focus:shadow-[0_0_0_4px_rgba(232,109,34,0.22)]"
                />
                <button
                  type="submit"
                  className="rounded-full border-0 bg-[#E86C22] px-4 py-[11px] text-sm font-bold text-[#10191f]"
                >
                  subscribe ⟶
                </button>
              </form>
              {status && <p className="mt-2 text-xs text-[#FF9A55]">{status}</p>}
            </div>
          </div>

          <p className="mt-[24px] text-center text-xs text-[#A7AFB3]">
            © Awgzo. All rights reserved. Powered by Wizards
          </p>
        </div>
      </div>
    </footer>
  );
}
