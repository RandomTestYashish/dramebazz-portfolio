"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";

import { useMediaQuery } from "@/lib/use-media-query";
import { PortraitMorph } from "./portrait-morph";

type PortraitProps = {
  src: string;
  hoverSrc: string;
  alt: string;
};

/**
 * Portrait with a hover morph to its second frame. The WebGL layer only exists
 * for fine pointers without reduced motion, and only draws while morphing.
 */
export function Portrait({ src, hoverSrc, alt }: PortraitProps): ReactNode {
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-media bg-surface">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 34vw, 66vw"
        className="object-cover"
      />
      {finePointer && !reduce ? <PortraitMorph srcA={src} srcB={hoverSrc} /> : null}
    </div>
  );
}
