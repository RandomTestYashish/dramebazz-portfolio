import type { ReactNode } from "react";

import { profile } from "@/content";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Portrait } from "./portrait";

// PLACEHOLDER copy: rewrite in your own voice.
const STATEMENT =
  "Designing at the intersection of product, technology and culture.";

const APPROACH = [
  "I work best where the problem is still fuzzy. I start with the people using the product and the business it has to serve, then shape that into flows, systems and interfaces a team can actually ship.",
  "Good design feels obvious in hindsight. Most of my time goes into the parts nobody notices: edge cases, empty states, the second visit, the moment something goes wrong.",
];

export function About(): ReactNode {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="container-page section-space"
    >
      <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-6 lg:gap-y-20">
        <SectionHeading
          id="about-title"
          title={STATEMENT}
          className="md:col-span-11 lg:col-span-10"
        />
        <Reveal className="w-2/3 md:col-span-5 md:w-full lg:col-span-4">
          <Portrait
            src={profile.portrait.src}
            hoverSrc={profile.portrait.hoverSrc}
            alt={profile.portrait.alt}
          />
        </Reveal>
        <div className="flex flex-col gap-6 md:col-span-7 md:col-start-6 md:self-end lg:col-span-5 lg:col-start-7">
          {APPROACH.map((paragraph, i) => (
            <Reveal key={paragraph} delay={i * 0.08}>
              <p
                className={`text-lead text-pretty ${
                  i === 0 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
