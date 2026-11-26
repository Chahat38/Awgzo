import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from 'lenis';

let pluginsRegistered = false;
let activeLenis: Lenis | null = null;

export function registerMotionPlugins() {
  if (pluginsRegistered) return;
  gsap.registerPlugin(
    ScrollTrigger,
    SplitText,
    Flip,
    Observer,
    DrawSVGPlugin,
    CustomEase,
    ScrollToPlugin
  );
  CustomEase.create('awgzoOut', '0.16, 1, 0.3, 1');
  CustomEase.create('awgzoSnap', '0.68, -0.55, 0.265, 1.55');
  // Mobile browsers fire resize when the URL bar hides/shows; refreshing pinned
  // sections on that event makes them jump or collapse. Ignore those resizes.
  ScrollTrigger.config({ ignoreMobileResize: true });
  pluginsRegistered = true;
}

export function initSmoothScroll(
  onUpdate?: (metrics: { progress: number; velocity: number; scrollY: number }) => void
): () => void {
  registerMotionPlugins();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lenis = new Lenis({
    duration: prefersReducedMotion ? 0 : 1.15,
    smoothWheel: !prefersReducedMotion,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  activeLenis = lenis;

  const onLenisScroll = (e: any) => {
    ScrollTrigger.update();
    if (onUpdate) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      onUpdate({
        progress,
        velocity: e?.velocity ?? 0,
        scrollY: window.scrollY,
      });
    }
  };

  lenis.on('scroll', onLenisScroll);

  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const onLoadRefresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', onLoadRefresh);
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  return () => {
    window.removeEventListener('load', onLoadRefresh);
    gsap.ticker.remove(tick);
    lenis.off('scroll', onLenisScroll);
    lenis.destroy();
    if (activeLenis === lenis) {
      activeLenis = null;
    }
  };
}

export function scrollToSection(sectionId: string) {
  const cleanId = sectionId.replace(/^#/, '');
  const el = document.getElementById(cleanId);
  if (!el) return;

  if (activeLenis) {
    activeLenis.scrollTo(el, { offset: 0, duration: 1.1 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export function scrollPageBy(deltaY: number) {
  if (typeof window === 'undefined') return;
  if (activeLenis) {
    const nextY = Math.max(0, activeLenis.scroll + deltaY);
    activeLenis.scrollTo(nextY, { immediate: true });
  } else {
    window.scrollBy({ top: deltaY, behavior: 'auto' });
  }
}

export { gsap, ScrollTrigger, SplitText, Flip, Observer };
