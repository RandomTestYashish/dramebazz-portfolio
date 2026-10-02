import type { ReactNode } from "react";

import { metrics } from "@/content";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { CountUp } from "./count-up";

export function Metrics(): ReactNode {
  return (
    <section aria-labelledby="impact-title" className="container-page section-space">
      <SectionHeading
        id="impact-title"
        title="Work measured in people, not pixels."
        className="mb-16 max-w-[16ch] md:mb-24"
      />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-6 lg:grid-cols-12 lg:gap-y-24">
        {metrics.map((metric, i) => (
          <Reveal
            key={metric.label}
            delay={(i % 2) * 0.1}
            // Desktop: two staggered pairs. Odd items step down and in.
            className={`flex flex-col border-t border-line pt-5 ${
              i % 2 === 0
                ? "lg:col-span-5"
                : "lg:col-span-5 lg:col-start-7 lg:mt-24"
            }`}
          >
              <dt className="order-2 mt-4 text-[0.9375rem] font-medium md:text-lead">
                {metric.label}
              </dt>
              <dd className="order-1 text-figure font-medium tabular-nums">
                {metric.prefix ? (
                  <span className="text-accent">{metric.prefix}</span>
                ) : null}
                <CountUp value={metric.value} {...(metric.decimals ? { decimals: metric.decimals } : {})} />
                {metric.suffix}
              </dd>
              <dd className="order-3 mt-1 max-w-[30ch] text-sm text-pretty text-muted-foreground">
                {metric.context}
              </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
