"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { Ravine, type RavineProps } from "@/components/shaders/ravine";
import { useMediaQuery } from "@/lib/use-media-query";

// Tuned darker and slower than the stock look: a slow drift through a
// graphite canyon, never a fly-through.
const SHARED: RavineProps = {
  stepScale: 0.5,
  scale: 0.25,
  height: 0.8,
  spread: 34,
  wallCurve: 2.5,
  fade: 35,
  cameraHeight: 6,
  tilt: 0.06,
  roll: 0.02,
  fov: 0.9,
  nearColor: "#0a0a0a",
  farColor: "#6f6f6f",
  brightness: 0.65,
  contrast: 1.05,
  grain: 0.003,
};

const DESKTOP: RavineProps = { steps: 96, dpr: 1, speed: 0.1, pointerInfluence: 0.015 };
// Ray-march cost scales with steps x pixels, so phones get half of each.
const MOBILE: RavineProps = { steps: 48, dpr: 0.75, speed: 0.08, pointerInfluence: 0 };

/**
 * The hero's only atmospheric layer: static fallback, canyon, readability
 * overlay. Reduced motion renders a single still frame.
 */
export function HeroAtmosphere(): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const mobile = useMediaQuery("(max-width: 767px)");

  return (
    <div aria-hidden="true" className="ravine-fallback absolute inset-0 -z-10">
      <Ravine
        {...SHARED}
        {...(mobile ? MOBILE : DESKTOP)}
        paused={reduce}
        className="absolute inset-0"
      />
      <div className="hero-overlay absolute inset-0" />
    </div>
  );
}
