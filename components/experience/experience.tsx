import type { ReactNode } from "react";

import { experience } from "@/content";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Experience(): ReactNode {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="container-page section-space"
    >
      <SectionHeading
        id="experience-title"
        title="Where I've been building."
        className="mb-14 md:mb-20"
      />

      {/* Mobile: a vertical rule with markers. Desktop: wide editorial rows. */}
      <ol className="relative border-l border-line pl-6 md:border-l-0 md:pl-0">
        {experience.map((role, i) => {
          const current = role.end.toLowerCase() === "present";
          return (
            <li key={`${role.company}-${role.start}`}>
              <Reveal delay={i * 0.06}>
                <div
                  tabIndex={0}
                  className="role-row group relative grid grid-cols-1 gap-y-3 py-8 outline-none md:grid-cols-12 md:gap-x-6 md:border-t md:border-line md:py-10 lg:py-12"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-10 -left-[1.6875rem] size-2 rounded-pill md:hidden ${
                      current ? "bg-accent" : "border border-line bg-background"
                    }`}
                  />
                  <p className="md:col-span-4 lg:col-span-5">
                    <span className="block text-h2 font-medium tabular-nums transition-[color,translate] duration-500 ease-out-expo group-hover:text-accent group-focus-visible:text-accent lg:group-hover:translate-x-2">
                      {role.start}
                    </span>
                    <span className="meta mt-2 block text-muted-foreground">
                      {current ? "To present" : `To ${role.end}`}
                    </span>
                  </p>
                  <div className="md:col-span-8 lg:col-span-7">
                    <h3 className="text-h3 font-medium">{role.title}</h3>
                    <p className="mt-1 text-lead text-muted-foreground">{role.company}</p>
                    <div className="role-detail">
                      <div className="overflow-hidden">
                        <p className="max-w-[52ch] pt-4 text-pretty text-muted-foreground">
                          {role.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="hidden border-t border-line md:block" />
    </section>
  );
}
