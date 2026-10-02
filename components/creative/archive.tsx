"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

import { archive, type ArchiveItem } from "@/content";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Desktop collage placement, by position. Each slot also sets how far the
 * image drifts against the scroll, so the collage separates into depth.
 */
const SLOTS = [
  { place: "lg:col-span-3", drift: 30 },
  { place: "lg:col-span-5 lg:mt-32", drift: -40 },
  { place: "lg:col-span-4 lg:mt-8", drift: 50 },
  { place: "lg:col-span-3 lg:col-start-2 lg:mt-24", drift: -20 },
  { place: "lg:col-span-5 lg:col-start-6 lg:mt-40", drift: 40 },
] as const;

const RATIO: Record<ArchiveItem["ratio"], { aspect: string; width: string }> = {
  portrait: { aspect: "aspect-[3/4]", width: "w-[62vw] md:w-[34vw]" },
  landscape: { aspect: "aspect-[4/3]", width: "w-[80vw] md:w-[48vw]" },
  square: { aspect: "aspect-square", width: "w-[70vw] md:w-[40vw]" },
};

export function Archive(): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  const parallax = desktop && !reduce;

  return (
    <section
      ref={ref}
      aria-labelledby="archive-title"
      className="container-page section-space"
    >
      <div className="mb-14 flex flex-col gap-5 md:mb-20">
        <SectionHeading id="archive-title" title="Outside the work." />
        <Reveal>
          <p className="max-w-[44ch] text-lead text-muted-foreground">
            Photography, travel, music and small visual experiments. Most of my
            design ideas start here.
          </p>
        </Reveal>
      </div>

      {/* Below desktop: a swipeable strip that bleeds to the screen edge. */}
      <ul
        className="-mx-(--gutter) flex snap-x snap-mandatory scroll-px-(--gutter) gap-4 overflow-x-auto px-(--gutter) pb-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:snap-none lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0 lg:overflow-visible lg:px-0 lg:pb-0"
        aria-label="Personal archive"
      >
        {archive.map((item, i) => (
          <ArchiveFigure
            key={item.image}
            item={item}
            place={SLOTS[i]?.place ?? "lg:col-span-4"}
            drift={SLOTS[i]?.drift ?? 0}
            progress={scrollYProgress}
            parallax={parallax}
          />
        ))}
      </ul>
    </section>
  );
}

function ArchiveFigure({
  item,
  place,
  drift,
  progress,
  parallax,
}: {
  item: ArchiveItem;
  place: string;
  drift: number;
  progress: MotionValue<number>;
  parallax: boolean;
}): ReactNode {
  const y = useTransform(progress, [0, 1], [drift, -drift]);
  const ratio = RATIO[item.ratio];

  return (
    <li className={`shrink-0 snap-start ${ratio.width} lg:w-auto ${place}`}>
      <motion.figure style={parallax ? { y } : {}}>
        <Reveal amount={0.2}>
          <div className={`relative overflow-hidden rounded-media bg-surface ${ratio.aspect}`}>
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="object-cover"
            />
          </div>
          <figcaption className="meta mt-3 text-muted-foreground">
            {item.caption}
          </figcaption>
        </Reveal>
      </motion.figure>
    </li>
  );
}
