"use client";

import { Mesh, Program, Renderer, Transform, Triangle } from "ogl";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Ray-marched monochrome canyon, drifting forward along a meandering floor.
 * An original implementation that mirrors the prop API of React Bits Pro
 * "Ravine", so the official component can be swapped in without call-site
 * changes.
 */
export type RavineProps = {
  /** Travel speed along the canyon floor. */
  speed?: number;
  /** Ray-march steps per pixel (detail vs GPU cost), 16-256. */
  steps?: number;
  /** Fraction of the safe distance each step advances. */
  stepScale?: number;
  /** Frequency of the terrain noise. */
  scale?: number;
  /** Height multiplier of the terrain ridges. */
  height?: number;
  /** How quickly the walls rise from the centre line. */
  spread?: number;
  /** Curve exponent of the wall rise. */
  wallCurve?: number;
  /** Distance fog. 0 disables. */
  fade?: number;
  cameraHeight?: number;
  /** Camera pitch, radians. Positive looks down. */
  tilt?: number;
  /** Camera roll, radians. */
  roll?: number;
  /** Field of view multiplier. */
  fov?: number;
  nearColor?: string;
  farColor?: string;
  brightness?: number;
  contrast?: number;
  /** Fine per-pixel grain. */
  grain?: number;
  /** Render one still frame and stop. */
  paused?: boolean;
  /** Upper bound on device pixel ratio. Values below 1 render under-sampled. */
  dpr?: number;
  /** How far the view leans toward the pointer, radians. 0 disables. */
  pointerInfluence?: number;
  /** Step down quality, then pause, when the device cannot keep up. */
  adaptive?: boolean;
  className?: string;
  children?: ReactNode;
};

const VS = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;

const FS = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uDist;
uniform int uSteps;
uniform float uStepScale;
uniform float uScale;
uniform float uHeight;
uniform float uSpread;
uniform float uWallCurve;
uniform float uFade;
uniform float uCamH;
uniform float uTilt;
uniform float uRoll;
uniform float uFov;
uniform float uBright;
uniform float uContrast;
uniform float uGrain;
uniform vec3 uNear;
uniform vec3 uFar;
uniform vec2 uLook;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p){
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    s += a * noise(p);
    p = ROT * p;
    a *= 0.5;
  }
  return s;
}

// The canyon floor meanders so the camera never sees a straight corridor.
float centre(float z){
  return sin(z * 0.03) * 4.0 + sin(z * 0.009 + 1.3) * 7.0;
}

// Ridged noise: sharp crests instead of rounded dunes.
float ridged(vec2 p){
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * (1.0 - abs(noise(p) * 2.0 - 1.0));
    p = ROT * p;
    a *= 0.5;
  }
  return s;
}

