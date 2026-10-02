import type { ReactNode } from "react";

import { SplitReveal } from "./reveal";

type SectionHeadingProps = {
  id: string;
  title: string;
  /** Small figure set beside the title, e.g. a count. */
  aside?: string;
  className?: string;
};

export function SectionHeading({
  id,
  title,
  aside,
  className,
}: SectionHeadingProps): ReactNode {
  return (
    <h2
      id={id}
      className={`text-h2 font-medium text-balance ${className ?? ""}`}
    >
      <SplitReveal text={title} />
      {aside ? (
        <sup className="meta ml-2 align-top text-muted-foreground">{aside}</sup>
      ) : null}
    </h2>
  );
}
