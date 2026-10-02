import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
};

/** Text link with a hairline underline and an arrow that nudges on hover. */
export function ArrowLink({
  href,
  children,
  external = false,
  className,
}: ArrowLinkProps): ReactNode {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group inline-flex min-h-11 items-center gap-1.5 ${className ?? ""}`}
    >
      <span className="link-underline">{children}</span>
      <ArrowUpRight
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      {external ? <span className="sr-only">(opens in a new tab)</span> : null}
    </a>
  );
}
