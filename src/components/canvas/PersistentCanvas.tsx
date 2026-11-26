import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useReality } from '../../context/RealityContext';

function detectWebGLState(): { supported: boolean; isSoftwareGl: boolean } {
  if (typeof window === 'undefined') return { supported: false, isSoftwareGl: false };
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return { supported: false, isSoftwareGl: false };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: false };
  }
}

const SKY_VERT = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const SKY_FRAG = `
  varying vec3 vWorldPosition;
  uniform float uVrMix;
  uniform float uTime;
  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 arBottom = vec3(0.031, 0.031, 0.031);
    vec3 arTop = vec3(0.065, 0.048, 0.040);
    vec3 vrBottom = vec3(0.025, 0.035, 0.080);
    vec3 vrHorizon = vec3(0.140, 0.080, 0.220);
    vec3 vrTop = vec3(0.020, 0.025, 0.060);

    vec3 arCol = mix(arBottom, arTop, smoothstep(0.15, 0.85, h));
    vec3 vrCol = h < 0.5
      ? mix(vrBottom, vrHorizon, smoothstep(0.0, 0.5, h))
      : mix(vrHorizon, vrTop, smoothstep(0.5, 1.0, h));

    float band = exp(-abs(dir.y) * 14.0) * (0.28 + 0.12 * sin(dir.x * 4.0 + uTime * 0.6));
    vrCol += vec3(0.91, 0.42, 0.13) * band * uVrMix;

    vec3 col = mix(arCol, vrCol, uVrMix);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function PersistentCanvas() {
  const { sceneStateRef } = useReality();
  const [fallbackActive, setFallbackActive] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { supported, isSoftwareGl } = detectWebGLState();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supported) {
      setFallbackActive(true);
      return;
    }

    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const isMobile = window.innerWidth < 768;
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile && !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setFallbackActive(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setClearColor(0x10191f, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x10191f, 0.022);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      120
    );
    camera.position.set(0, 0.25, 7.4);

    // Lighting
    const ambient = new THREE.AmbientLight(0xf7f8f7, 0.35);
    const dirLight = new THREE.DirectionalLight(0xf7f8f7, 1.5);
    dirLight.position.set(4, 6, 5);
    const orangePt = new THREE.PointLight(0xe86d22, 3.2, 16);
    orangePt.position.set(-3, 1.5, 3);
    const bluePt = new THREE.PointLight(0x3b82f6, 2.2, 16);
    bluePt.position.set(3, -1, -2);
    scene.add(ambient, dirLight, orangePt, bluePt);

    // Subtle atmospheric sky backdrop
    const skyGeo = new THREE.SphereGeometry(1, 32, 24);
    const skyUniforms = {
      uVrMix: { value: 0 },
      uTime: { value: 0 },
    };
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      uniforms: skyUniforms,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.scale.set(48, 48, 48);
    skyMesh.frustumCulled = false;
    scene.add(skyMesh);

    let smoothPtrX = 0;
    let smoothPtrY = 0;

    const resize = () => {
      if (!renderer) return;
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) * 0.001, 0.05);
      lastTime = now;

      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const t = reducedMotion ? 0 : now * 0.001;
      const s = sceneStateRef.current;
      const damp = 1 - Math.exp(-dt * 5.0);

      smoothPtrX = THREE.MathUtils.lerp(smoothPtrX, s.pointerX, damp);
      smoothPtrY = THREE.MathUtils.lerp(smoothPtrY, s.pointerY, damp);

      skyUniforms.uTime.value = t;

      const targetX = smoothPtrX * 0.5;
      const targetY = 0.25 - smoothPtrY * 0.28;
      const targetZ = 7.4 - s.scrollProgress * 1.4;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 1 - Math.exp(-dt * 4));
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 1 - Math.exp(-dt * 4));
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 1 - Math.exp(-dt * 6));
      camera.lookAt(smoothPtrX * 0.2, 0.12, -6.5);

      renderer?.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      envTarget.dispose();
      skyGeo.dispose();
      skyMat.dispose();
      renderer?.dispose();
    };
  }, [sceneStateRef]);

  const shade = (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, rgba(232,109,34,0.10), rgba(16,25,31,0.58) 78%)',
      }}
    />
  );

  if (fallbackActive) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#10191f]"
      >
        {shade}
      </div>
    );
  }

  return (
    <div ref={hostRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#10191f]">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {shade}
    </div>
  );
}
