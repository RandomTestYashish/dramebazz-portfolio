"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  /** Cut-out photos; with more than one, the dots wipe from one to the next. */
  srcs: string[];
  /** 0, 1 or 2: medium, fine, coarse dots. */
  density?: number;
  /** 0 breathe, 1 wave, 2 still. */
  motion?: number;
  /** 0 ink, 1 accent gradient, 2 duo (shadows ink, mid-tones accent). */
  tone?: number;
  /** Light: dark dots on a pale screen. Dark: lit dots on black. */
  theme?: "light" | "dark";
};

/** Dots across the screen for the High, Ultra and Medium settings. */
const COLUMNS = [170, 230, 110] as const;
const PALETTE = {
  dark: { ink: "#f3f1ec", idle: "rgba(255, 255, 255, 0.08)" },
  light: { ink: "#1d1d1b", idle: "rgba(29, 29, 27, 0.08)" },
} as const;
/** The page accent: neon orange → hot pink → electric purple. */
const ACCENT_STOPS: [number, string][] = [
  [0, "#ff8a2b"],
  [0.38, "#ff4f8b"],
  [0.7, "#b05cff"],
  [1, "#7b3cff"],
];

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n);

/** How long each photo holds before the dots wipe to the next one. */
const HOLD_MS = 1800;
/** Wipe speed per frame (~30fps, so about half a second per switch). */
const WIPE_STEP = 0.06;

/** How strongly the dots move for Breathe, Wave and Still. */
const MOTION_AMP = [0.08, 0.32, 0] as const;

/**
 * An LED-style dot screen. Each photo is sampled into a grid of dots that
 * breathe or ripple, and the screen keeps switching photos with a
 * left-to-right dot wipe. Controls outside change density, motion and tone.
 */
