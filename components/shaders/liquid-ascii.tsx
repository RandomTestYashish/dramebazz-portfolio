"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { FlipFluid, type FluidStepOptions } from "./flip-fluid";

/**
 * FLIP fluid simulation drawn as ASCII characters, weighted by local density.
 * An original implementation that mirrors the prop API of React Bits Pro
 * "Liquid ASCII", so the official component can be swapped in without
 * call-site changes.
 */
export type LiquidAsciiProps = {
  width?: string | number;
  height?: string | number;
  className?: string;
  children?: ReactNode;
  /** Simulation timestep multiplier. */
  speed?: number;
  /** Character cell size in CSS pixels. */
  cellSize?: number;
  /** Gravity along -y. */
  gravity?: number;
  /** 0 = PIC (smooth, damped), 1 = FLIP (lively, noisy). */
  flipRatio?: number;
  pressureIters?: number;
  separationIters?: number;
  overRelaxation?: number;
  /** Fraction of the tank filled with fluid. */
  fillHeight?: number;
  /** Cursor influence radius, as a fraction of the tank height. */
  cursorRadius?: number;
  cursorForce?: number;
  /** Characters ordered from lightest to heaviest. */
  characters?: string;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  opacity?: number;
  /** Gentle sloshing while the cursor is idle. */
  autoWave?: boolean;
  /** Settle the fluid, draw one frame and stop. */
  paused?: boolean;
  /** Fluid grid columns across the width (simulation detail). */
  resolution?: number;
  /** Step quality down, then freeze, when the device cannot keep up. */
  adaptive?: boolean;
};

const D = {
  speed: 0.9,
  cellSize: 15,
  gravity: -25,
  flipRatio: 0.3,
  pressureIters: 30,
  separationIters: 3,
  overRelaxation: 1.5,
  fillHeight: 0.4,
  cursorRadius: 0.25,
  cursorForce: 66,
  characters: " ·:-~=+*#%@",
  color: "#ffffff",
  backgroundColor: "#000000",
  fontFamily: "monospace",
  opacity: 1,
  autoWave: true,
  resolution: 64,
};

/** Tank height in simulation units. */
const TANK = 3;
const SLOW_FRAME_MS = 28;
const SAMPLE_FRAMES = 40;
/** Frames simulated up front so the fluid starts settled, not falling. */
const SETTLE_STEPS = 90;
/** Flow speed (sim units/s) that maps to the heaviest character. */
const FLOW_REF = 1.1;

