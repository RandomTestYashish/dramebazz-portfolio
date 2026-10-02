import { ArrowDown, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { profile } from "@/content";
import { Reveal, SplitReveal } from "@/components/ui/reveal";
import { HeroAtmosphere } from "./hero-atmosphere";

/**
 * A dark surface in both themes: the canyon sits behind, the copy reads first,
 * and the foot of the section dissolves into the page.
 */
export function Hero(): ReactNode {
  const headline = `${profile.headline.lead} ${profile.headline.emphasis}`;
  const emphasisFrom = profile.headline.lead.split(" ").length;

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="on-dark relative isolate flex min-h-[78svh] flex-col overflow-hidden md:min-h-[86svh] lg:min-h-[94svh]"
    >
      <HeroAtmosphere />

      <div className="container-page flex flex-1 flex-col justify-end pt-[calc(var(--nav-height)+3rem)] pb-12 md:pb-16">
        <Reveal>
          <p className="meta inline-flex h-7 items-center rounded-pill border border-line px-3 text-foreground/80">
            {profile.role}
          </p>
        </Reveal>

        <h1
          id="hero-title"
          className="mt-6 max-w-[17ch] text-hero font-medium text-balance md:mt-8"
        >
          <SplitReveal text={headline} emphasisFrom={emphasisFrom} delay={0.15} immediate />
        </h1>

        <Reveal delay={0.6} className="mt-6 md:mt-8">
          <p className="text-lead text-muted-foreground">{profile.discipline}</p>
        </Reveal>

        <Reveal delay={0.75} className="mt-10 flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href="#work"
            className="group inline-flex h-12 items-center gap-3 rounded-pill bg-foreground pr-2 pl-5 sm:pl-6 text-[0.9375rem] font-medium text-background transition-transform duration-300 active:scale-[0.98]"
          >
            View selected work
            <span className="inline-flex size-8 items-center justify-center rounded-pill bg-background/10 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5">
              <ArrowRight aria-hidden="true" strokeWidth={1.5} className="size-4" />
            </span>
          </a>
          <a
            href="#about"
            className="inline-flex h-12 items-center rounded-pill border border-foreground/25 px-5 sm:px-6 text-[0.9375rem] font-medium transition-colors duration-300 hover:border-foreground/60 hover:bg-foreground/5 active:scale-[0.98]"
          >
            About me
          </a>
        </Reveal>
      </div>

      <Reveal delay={0.95} amount={0} className="container-page">
        <div className="flex items-center justify-between gap-6 border-t border-line py-5 text-sm text-muted-foreground">
          <span>Currently {profile.currently}</span>
          <a
            href="#about"
            aria-label="Skip to introduction"
            className="inline-flex size-11 items-center justify-center rounded-pill border border-line bg-background transition-colors hover:border-foreground/60 hover:text-foreground"
          >
            <ArrowDown aria-hidden="true" strokeWidth={1.5} className="size-4" />
          </a>
        </div>
      </Reveal>

      {/* Dark to page ground, so the canyon never ends on a hard edge. */}
      <div aria-hidden="true" className="hero-fade h-[clamp(4rem,12svh,8rem)]" />
    </section>
  );
}