export function DotMatrix({
  srcs,
  density = 0,
  motion = 0,
  tone = 0,
  theme = "light",
}: Props): ReactNode {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = useRef({ density, motion, tone, theme });

  useEffect(() => {
    settings.current = { density, motion, tone, theme };
  }, [density, motion, tone, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const imgs = srcs.map((src) => {
      const im = new window.Image();
      im.src = src;
      return im;
    });

    let w = 0;
    let h = 0;
    let sp = 7;
    let cols = 0;
    let rows = 0;
    let faces: Float32Array[] = [];
    let cur = 0;
    let wipe = 0;
    let wiping = false;
    let lastSwitch = performance.now();
    let builtFor = -1;
    let builtTheme = "";
    let raf = 0;
    let lastDraw = 0;
    let bufInk = new Float32Array(0);
    let bufAccent = new Float32Array(0);
    let bufIdle = new Float32Array(0);
    let visible = true;
    const pointer = { x: -9999, y: -9999 };

    const build = (): void => {
      const rect = host.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (w < 2 || h < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      builtFor = settings.current.density;
      builtTheme = settings.current.theme;
      const lit = builtTheme === "dark";
      sp = Math.max(1.4, w / (COLUMNS[builtFor as 0 | 1 | 2] ?? COLUMNS[0]));
      cols = Math.floor(w / sp);
      rows = Math.floor(h / sp);

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;

      faces = imgs.map((img) => {
        // Photo: fit to the screen height, sit on the bottom edge.
        const ar = img.naturalWidth / img.naturalHeight || 1;
        let dh = rows * 0.92;
        let dw = dh * ar;
        if (dw > cols) {
          dw = cols;
          dh = dw / ar;
        }
        o.clearRect(0, 0, cols, rows);
        o.drawImage(img, (cols - dw) / 2, rows - dh, dw, dh);
        const pd = o.getImageData(0, 0, cols, rows).data;
        const face = new Float32Array(cols * rows);
        for (let i = 0; i < cols * rows; i++) {
          const a = (pd[i * 4 + 3] ?? 0) / 255;
          if (a < 0.15) continue;
          const lum =
            (0.3 * (pd[i * 4] ?? 0) +
              0.59 * (pd[i * 4 + 1] ?? 0) +
              0.11 * (pd[i * 4 + 2] ?? 0)) /
            255;
          // Lit screen: bright = big dots. Pale screen: dark = big dots.
          face[i] = lit
            ? a * (0.12 + 0.88 * Math.pow(lum, 1.05))
            : a * (0.12 + 0.88 * Math.pow(1 - lum, 0.95));
        }
        return face;
      });

      canvas.dataset.ready = "true";
    };

    const draw = (now: number): void => {
      const s = settings.current;
      if (s.density !== builtFor || s.theme !== builtTheme) build();
      const pal = PALETTE[s.theme];
      if (!cols) return;

      // Photo loop: hold, then wipe to the next one. Paused on Still.
      const n = faces.length;
      if (n > 1 && !reduce && s.motion !== 2) {
        if (!wiping && now - lastSwitch > HOLD_MS) {
          wiping = true;
          wipe = 0;
        }
        if (wiping) {
          wipe += WIPE_STEP;
          if (wipe >= 1) {
            cur = (cur + 1) % n;
            wipe = 0;
            wiping = false;
            lastSwitch = now;
          }
        }
      }
      const from = faces[cur] ?? new Float32Array(0);
      const to = faces[(cur + 1) % Math.max(n, 1)] ?? from;
      const mix = wiping ? wipe : 0;

      ctx.clearRect(0, 0, w, h);
      const ox = (w - cols * sp) / 2 + sp / 2;
      const oy = (h - rows * sp) / 2 + sp / 2;
      // Slight overlap at full size so bright areas read as solid, photo-like.
      const rMax = sp * 0.56;
      const tiny = sp < 3;
      const reach = 70;
      const total = cols * rows;
      if (bufInk.length < total * 3) {
        bufInk = new Float32Array(total * 3);
        bufAccent = new Float32Array(total * 3);
        bufIdle = new Float32Array(total * 2);
      }
      let nInk = 0;
      let nAccent = 0;
      let nIdle = 0;
      const t = now * 0.0021;

      for (let y = 0; y < rows; y++) {
        const cy = oy + y * sp;
        const dy = cy - pointer.y;
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          // A left-to-right wipe rather than a flat cross-fade.
          const local = mix ? clamp01(mix * 1.6 - (x / cols) * 0.6) : 0;
          const v = (from[i] ?? 0) * (1 - local) + (to[i] ?? 0) * local;
          const cx = ox + x * sp;

          let k = v;
          if (!reduce) {
            const amp = MOTION_AMP[s.motion as 0 | 1 | 2] ?? 0;
            if (s.motion === 1) {
              // A slow diagonal swell rolling across the face.
              k *= 1 - amp + amp * (0.5 + 0.5 * Math.sin(t * 1.4 - x * 0.07 - y * 0.05));
            } else if (amp) {
              k *= 1 - amp + amp * Math.sin(t + x * 0.21 + y * 0.13);
            }
            const dx = cx - pointer.x;
            if (dx < reach && dx > -reach && dy < reach && dy > -reach) {
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d < reach) k += (1 - d / reach) * (v > 0.05 ? 0.3 : 0.18);
            }
          }
          const r = rMax * clamp01(k);
          if (r < sp * 0.14) {
            if (!tiny) {
              bufIdle[nIdle++] = cx;
              bufIdle[nIdle++] = cy;
            }
            continue;
          }
          const useAccent =
            s.tone === 1 ? true : s.tone === 2 ? v < 0.62 : false;
          if (useAccent) {
            bufAccent[nAccent++] = cx;
            bufAccent[nAccent++] = cy;
            bufAccent[nAccent++] = r;
          } else {
            bufInk[nInk++] = cx;
            bufInk[nInk++] = cy;
            bufInk[nInk++] = r;
          }
        }
      }

      if (nIdle) {
        const idleR = sp * 0.13;
        ctx.fillStyle = pal.idle;
        ctx.beginPath();
        for (let j = 0; j < nIdle; j += 2) {
          const cx = bufIdle[j] ?? 0;
          const cy = bufIdle[j + 1] ?? 0;
          ctx.moveTo(cx + idleR, cy);
          ctx.arc(cx, cy, idleR, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      const paint = (
        buf: Float32Array,
        n: number,
        color: string | CanvasGradient,
      ): void => {
        if (!n) return;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let j = 0; j < n; j += 3) {
          const cx = buf[j] ?? 0;
          const cy = buf[j + 1] ?? 0;
          const r = buf[j + 2] ?? 0;
          if (tiny) {
            // At this size a square and a circle look the same; squares are far cheaper.
            ctx.rect(cx - r, cy - r, r * 2, r * 2);
          } else {
            ctx.moveTo(cx + r, cy);
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      };
      paint(bufInk, nInk, pal.ink);
      if (nAccent) {
        // The gradient sweeps slowly around the screen centre.
        const ang = 1.1 + (reduce ? 0 : Math.sin(now * 0.0005) * 0.7);
        const len = Math.hypot(w, h) / 2;
        const gx = Math.cos(ang) * len;
        const gy = Math.sin(ang) * len;
        const grad = ctx.createLinearGradient(w / 2 - gx, h / 2 - gy, w / 2 + gx, h / 2 + gy);
        for (const [o, c] of ACCENT_STOPS) grad.addColorStop(o, c);
        paint(bufAccent, nAccent, grad);
      }
    };

    const loop = (now: number): void => {
      // ~30fps is plenty for a breathing dot screen.
      if (visible && !document.hidden && now - lastDraw > 30) {
        lastDraw = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };

    const start = (): void => {
      build();
      draw(performance.now());
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now());
    });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });

    const onMove = (e: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = (): void => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const ready = Promise.all(
      imgs.map((im) => (im.decode ? im.decode().catch(() => undefined) : undefined)),
    );
    void Promise.all([ready, document.fonts?.ready]).then(() => {
      start();
      ro.observe(host);
      io.observe(host);
    });
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
    // srcs is compared by value so a new array literal doesn't restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcs.join("|")]);

  return <canvas ref={canvasRef} className="dot-canvas" aria-hidden="true" />;
}
