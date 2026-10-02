"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { profile } from "@/content";
import { duration, ease } from "@/lib/tokens";
import { ThemeToggle } from "./theme-toggle";
import { useActiveSection } from "./use-active-section";

const NAV_ITEMS = [
  { label: "Work", id: "work" },
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Contact", id: "contact" },
] as const;

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export function Nav(): ReactNode {
  const active = useActiveSection(SECTION_IDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Take the hero's dark palette while the hero sits under the nav band.
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOverHero(entry?.isIntersecting ?? false),
      { rootMargin: "0px 0px -92% 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onClick = (e: MouseEvent): void => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-(--z-nav) transition-colors duration-500 ${
        overHero ? "on-dark" : ""
      }`}
      // Solid at the top edge, fading out, so content passes under quietly.
      style={{
        background:
          overHero
            ? "linear-gradient(to bottom, rgb(8 8 8 / 0.35), transparent)"
            : "linear-gradient(to bottom, var(--background) 55%, transparent)",
      }}
    >
      <nav
        aria-label="Primary"
        className="container-page flex h-(--nav-height) items-center justify-between gap-6"
      >
        <a
          href="#top"
          className="text-[0.9375rem] font-semibold tracking-tight"
          aria-label={`${profile.name}, back to top`}
        >
          {profile.name}
          <span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="relative">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`relative inline-flex h-9 items-center px-3.5 text-sm transition-colors duration-300 ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="nav-indicator"
                      aria-hidden="true"
                      className="absolute inset-x-3.5 bottom-1 h-px bg-accent"
                      transition={{ duration: duration.base, ease: ease.out }}
                    />
                  ) : null}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <p className="mr-2 hidden items-center gap-2.5 text-sm text-muted-foreground lg:flex">
            <span
              aria-hidden="true"
              className={`status-dot relative size-1.5 rounded-pill ${
                profile.availability.open ? "bg-accent" : "bg-muted-foreground"
              }`}
            />
            {profile.availability.label}
          </p>
          <ThemeToggle />

          <div ref={menuRef} className="relative md:hidden">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 cursor-pointer items-center rounded-pill px-3 text-sm font-medium"
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  id="mobile-menu"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: duration.fast, ease: ease.out }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-media border border-line bg-background p-2 shadow-[0_16px_40px_-16px_rgb(21_21_20/0.25)]"
                >
                  <ul>
                    {NAV_ITEMS.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          onClick={() => setMenuOpen(false)}
                          aria-current={active === item.id ? "location" : undefined}
                          className="flex min-h-11 items-center justify-between px-3 text-[0.9375rem]"
                        >
                          {item.label}
                          {active === item.id ? (
                            <span aria-hidden="true" className="size-1.5 rounded-pill bg-accent" />
                          ) : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 flex items-center gap-2 border-t border-line px-3 pt-3 pb-1.5 text-xs text-muted-foreground">
                    <span aria-hidden="true" className="status-dot relative size-1.5 rounded-pill bg-accent" />
                    {profile.availability.label}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  );
}
