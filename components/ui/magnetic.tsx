"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

import { spring } from "@/lib/tokens";

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** How far the element follows the pointer, as a fraction of the offset. */
  strength?: number;
};

/** Pulls its child gently toward a fine pointer. Inert on touch and reduced motion. */
export function Magnetic({
  children,
  className,
  strength = 0.25,
}: MagneticProps): ReactNode {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), spring.magnetic);
  const y = useSpring(useMotionValue(0), spring.magnetic);

  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (reduce || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = (): void => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}
