import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import * as THREE from 'three';
import { AWGZO_SITE } from '../../data/site';
import { SocialIcon } from '../../components/ui/SocialIcon';
import { AwgzoLogo } from '../../components/common/AwgzoLogo';
import { useReality } from '../../context/RealityContext';
import { gsap } from '../../lib/scroll';

const HEADING = 'Let Us Take Care Of You';

export function FooterSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const { setActiveSection, sceneStateRef } = useReality();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

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
      color: 0xee8a52,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const resize = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      renderer?.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
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

    let visible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '120px' }
    );
    visibilityObserver.observe(el);

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

      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      visibilityObserver.disconnect();
      sectionObserver.disconnect();
      particleGeometry.dispose();
      particleMaterial.dispose();
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
      className="relative z-10 overflow-hidden border-t border-white/[0.08] bg-[#10191f] px-[clamp(16px,4vw,56px)] pb-[24px] pt-[clamp(28px,4vh,44px)]"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      <div className="relative z-10 flex flex-col gap-[clamp(20px,2.5vw,32px)]">
        <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <AwgzoLogo className="shrink-0 [&_img]:!h-[clamp(48px,4.2vw,64px)] [&_img]:!max-w-none" />
          <div className="min-w-0 lg:flex-1">
            <h2
              className="mt-[6px] font-display text-[clamp(1.5rem,2.5vw,2.5rem)] leading-[1.05] tracking-[0.01em] max-sm:text-[clamp(1.4rem,6.5vw,1.9rem)]"
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
          </div>
          <a
            ref={ctaRef}
            href={AWGZO_SITE.contact.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onPointerMove={handleCtaMove}
            onPointerLeave={handleCtaLeave}
            className="inline-block shrink-0 whitespace-nowrap rounded-full bg-gradient-to-br from-[#e86d22] to-[#ee8a52] px-6 py-[12px] font-bold text-[#10191f] no-underline"
          >
            Book an AR VR XR Call →
          </a>
        </div>

        <div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-[18px] gap-y-[22px] sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] sm:gap-[24px]">
            <div className="fcol">
              <h4 className="mb-[10px] text-xs uppercase tracking-[0.2em] text-[#ee8a52]">Visit Us</h4>
              <p className="text-sm leading-relaxed text-[#9fa3a5]">{AWGZO_SITE.contact.address}</p>
              <a href={`mailto:${AWGZO_SITE.contact.email}`} className="text-sm text-[#9fa3a5] no-underline">
                {AWGZO_SITE.contact.email}
              </a>
              <div className="mt-2 flex flex-wrap gap-[10px]">
                {AWGZO_SITE.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.18] bg-white/[0.06] text-white no-underline transition-transform duration-300 hover:[transform:perspective(500px)_rotateX(-22deg)_translateZ(14px)] hover:shadow-[0_14px_22px_-8px_#e86d22]"
                  >
                    <SocialIcon label={social.label} className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="fcol">
              <h4 className="mb-[10px] text-xs uppercase tracking-[0.2em] text-[#ee8a52]">Quick Links</h4>
              <a href="#hero" className="block text-sm leading-[1.8] text-[#9fa3a5] no-underline">Home</a>
              <a href="/services" className="block text-sm leading-[1.8] text-[#9fa3a5] no-underline">Services</a>
              <a href="#portfolio" className="block text-sm leading-[1.8] text-[#9fa3a5] no-underline">Work</a>
              <a href="#reality-lab" className="block text-sm leading-[1.8] text-[#9fa3a5] no-underline">AR Lab</a>
              <a href="#team" className="block text-sm leading-[1.8] text-[#9fa3a5] no-underline">Team</a>
              <a href="#contact" className="block text-sm leading-[1.8] text-[#9fa3a5] no-underline">Contact</a>
            </div>

            <div className="fcol">
              <h4 className="mb-[10px] text-xs uppercase tracking-[0.2em] text-[#ee8a52]">Newsletter</h4>
              <p className="text-sm leading-relaxed text-[#9fa3a5]">
                Short notes on AR, VR, WebXR and web builds from our studio. No spam.
              </p>
              <form onSubmit={handleNewsletter} className="mt-2 flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  aria-label="Email address for AWGZO updates"
                  className="min-w-0 flex-1 rounded-full border border-white/[0.18] bg-white/[0.06] px-[14px] py-[11px] text-sm text-white outline-none transition-all duration-300 placeholder:text-white/40 focus:border-[#ee8a52] focus:shadow-[0_0_0_4px_rgba(232,109,34,0.22)]"
                />
                <button
                  type="submit"
                  className="rounded-full border-0 bg-[#e86d22] px-4 py-[11px] text-sm font-bold text-[#10191f]"
                >
                  Subscribe
                </button>
              </form>
              {status && <p className="mt-2 text-xs text-[#ee8a52]">{status}</p>}
            </div>
          </div>

          <p className="mt-[20px] text-center text-xs text-[#9fa3a5]">
            © {new Date().getFullYear()} AWGZO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
