"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section crossing the middle of the viewport.
 * IntersectionObserver keeps this off the scroll event.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Last in document order wins when two overlap the band.
        const current = [...ids].reverse().find((id) => visible.has(id));
        setActive(current ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
