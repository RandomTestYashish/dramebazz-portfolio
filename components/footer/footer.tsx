import type { ReactNode } from "react";

import { profile, socialLinks } from "@/content";

export function Footer(): ReactNode {
  const year = 2026;

  return (
    <footer className="container-page border-t border-line">
      <div className="grid grid-cols-2 gap-y-4 py-8 text-sm text-muted-foreground md:grid-cols-3 md:items-center">
        <p className="font-medium text-foreground">
          {profile.name}
          <span className="text-accent">.</span>
        </p>
        <p className="order-3 col-span-2 md:order-none md:col-span-1 md:text-center">
          Designed &amp; built with intention.
        </p>
        <p className="text-right">&copy; {year}</p>
      </div>
      <ul className="flex flex-wrap gap-x-6 border-t border-line pb-6 text-sm">
        {socialLinks.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              {link.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </a>
          </li>
        ))}
        <li className="ml-auto">
          <a
            href="#top"
            className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to top
          </a>
        </li>
      </ul>
    </footer>
  );
}
