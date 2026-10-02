import type { ReactNode } from "react";

import { projects } from "@/content";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard, type ProjectLayout } from "./project-card";

/**
 * Composition is assigned by position so the content file stays layout-free.
 * Projects beyond the sequence fall back to the compact layout.
 */
const SEQUENCE: ProjectLayout[] = ["feature", "tall", "offset", "wide", "compact"];

export function SelectedWork(): ReactNode {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="container-page section-space"
    >
      <header className="mb-16 flex flex-col gap-6 md:mb-24">
        <p className="meta text-muted-foreground">Selected work</p>
        <SectionHeading
          id="work-title"
          title="Products, experiences and systems I've helped shape."
          className="max-w-[18ch]"
        />
      </header>

      <div className="grid grid-cols-1 gap-x-6 gap-y-20 md:grid-cols-12 md:gap-y-28 lg:gap-y-40">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            layout={SEQUENCE[i] ?? "compact"}
          />
        ))}
      </div>

      <Reveal className="mt-20 md:mt-28">
        <p className="max-w-[44ch] text-lead text-muted-foreground">
          More work, including confidential projects, is available on request.{" "}
          <a href="#contact" className="link-underline text-foreground">
            Contact
          </a>
        </p>
      </Reveal>
    </section>
  );
}
