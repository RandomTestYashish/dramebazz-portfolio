"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { LiquidAscii, type LiquidAsciiProps } from "@/components/shaders/liquid-ascii";
import { useMediaQuery } from "@/lib/use-media-query";

// A slow pool of type: graphite characters on near-black, settling at the
// foot of the hero and sloshing gently when the cursor is still.
const SHARED: LiquidAsciiProps = {
  speed: 0.7,
  gravity: -25,
  flipRatio: 0.3,
  overRelaxation: 1.5,
  fillHeight: 0.36,
  cursorRadius: 0.18,
  cursorForce: 66,
  characters: " ·:-~=+*#%@",
  color: "#8d8c86",
  backgroundColor: "#0e0e0d",
  fontFamily: "var(--font-geist-mono)",
  opacity: 0.75,
  autoWave: true,
};

const DESKTOP: LiquidAsciiProps = { cellSize: 14, resolution: 72, pressureIters: 30, separationIters: 3 };
// Phones: bigger cells and a coarser grid keep the solver well inside budget.
const MOBILE: LiquidAsciiProps = { cellSize: 12, resolution: 44, pressureIters: 20, separationIters: 2 };

/**
 * The hero's only atmospheric layer: static fallback, liquid type, readability
 * overlay. Reduced motion settles the fluid and holds one still frame.
 */
export function HeroAtmosphere(): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const mobile = useMediaQuery("(max-width: 767px)");

  return (
    <div aria-hidden="true" className="hero-fallback absolute inset-0 -z-10">
      <LiquidAscii
        {...SHARED}
        {...(mobile ? MOBILE : DESKTOP)}
        paused={reduce}
        className="absolute inset-0"
      />
      <div className="hero-overlay absolute inset-0" />
    </div>
  );
}
