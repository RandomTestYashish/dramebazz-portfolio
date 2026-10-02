import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

import { profile, projects } from "@/content";
import { Reveal, SplitReveal } from "@/components/ui/reveal";
import { HeroPortrait } from "./hero-portrait";

export function Hero(): ReactNode {
  const headline = `${profile.headline.lead} ${profile.headline.emphasis}`;
  const emphasisFrom = profile.headline.lead.split(" ").length;

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="container-page flex flex-col pt-[calc(var(--nav-height)+clamp(2rem,7vh,5.5rem))] lg:min-h-dvh"
    >
      <div className="grid flex-1 grid-cols-1 content-start gap-x-6 gap-y-10 md:grid-cols-12 lg:content-stretch lg:gap-y-12">
        <div className="md:col-span-12 lg:col-span-8 lg:row-start-1">
          <Reveal>
            <p className="meta mb-6 text-muted-foreground lg:mb-8">
              {profile.discipline}
            </p>
          </Reveal>
          <h1 id="hero-title" className="text-display font-medium text-balance">
            <SplitReveal
              text={headline}
              emphasisFrom={emphasisFrom}
              delay={0.1}
              immediate
            />
          </h1>
        </div>

        <Reveal
          delay={0.55}
          className="flex flex-col gap-8 md:col-span-7 md:self-end lg:col-span-5 lg:row-start-2"
        >
          <p className="max-w-[34ch] text-lead text-pretty text-muted-foreground">
            <span className="text-foreground">{profile.intro}</span>{" "}
            Currently {profile.currently.charAt(0).toLowerCase()}
            {profile.currently.slice(1)}.
          </p>
          <a
            href="#work"
            className="group inline-flex h-12 w-fit items-center gap-3 rounded-pill bg-foreground pr-2 pl-6 text-[0.9375rem] font-medium text-background transition-transform duration-300 active:scale-[0.98]"
          >
            View work
            <span className="inline-flex size-8 items-center justify-center rounded-pill bg-background/10 transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5">
              <ArrowDown aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </span>
          </a>
        </Reveal>

        <div className="md:col-span-5 md:col-start-8 md:row-start-2 md:self-end lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1">
          <HeroPortrait
            src={profile.portrait.src}
            hoverSrc={profile.portrait.hoverSrc}
            alt={profile.portrait.alt}
          />
        </div>
      </div>

      <Reveal
        delay={0.8}
        amount={0}
        className="mt-12 flex items-center justify-between gap-6 border-t border-line py-5 text-sm text-muted-foreground"
      >
        <span>Selected work, {projects.at(-1)?.year} to {projects[0]?.year}</span>
        <a href="#work" className="link-underline hover:text-foreground">
          {String(projects.length).padStart(2, "0")} projects
        </a>
      </Reveal>
    </section>
  );
}
