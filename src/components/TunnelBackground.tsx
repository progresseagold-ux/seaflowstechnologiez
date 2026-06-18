"use client";

import * as THREE from "three";
import { useRef, useEffect, useState, useCallback } from "react";

/* ----------------------------- utilities ----------------------------- */

/**
 * Mobile detection helper for responsive tweaks
 */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as any).matches);

    setIsMobile(mq.matches);

    try {
      mq.addEventListener("change", onChange as any);
      return () => mq.removeEventListener("change", onChange as any);
    } catch {
      mq.addListener(onChange as any);
      return () => mq.removeListener(onChange as any);
    }
  }, [breakpoint]);

  return isMobile;
}

/* ----------------------------- vertex & fragment shader ----------------------------- */

const vertexShader = `void main(){ gl_Position = vec4(position, 1.0); }`;

const fragmentShader = `
uniform float iTime;
uniform vec3 iResolution;

#define TAU 6.2831853071795865
#define TUNNEL_LAYERS 64
#define RING_POINTS 96
#define POINT_SIZE 2.0
#define POINT_COLOR_A vec3(0.99, 0.72, 0.07) /* Gold accent: #FDB813 */
#define POINT_COLOR_B vec3(0.12, 0.48, 0.92) /* Seablue accent: Brand Royal Blue */
#define SPEED 0.45

float sq(float x){ return x*x; }

vec2 AngRep(vec2 uv, float angle){
  vec2 polar = vec2(atan(uv.y, uv.x), length(uv));
  polar.x = mod(polar.x + angle/2.0, angle) - angle/2.0;
  return polar.y * vec2(cos(polar.x), sin(polar.x));
}

float sdCircle(vec2 uv, float r){ return length(uv) - r; }

vec3 MixShape(float sd, vec3 fill, vec3 target){
  float blend = smoothstep(0.0, 1.2/iResolution.y, sd);
  return mix(fill, target, blend);
}

vec2 TunnelPath(float x){
  vec2 offs = vec2(
    0.2 * sin(TAU * x * 0.4) + 0.35 * sin(TAU * x * 0.18 + 0.3),
    0.25 * cos(TAU * x * 0.25) + 0.15 * cos(TAU * x * 0.08)
  );
  offs *= smoothstep(0.8, 3.5, x);
  return offs;
}

void main(){
  vec2 res = iResolution.xy / iResolution.y;
  vec2 uv = gl_FragCoord.xy / iResolution.y - res/2.0;
  
  // Subtle rich navy ocean base layer instead of direct black
  vec3 color = vec3(0.008, 0.024, 0.051);
  
  float repAngle = TAU / float(RING_POINTS);
  float pointSize = POINT_SIZE / (2.0 * iResolution.y);
  float camZ = iTime * SPEED;
  vec2 camOffs = TunnelPath(camZ);

  for(int i = 1; i <= TUNNEL_LAYERS; i++){
    float pz = 1.0 - (float(i) / float(TUNNEL_LAYERS));
    pz -= mod(camZ, 4.0 / float(TUNNEL_LAYERS));
    vec2 offs = TunnelPath(camZ + pz) - camOffs;
    float ringRad = 0.16 * (1.0 / sq(pz * 0.75 + 0.42));
    
    if(abs(length(uv + offs) - ringRad) < pointSize * 1.5){
      vec2 aruv = AngRep(uv + offs, repAngle);
      float pdist = sdCircle(aruv - vec2(ringRad, 0), pointSize);
      
      // Alternate gold and seablue dots for beautiful brand representation
      vec3 ptColor = (mod(float(i), 2.0) == 0.0) ? POINT_COLOR_A : POINT_COLOR_B;
      float shade = (1.0 - pz);
      color = MixShape(pdist, ptColor * shade, color);
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

/* ----------------------------- three helpers ----------------------------- */

type ThreeContext = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  geometry: THREE.PlaneGeometry;
};

function createThreeForCanvas(canvas: HTMLCanvasElement, width: number, height: number): ThreeContext | null {
  try {
    // Check if WebGL is supported by browser capabilities
    const tempCanvas = document.createElement("canvas");
    const hasWebGL = !!(
      window.WebGLRenderingContext &&
      (tempCanvas.getContext("webgl") || tempCanvas.getContext("experimental-webgl"))
    );
    if (!hasWebGL) {
      console.warn("WebGL context not supported by environment.");
      return null;
    }

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, failIfMajorPerformanceCaveat: false });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(width, height, 1) },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return { renderer, scene, camera, material, mesh, geometry };
  } catch (e) {
    console.warn("Failed to initialize WebGL renderer context gracefully, falling back.", e);
    return null;
  }
}

function disposeThree(ctx: ThreeContext | null) {
  if (!ctx) return;
  try {
    ctx.scene.remove(ctx.mesh);
    ctx.mesh.geometry.dispose();
    ctx.material.dispose();
    ctx.renderer.dispose();
  } catch (e) {
    // ignore
  }
}

/* ----------------------------- TunnelHeroBackground Component ----------------------------- */

export function TunnelHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<ThreeContext | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);
  const pausedRef = useRef<boolean>(false);
  const rafResizeRef = useRef<boolean>(false);
  const [webglSupported, setWebglSupported] = useState(true);

  const animate = useCallback((time: number) => {
    if (!ctxRef.current) return;
    animRef.current = requestAnimationFrame(animate);
    if (pausedRef.current) {
      lastTimeRef.current = time;
      return;
    }
    time *= 0.001;
    const delta = time - (lastTimeRef.current || time);
    lastTimeRef.current = time;
    ctxRef.current.material.uniforms.iTime.value += delta * 0.45; // Smooth movement
    try {
      ctxRef.current.renderer.render(ctxRef.current.scene, ctxRef.current.camera);
    } catch (e) {
      console.error("Render loop error, breaking to CSS fallback", e);
      setWebglSupported(false);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;

    const container = canvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const ctx = createThreeForCanvas(canvas, width, height);
    if (!ctx) {
      setWebglSupported(false);
      return;
    }
    ctxRef.current = ctx;

    const resizeObserver = new ResizeObserver(() => {
      if (!ctxRef.current) return;
      if (rafResizeRef.current) return;
      rafResizeRef.current = true;
      requestAnimationFrame(() => {
        rafResizeRef.current = false;
        if (!container || !ctxRef.current) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        try {
          ctxRef.current.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          ctxRef.current.renderer.setSize(w, h);
          (ctxRef.current.material.uniforms.iResolution.value as THREE.Vector3).set(w, h, 1);
        } catch (err) {
          // Keep failure silent
        }
      });
    });
    resizeObserver.observe(container);

    const handleVisibility = () => {
      pausedRef.current = !!document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();

    animRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (ctxRef.current) {
        disposeThree(ctxRef.current);
        ctxRef.current = null;
      }
    };
  }, [animate]);

  if (!webglSupported) {
    // Beautiful, high-end, responsive CSS blend animation mimicking the brand's solar gold + seablue
    return (
      <div className="absolute inset-0 w-full h-full overflow-hidden scale-100 z-0 pointer-events-none select-none rounded-[inherit] bg-[#020a1c]">
        {/* Dynamic moving background blobs using pure CSS gradients and animate-pulse properties */}
        <div 
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#FDB813]/10 mix-blend-screen blur-[100px] pointer-events-none animate-pulse" 
          style={{ animationDuration: "8s" }}
        />
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[65%] h-[65%] rounded-full bg-[#124ba2]/20 mix-blend-screen blur-[120px] pointer-events-none animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c182f]/90 via-[#0a1527]/50 to-[#040e1b]/85" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden scale-100 z-0 pointer-events-none select-none rounded-[inherit]">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block" 
        style={{ mixBlendMode: "normal" }}
      />
      {/* Absolute overlay over the canvas layer to blend with container gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c182f]/85 via-transparent to-[#040e1b]/80 mix-blend-multiply pointer-events-none" />
      <div className="absolute inset-0 bg-[#0a1835]/35 mix-blend-color-dodge pointer-events-none" />
    </div>
  );
}