export function LiquidAscii(props: LiquidAsciiProps): ReactNode {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const live = useRef(props);
  const resume = useRef<(() => void) | null>(null);
  const rebuild = useRef<(() => void) | null>(null);

  useEffect(() => {
    live.current = props;
  });

  useEffect(() => {
    if (!props.paused) resume.current?.();
  }, [props.paused]);

  // Grid detail and fill level are baked into the simulation; rebuild on change.
  useEffect(() => {
    rebuild.current?.();
  }, [props.resolution, props.fillHeight]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    host.appendChild(canvas);

    let fluid: FlipFluid | null = null;
    let simW = 0;
    let cssW = 0;
    let cssH = 0;

    const build = (): void => {
      const c = live.current;
      cssW = host.clientWidth;
      cssH = host.clientHeight;
      if (!cssW || !cssH) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      simW = (TANK * cssW) / cssH;
      const spacing = simW / (c.resolution ?? D.resolution);
      const maxParticles = Math.ceil((simW * TANK) / (0.36 * spacing * spacing));
      fluid = new FlipFluid(simW, TANK, spacing, maxParticles);
      fluid.fill(simW, TANK * (c.fillHeight ?? D.fillHeight));
      for (let i = 0; i < SETTLE_STEPS; i++) step(1 / 60, 0, false);
    };

    // Cursor as a moving obstacle, in simulation units.
    const obstacle: FluidStepOptions["obstacle"] = { x: 0, y: 0, vx: 0, vy: 0, radius: 0, active: false };
    const pointer = { x: 0, y: 0, inside: false, moved: 0 };
    const onPointer = (e: PointerEvent): void => {
      if (e.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.x = (x / rect.width) * simW;
      pointer.y = TANK - (y / rect.height) * TANK;
      pointer.moved = performance.now();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    let time = 0;
    let quality = 0;

    function step(dt: number, gx: number, useCursor: boolean): void {
      if (!fluid) return;
      const c = live.current;
      const radius = (c.cursorRadius ?? D.cursorRadius) * TANK * 0.5;
      if (useCursor && pointer.inside) {
        const force = (c.cursorForce ?? D.cursorForce) / 66;
        if (obstacle.active) {
          obstacle.vx = ((pointer.x - obstacle.x) / dt) * force;
          obstacle.vy = ((pointer.y - obstacle.y) / dt) * force;
        } else {
          obstacle.vx = 0;
          obstacle.vy = 0;
        }
        obstacle.x = pointer.x;
        obstacle.y = pointer.y;
        obstacle.radius = radius;
        obstacle.active = true;
      } else {
        obstacle.active = false;
      }
      fluid.step({
        dt,
        gravity: c.gravity ?? D.gravity,
        gravityX: gx,
        flipRatio: c.flipRatio ?? D.flipRatio,
        pressureIters: Math.max(5, Math.round((c.pressureIters ?? D.pressureIters) / (quality > 0 ? 2 : 1))),
        separationIters: Math.max(1, (c.separationIters ?? D.separationIters) - quality),
        overRelaxation: c.overRelaxation ?? D.overRelaxation,
        obstacle,
      });
    }

    // Canvas cannot read CSS variables; resolve var(--x) against the page.
    const resolveFont = (family: string): string => {
      const m = family.match(/^var\((--[^)]+)\)$/);
      return m ? getComputedStyle(host).getPropertyValue(m[1]!).trim() || "monospace" : family;
    };

    const draw = (): void => {
      if (!fluid) return;
      const c = live.current;
      const cell = c.cellSize ?? D.cellSize;
      const chars = c.characters ?? D.characters;
      const levels = chars.length - 1;
      ctx.globalAlpha = 1;
      ctx.fillStyle = c.backgroundColor ?? D.backgroundColor;
      ctx.fillRect(0, 0, cssW, cssH);
      ctx.font = `${Math.round(cell * 0.92)}px ${resolveFont(c.fontFamily ?? D.fontFamily)}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = c.color ?? D.color;

      const cols = Math.ceil(cssW / cell);
      const rows = Math.ceil(cssH / cell);
      // Bucket cells by character so each weight is one fill pass.
      const buckets: number[][] = Array.from({ length: levels + 1 }, () => []);
      for (let row = 0; row < rows; row++) {
        const py = row * cell + cell / 2;
        const sy = TANK - (py / cssH) * TANK;
        for (let col = 0; col < cols; col++) {
          const px = col * cell + cell / 2;
          const sx = (px / cssW) * simW;
          const d = fluid.sampleDensity(sx, sy);
          if (d < 0.08) continue;
          // Still water reads as light texture; moving water gets the heavy glyphs.
          const flow = Math.min(fluid.sampleSpeed(sx, sy) / FLOW_REF, 1);
          const weight = Math.min(d, 1) * 0.55 + flow * 0.45;
          const k = Math.min(levels, Math.max(1, Math.round(weight * levels)));
          buckets[k]!.push(px, py);
        }
      }
      const master = c.opacity ?? D.opacity;
      for (let k = 1; k <= levels; k++) {
        const b = buckets[k]!;
        if (!b.length) continue;
        ctx.globalAlpha = master * (0.25 + 0.75 * (k / levels));
        const ch = chars[k]!;
        for (let i = 0; i < b.length; i += 2) ctx.fillText(ch, b[i]!, b[i + 1]!);
      }
    };

    let raf = 0;
    let last = performance.now();
    let onScreen = true;
    let visible = document.visibilityState === "visible";
    let frameIndex = 0;
    const samples: number[] = [];

    const frame = (now: number): void => {
      raf = 0;
      const dtMs = now - last;
      last = now;
      const c = live.current;
      const dt = Math.min(dtMs / 1000, 1 / 30) * (c.speed ?? D.speed);
      time += dt;
      const idle = !pointer.inside || now - pointer.moved > 2500;
      const gx = (c.autoWave ?? D.autoWave) && idle ? Math.sin(time * 0.55) * 4 : 0;
      step(dt, gx, true);
      // Reduced quality draws every other frame; the simulation keeps its pace.
      if (quality === 0 || frameIndex++ % 2 === 0) draw();

      if (c.adaptive !== false && quality < 3) {
        samples.push(dtMs);
        if (samples.length >= SAMPLE_FRAMES) {
          const sorted = [...samples].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
          samples.length = 0;
          if (median > SLOW_FRAME_MS) quality += 1;
        }
      }
      schedule();
    };

    const schedule = (): void => {
      if (raf || live.current.paused || quality >= 3 || !onScreen || !visible) return;
      raf = requestAnimationFrame(frame);
    };

    resume.current = () => {
      last = performance.now();
      schedule();
    };
    rebuild.current = () => {
      build();
      draw();
    };

    let lastW = 0;
    let lastH = 0;
    const ro = new ResizeObserver(() => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      // Rebuild on real layout changes, not on small mobile toolbar shifts.
      if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) / Math.max(h, 1) < 0.15) return;
      lastW = w;
      lastH = h;
      build();
      draw();
    });
    ro.observe(host);
    lastW = host.clientWidth;
    lastH = host.clientHeight;
    build();
    draw();
    host.style.opacity = "1";
    schedule();

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      last = performance.now();
      schedule();
    });
    io.observe(host);

    const onVisibility = (): void => {
      visible = document.visibilityState === "visible";
      last = performance.now();
      schedule();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      resume.current = null;
      rebuild.current = null;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      if (canvas.parentElement === host) host.removeChild(canvas);
    };
  }, []);

  const { width = "100%", height = "100%" } = props;
  return (
    <div className={props.className ?? "relative"} style={{ width, height }}>
      <div
        ref={hostRef}
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-1000"
      />
      {props.children}
    </div>
  );
}
