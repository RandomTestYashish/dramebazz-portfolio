"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useEffect, type ReactNode } from "react";

import { duration, ease, spring } from "@/lib/tokens";
import { useMediaQuery } from "@/lib/use-media-query";
import { PortraitMorph } from "./portrait-morph";

type HeroPortraitProps = {
  src: string;
  hoverSrc: string;
  alt: string;
};

/**
 * Portrait that leans toward the pointer and morphs to a second frame on hover.
 * Touch devices and reduced motion get the still image only: no WebGL, no tilt.
 */
export function HeroPortrait({ src, hoverSrc, alt }: HeroPortraitProps): ReactNode {
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const interactive = finePointer && !reduce;

  // Normalised pointer position across the viewport, -1..1.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, spring.pointer);
  const sy = useSpring(py, spring.pointer);
  const rotateY = useTransform(sx, [-1, 1], [-4, 4]);
  const rotateX = useTransform(sy, [-1, 1], [3, -3]);
  const x = useTransform(sx, [-1, 1], [-10, 10]);
  const y = useTransform(sy, [-1, 1], [-8, 8]);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent): void => {
      px.set((e.clientX / window.innerWidth) * 2 - 1);
      py.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, px, py]);

  return (
    <motion.figure
      initial={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: duration.slow * 1.2, delay: 0.35, ease: ease.out }}
      className="[perspective:1200px]"
    >
      <motion.div
        style={interactive ? { rotateX, rotateY, x, y } : {}}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-media bg-surface"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
        {interactive ? <PortraitMorph srcA={src} srcB={hoverSrc} /> : null}
      </motion.div>
    </motion.figure>
  );
}
