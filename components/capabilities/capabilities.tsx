import type { ReactNode } from "react";

import { capabilities, tools } from "@/content";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function Capabilities(): ReactNode {
  return (
    <section aria-labelledby="capabilities-title" className="container-page section-space">
      <div className="grid grid-cols-1 gap-y-14 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-12 lg:col-span-4">
          <SectionHeading
            id="capabilities-title"
            title="What I bring to a team."
            className="max-w-[12ch]"
          />
        </div>

        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 md:col-span-12 lg:col-span-8 lg:grid-cols-3">
          {capabilities.map((group, i) => (
            <Reveal
              key={group.name}
              delay={i * 0.08}
              // Stepped columns at desktop give the lists a reading rhythm.
              className={i === 1 ? "lg:mt-16" : i === 2 ? "lg:mt-32" : ""}
            >
              <h3 className="meta mb-5 flex items-center gap-3 text-accent">
                <span className="font-medium">{group.name}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </h3>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item} className="text-h3 font-medium text-balance">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="md:col-span-12 lg:col-span-8 lg:col-start-5">
          <p className="mt-6 border-t border-line pt-6 text-pretty text-muted-foreground lg:mt-10">
            <span className="mr-3 text-foreground">Daily tools</span>
            {tools.join(", ")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