float terrain(vec2 xz){
  float d = abs(xz.x - centre(xz.y)) / uSpread * 2.0;
  float wall = pow(d, uWallCurve) * uSpread * 0.6;
  float rock = (ridged(xz * uScale * 0.3) - 0.45) * 12.0 * uHeight;
  float floorDetail = (fbm(xz * uScale * 0.8) - 0.5) * 1.5 * uHeight;
  float h = wall + rock * (0.15 + min(d, 1.5)) + floorDetail;
  // Soft strata on the walls, like layered sediment.
  float layer = 2.2;
  float terraced = (floor(h / layer) + smoothstep(0.2, 0.8, fract(h / layer))) * layer;
  return mix(h, terraced, 0.55 * smoothstep(0.25, 0.7, d));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

  float z = uDist;
  vec3 ro = vec3(centre(z), uCamH, z);
  float yaw = atan(centre(z + 30.0) - ro.x, 30.0) + uLook.x;
  float pitch = -uTilt + uLook.y;
  vec3 fw = vec3(sin(yaw) * cos(pitch), sin(pitch), cos(yaw) * cos(pitch));
  vec3 rt = normalize(vec3(fw.z, 0.0, -fw.x));
  vec3 up = cross(fw, rt);
  float r = uRoll + sin(uTime * 0.07) * uRoll * 0.3;
  vec3 rt2 = cos(r) * rt + sin(r) * up;
  vec3 up2 = cos(r) * up - sin(r) * rt;
  vec3 rd = normalize(fw + (uv.x * rt2 + uv.y * up2) * uFov);

  float t = 0.5 + hash(gl_FragCoord.xy + fract(uTime)) * uGrain * 40.0;
  bool hit = false;
  for (int i = 0; i < 256; i++) {
    if (i >= uSteps) break;
    vec3 p = ro + rd * t;
    float h = p.y - terrain(p.xz);
    if (h < 0.003 * t) { hit = true; break; }
    t += max(h * uStepScale, 0.04);
    if (t > 180.0) break;
  }

  float tone;
  float fog;
  if (hit) {
    vec3 p = ro + rd * t;
    float e = 0.08 * (1.0 + t * 0.02);
    vec3 n = normalize(vec3(
      terrain(p.xz - vec2(e, 0.0)) - terrain(p.xz + vec2(e, 0.0)),
      2.0 * e,
      terrain(p.xz - vec2(0.0, e)) - terrain(p.xz + vec2(0.0, e))
    ));
    // Low raking light from ahead-left picks out the strata.
    float key = clamp(dot(n, normalize(vec3(-0.6, 0.45, 0.65))), 0.0, 1.0);
    float sky = 0.5 + 0.5 * n.y;
    tone = 0.02 + 0.62 * key * key + 0.12 * sky;
    fog = uFade > 0.0 ? 1.0 - exp(-(t * t) / (uFade * uFade * 6.0)) : 0.0;
  } else {
    tone = 1.0;
    fog = 1.0;
  }
  // Haze brightens slightly toward the horizon.
  float haze = 0.82 + 0.18 * clamp(1.0 - rd.y * 3.0, 0.0, 1.0);
  tone = mix(tone, haze, fog);

  tone = (tone - 0.5) * uContrast + 0.5;
  tone *= uBright;
  tone += (hash(gl_FragCoord.xy * 1.37 + fract(uTime * 0.37)) - 0.5) * uGrain * 6.0;
  tone = clamp(tone, 0.0, 1.0);

  gl_FragColor = vec4(mix(uNear, uFar, tone), 1.0);
}`;

const D = {
  speed: 1,
  steps: 128,
  stepScale: 0.5,
  scale: 0.25,
  height: 1,
  spread: 34,
  wallCurve: 2.5,
  fade: 35,
  cameraHeight: 6,
  tilt: 0.05,
  roll: 0.075,
  fov: 1,
  nearColor: "#000000",
  farColor: "#ffffff",
  brightness: 0.8,
  contrast: 1,
  grain: 0.005,
  dpr: 1,
  pointerInfluence: 0,
};

/** Forward travel in world units per second at speed 1. */
const TRAVEL = 6;
/** Frame time above which the adaptive path steps quality down. */
const SLOW_FRAME_MS = 32;
const SAMPLE_FRAMES = 40;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function Ravine(props: RavineProps): ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);
  const live = useRef(props);
  const resume = useRef<(() => void) | null>(null);

  useEffect(() => {
    live.current = props;
  });

  // Unpausing restarts the loop; pausing stops it at the next frame.
  useEffect(() => {
    if (!props.paused) resume.current?.();
  }, [props.paused]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: false, antialias: false, dpr: 1, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the static fallback behind the canvas stays.
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "width:100%;height:100%;display:block";
    el.appendChild(canvas);

    const program = new Program(gl, {
      vertex: VS,
      fragment: FS,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uDist: { value: 0 },
        uSteps: { value: D.steps },
        uStepScale: { value: D.stepScale },
        uScale: { value: D.scale },
        uHeight: { value: D.height },
        uSpread: { value: D.spread },
        uWallCurve: { value: D.wallCurve },
        uFade: { value: D.fade },
        uCamH: { value: D.cameraHeight },
        uTilt: { value: D.tilt },
        uRoll: { value: D.roll },
        uFov: { value: D.fov },
        uBright: { value: D.brightness },
        uContrast: { value: D.contrast },
        uGrain: { value: D.grain },
        uNear: { value: hexToRgb(D.nearColor) },
        uFar: { value: hexToRgb(D.farColor) },
        uLook: { value: [0, 0] },
      },
    });
    if (!program.uniformLocations) {
      el.removeChild(canvas);
      return;
    }
    const scene = new Transform();
    new Mesh(gl, { geometry: new Triangle(gl), program }).setParent(scene);

    // Adaptive quality: 0 = as configured, 1-2 = reduced, 3 = frozen.
    let quality = 0;
    const qualitySteps = [1, 0.6, 0.4];
    const qualityDpr = [1, 0.8, 0.65];

    const resize = (): void => {
      const c = live.current;
      const bound = (c.dpr ?? D.dpr) * (qualityDpr[Math.min(quality, 2)] ?? 1);
      renderer.dpr = Math.min(window.devicePixelRatio || 1, bound);
      renderer.setSize(el.clientWidth, el.clientHeight);
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };

    const sync = (): void => {
      const c = live.current;
      const u = program.uniforms;
      const stepFactor = qualitySteps[Math.min(quality, 2)] ?? 1;
      u.uSteps.value = Math.max(16, Math.round((c.steps ?? D.steps) * stepFactor));
      u.uStepScale.value = c.stepScale ?? D.stepScale;
      u.uScale.value = c.scale ?? D.scale;
      u.uHeight.value = c.height ?? D.height;
      u.uSpread.value = c.spread ?? D.spread;
      u.uWallCurve.value = c.wallCurve ?? D.wallCurve;
      u.uFade.value = c.fade ?? D.fade;
      u.uCamH.value = c.cameraHeight ?? D.cameraHeight;
      u.uTilt.value = c.tilt ?? D.tilt;
      u.uRoll.value = c.roll ?? D.roll;
      u.uFov.value = c.fov ?? D.fov;
      u.uBright.value = c.brightness ?? D.brightness;
      u.uContrast.value = c.contrast ?? D.contrast;
      u.uGrain.value = c.grain ?? D.grain;
      u.uNear.value = hexToRgb(c.nearColor ?? D.nearColor);
      u.uFar.value = hexToRgb(c.farColor ?? D.farColor);
    };

    // Pointer lean, eased so it never snaps.
    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent): void => {
      if (e.pointerType !== "mouse") return;
      const k = live.current.pointerInfluence ?? D.pointerInfluence;
      look.tx = ((e.clientX / window.innerWidth) * 2 - 1) * k;
      look.ty = -((e.clientY / window.innerHeight) * 2 - 1) * k * 0.6;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let dist = 0;
    let onScreen = true;
    let visible = document.visibilityState === "visible";
    const samples: number[] = [];

    const render = (): void => {
      program.uniforms.uTime.value = time;
      program.uniforms.uDist.value = dist;
      program.uniforms.uLook.value = [look.x, look.y];
      renderer.render({ scene });
    };

    const frame = (now: number): void => {
      raf = 0;
      const dtMs = now - last;
      last = now;
      const dt = Math.min(dtMs / 1000, 0.05);
      const c = live.current;
      time += dt;
      dist += dt * (c.speed ?? D.speed) * TRAVEL;
      look.x += (look.tx - look.x) * (1 - Math.exp(-dt * 2));
      look.y += (look.ty - look.y) * (1 - Math.exp(-dt * 2));
      sync();
      render();

      if (c.adaptive !== false && quality < 3) {
        samples.push(dtMs);
        if (samples.length >= SAMPLE_FRAMES) {
          const sorted = [...samples].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
          samples.length = 0;
          if (median > SLOW_FRAME_MS) {
            quality += 1;
            if (quality < 3) resize();
          }
        }
      }
      schedule();
    };

    const schedule = (): void => {
      const c = live.current;
      if (raf || c.paused || quality >= 3 || !onScreen || !visible) return;
      raf = requestAnimationFrame(frame);
    };

    const ro = new ResizeObserver(() => {
      resize();
      sync();
      render();
    });
    ro.observe(el);
    resize();
    sync();
    render();
    // Reveal over the static fallback once a frame exists: no blank flash.
    el.style.opacity = "1";

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      last = performance.now();
      schedule();
    });
    io.observe(el);

    const onVisibility = (): void => {
      visible = document.visibilityState === "visible";
      last = performance.now();
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    resume.current = () => {
      last = performance.now();
      schedule();
    };

    return () => {
      cancelAnimationFrame(raf);
      resume.current = null;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentElement === el) el.removeChild(canvas);
    };
  }, []);

  return (
    <div className={props.className ?? "relative h-full w-full"}>
      <div
        ref={ref}
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-1000"
      />
      {props.children}
    </div>
  );
}
