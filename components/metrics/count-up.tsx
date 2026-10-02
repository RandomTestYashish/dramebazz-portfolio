"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

import { ease } from "@/lib/tokens";

type CountUpProps = {
  value: number;
  decimals?: number;
};

/** Counts from zero once in view. Screen readers get the final value only. */
export function CountUp({ value, decimals = 0 }: CountUpProps): ReactNode {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  // Always start from 0 so server and client render the same text.
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (reduce) {
      count.set(value);
      return;
    }
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.6, ease: ease.out });
    return () => controls.stop();
  }, [inView, reduce, count, value]);

  return (
    <span ref={ref}>
      <span className="sr-only">{value.toFixed(decimals)}</span>
      <motion.span aria-hidden="true">{display}</motion.span>
    </span>
  );
}
