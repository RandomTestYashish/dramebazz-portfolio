"use client";

import { Mesh, Program, Renderer, Texture, Transform, Triangle } from "ogl";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type PortraitMorphProps = {
  srcA: string;
  srcB: string;
  className?: string;
};

const VERTEX_SHADER = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uImageSize;
uniform vec2 uOrigin;
uniform vec2 uDirection;

varying vec2 vUv;

vec2 coverUv(vec2 uv) {
  vec2 ratio = vec2(
    min((uResolution.x / uResolution.y) / (uImageSize.x / uImageSize.y), 1.0),
    min((uResolution.y / uResolution.x) / (uImageSize.y / uImageSize.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float p = uProgress;
  float bell = 4.0 * p * (1.0 - p);

  vec2 dir = normalize(uDirection + vec2(0.0001));
  float along = dot(uv - uOrigin, dir);
  float distGradient = (along + 1.4) / 2.8;

  float warpLow = fbm(uv * 1.8 + uTime * 0.05) - 0.5;
  float warpHi = fbm(uv * 5.5 - uTime * 0.04 + 13.0) - 0.5;
  float field = distGradient + warpLow * 0.55 + warpHi * 0.18;

  float remapped = mix(-0.25, 1.25, p);
  float edgeWidth = 0.07;
  float mask = 1.0 - smoothstep(remapped - edgeWidth, remapped + edgeWidth, field);

  vec2 perp = vec2(-dir.y, dir.x);
  float ripple = sin((field - remapped) * 14.0) * 0.5 + 0.5;
  float edgeBand = 1.0 - smoothstep(0.0, edgeWidth * 1.6, abs(field - remapped));
  vec2 pushUv = uv + perp * ripple * edgeBand * 0.025 * bell;

  vec4 texA = texture2D(uTexA, coverUv(pushUv));
  vec4 texB = texture2D(uTexB, coverUv(pushUv));
  vec4 color = mix(texA, texB, mask);
  color.rgb *= 1.0 - edgeBand * 0.35 * bell;

  gl_FragColor = color;
}
`;

const SETTLE_EPSILON = 0.0008;

/**
 * Hover-driven liquid morph between two images (OGL / WebGL).
 * Renders only while a transition is in flight, so it costs nothing at rest.
 * The parent renders the static image underneath; this canvas fades in on top
 * once both textures load, and stays invisible if WebGL or loading fails.
 */
export function PortraitMorph({
  srcA,
  srcB,
  className,
}: PortraitMorphProps): ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.cssText = "width:100%;height:100%;display:block";
    container.appendChild(canvas);

    const scene = new Transform();
    const texA = new Texture(gl, { generateMipmaps: false });
    const texB = new Texture(gl, { generateMipmaps: false });
    const imageSize: [number, number] = [1, 1];

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uTexA: { value: texA },
        uTexB: { value: texB },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: [1, 1] as [number, number] },
        uImageSize: { value: imageSize },
        uOrigin: { value: [0.5, 0.5] as [number, number] },
        uDirection: { value: [1, 0] as [number, number] },
      },
      transparent: true,
    });
    new Mesh(gl, { geometry: new Triangle(gl), program }).setParent(scene);

    let hovering = false;
    let progress = 0;
    let time = 0;
    let last = 0;
    let raf = 0;
    let loaded = false;
    let disposed = false;

    const draw = (): void => {
      program.uniforms.uTime.value = time;
      program.uniforms.uProgress.value = progress;
      renderer.render({ scene });
    };

    const tick = (now: number): void => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      const target = hovering ? 1 : 0;
      const k = 1 - Math.exp(-(hovering ? 2.4 : 2.0) * dt);
      progress += (target - progress) * k;

      if (Math.abs(target - progress) < SETTLE_EPSILON) {
        progress = target;
        draw();
        raf = 0;
        return;
      }
      draw();
      raf = requestAnimationFrame(tick);
    };

    const wake = (): void => {
      if (!loaded || raf || disposed) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const resize = (): void => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      program.uniforms.uResolution.value = [w * renderer.dpr, h * renderer.dpr];
      if (loaded) draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const loadImage = (src: string, target: Texture): Promise<void> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          target.image = img;
          imageSize[0] = img.naturalWidth;
          imageSize[1] = img.naturalHeight;
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });

    Promise.all([loadImage(srcA, texA), loadImage(srcB, texB)])
      .then(() => {
        if (disposed) return;
        loaded = true;
        draw();
        setReady(true);
      })
      .catch(() => setReady(false));

    const edgeDirection = (x: number, y: number): [number, number] => {
      const min = Math.min(x, 1 - x, y, 1 - y);
      if (min === x) return [1, 0];
      if (min === 1 - x) return [-1, 0];
      if (min === y) return [0, 1];
      return [0, -1];
    };

    const localPoint = (e: PointerEvent): [number, number] => {
      const rect = container.getBoundingClientRect();
      return [
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      ];
    };

    const onEnter = (e: PointerEvent): void => {
      const [x, y] = localPoint(e);
      program.uniforms.uOrigin.value = [x, y];
      program.uniforms.uDirection.value = edgeDirection(x, y);
      hovering = true;
      wake();
    };
    const onLeave = (e: PointerEvent): void => {
      const [x, y] = localPoint(e);
      const [dx, dy] = edgeDirection(x, y);
      program.uniforms.uOrigin.value = [x, y];
      program.uniforms.uDirection.value = [-dx, -dy];
      hovering = false;
      wake();
    };

    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, [srcA, srcB]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 transition-opacity duration-500 ${
        ready ? "opacity-100" : "opacity-0"
      } ${className ?? ""}`}
    />
  );
}
