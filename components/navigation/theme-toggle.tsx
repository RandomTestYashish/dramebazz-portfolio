"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore, type MouseEvent, type ReactNode } from "react";

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle(): ReactNode {
  const mounted = useIsMounted();
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = mounted && resolvedTheme === "dark";

  const toggle = (event: MouseEvent<HTMLButtonElement>): void => {
    const next = isDark ? "light" : "dark";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof document.startViewTransition !== "function" || reduce) {
      setTheme(next);
      return;
    }

    // Reveal the new theme as a circle growing from the toggle.
    const rect = event.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );
    const root = document.documentElement;
    root.style.setProperty("--theme-cx", `${cx}px`);
    root.style.setProperty("--theme-cy", `${cy}px`);
    root.style.setProperty("--theme-r", `${radius}px`);
    root.dataset.themeAnim = "1";

    document
      .startViewTransition(() => setTheme(next))
      .finished.finally(() => {
        delete root.dataset.themeAnim;
      });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-pill text-foreground transition-colors hover:bg-foreground/5"
    >
      <span aria-hidden="true" className="relative size-4">
        <Sun
          strokeWidth={1.5}
          className={`absolute inset-0 size-4 transition-all duration-300 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          strokeWidth={1.5}
          className={`absolute inset-0 size-4 transition-all duration-300 ${
            mounted && !isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
