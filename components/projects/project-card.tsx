"use client";

import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import type { PointerEvent, ReactNode } from "react";

import type { Project } from "@/content";
import { duration, ease, revealOffset, spring } from "@/lib/tokens";

export type ProjectLayout = "feature" | "tall" | "offset" | "wide" | "compact";

const LAYOUT: Record<
  ProjectLayout,
  { frame: string; ratio: string; sizes: string; body: string }
> = {
  // Full-width cinematic frame, details in a row beneath.
  feature: {
    frame: "md:col-span-12",
    ratio: "aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/10]",
    sizes: "100vw",
    body: "md:grid md:grid-cols-12 md:gap-x-6",
  },
  // Left of the pair: taller, wider column.
  tall: {
    frame: "md:col-span-7",
    ratio: "aspect-[4/5]",
    sizes: "(min-width: 768px) 58vw, 100vw",
    body: "",
  },
  // Right of the pair: narrower and dropped, so the two never line up.
  offset: {
    frame: "md:col-span-5 md:mt-40 lg:mt-64",
    ratio: "aspect-[3/4]",
    sizes: "(min-width: 768px) 42vw, 100vw",
    body: "",
  },
  // Horizontal case study: image and text side by side at desktop.
  wide: {
    frame: "md:col-span-12 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-6",
    ratio: "aspect-[4/3] md:aspect-[3/2]",
    sizes: "(min-width: 1024px) 66vw, 100vw",
    body: "",
  },
  // Supporting project, pushed toward the right edge.
  compact: {
    frame: "md:col-span-8 md:col-start-5 lg:col-span-6 lg:col-start-7",
    ratio: "aspect-[4/3]",
    sizes: "(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw",
    body: "",
  },
};

type ProjectCardProps = {
  project: Project;
  index: number;
  layout: ProjectLayout;
};

export function ProjectCard({ project, index, layout }: ProjectCardProps): ReactNode {
  const config = LAYOUT[layout];
  const number = String(index + 1).padStart(2, "0");
  const reduce = useReducedMotion();

  // Image drifts a few pixels toward the pointer while hovered.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useTransform(useSpring(px, spring.pointer), (v) => v * 14);
  const y = useTransform(useSpring(py, spring.pointer), (v) => v * 10);

  const onMove = (e: PointerEvent<HTMLElement>): void => {
    if (reduce || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    py.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };
  const onLeave = (): void => {
    px.set(0);
    py.set(0);
  };

  const visual = (
    <div
      className={`relative overflow-hidden rounded-media bg-surface ${config.ratio} ${
        layout === "wide" ? "lg:col-span-8" : ""
      }`}
    >
      <motion.div
        className="absolute -inset-4"
        style={reduce ? {} : { x, y }}
      >
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes={config.sizes}
          className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
        />
      </motion.div>
    </div>
  );

  const cta = (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={project.href ? "link-underline" : "text-muted-foreground"}>
        {project.href ? "View case study" : "Case study soon"}
      </span>
      {project.href ? (
        <ArrowUpRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:-translate-y-1"
        />
      ) : null}
    </span>
  );

  const meta = (
    <p className="meta flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
      <span>{project.disciplines.join(" / ")}</span>
      <span aria-hidden="true">{project.year}</span>
      <span className="sr-only">, {project.year}</span>
    </p>
  );

  const title = (
    <h3 className="text-h3 font-medium">
      <span className="mr-3 align-top font-mono text-sm font-normal tracking-normal text-accent">
        {number}
      </span>
      {project.title}
    </h3>
  );

  const body =
    layout === "feature" ? (
      <div className={`mt-6 flex flex-col gap-4 ${config.body}`}>
        <div className="md:col-span-5">{title}</div>
        <p className="max-w-[40ch] text-lead text-muted-foreground md:col-span-4">
          {project.summary}
        </p>
        <div className="flex flex-col gap-3 md:col-span-3 md:items-end md:text-right">
          {meta}
          {cta}
        </div>
      </div>
    ) : layout === "wide" ? (
      <div className="mt-6 flex flex-col gap-4 lg:col-span-4 lg:mt-0 lg:pb-1">
        {title}
        <p className="max-w-[40ch] text-lead text-muted-foreground">{project.summary}</p>
        {meta}
        <div className="mt-2">{cta}</div>
      </div>
    ) : (
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-6">
          {title}
          <span className="hidden shrink-0 pt-2 sm:block">{cta}</span>
        </div>
        <p className="max-w-[40ch] text-lead text-muted-foreground">{project.summary}</p>
        {meta}
        <span className="sm:hidden">{cta}</span>
      </div>
    );

  const Wrapper = project.href ? motion.a : motion.article;
  const linkProps = project.href ? { href: project.href } : {};

  return (
    <Wrapper
      {...linkProps}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={{ opacity: 0, y: revealOffset * 2 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: duration.reveal, ease: ease.out }}
      className={`group block ${config.frame}`}
    >
      {visual}
      {body}
    </Wrapper>
  );
}
