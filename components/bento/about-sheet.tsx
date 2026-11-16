"use client";

import { ArrowRight, ArrowUpRight, Camera, Download, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import { about, type Run } from "@/content/about";
import { asset } from "@/lib/asset";
import { DotMatrix } from "./dot-matrix";

const runs = (items: Run[]): ReactNode =>
  items.map((r, i) =>
    typeof r === "string" ? (
      <span key={i}>{r}</span>
    ) : "em" in r ? (
      <em key={i}>{r.em}</em>
    ) : (
      <strong key={i}>{r.b}</strong>
    )
  );

/** Local paths go through the base path; mailto and web links don't. */
const href = (h: string): string => (h.startsWith("/") ? asset(h) : h);

/**
 * About, laid out like a one-page portfolio (hero, experience table,
 * approach cards, quote, contact, footer) inside a full-width pop-up that
 * scrolls on its own. Nothing navigates away; the cross closes it.
 */
export function AboutSheet({
  onClose,
  photos,
  theme,
}: {
  onClose: () => void;
  photos: string[];
  theme: "light" | "dark";
}): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep Tab inside the sheet.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== "Tab" || !sheetRef.current) return;
    const f = sheetRef.current.querySelectorAll<HTMLElement>("button, a[href]");
    const first = f[0];
    const last = f[f.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Section links scroll inside the pop-up, never the page.
  const go = (id: string): void => {
    const box = scrollRef.current;
    const target = box?.querySelector<HTMLElement>(`#ab-${id}`);
    if (!box || !target) return;
    box.scrollTo({
      top: target.offsetTop - 90,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const { experience: ex, approach: ap, contact: ct } = about;

  return (
    <motion.div
      className="ab-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        data-lenis-prevent
        className="ab-sheet outline-none"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 170, damping: 24 }}
      >
        <div ref={scrollRef} className="ab-scroll">
          {/* Sticky in-sheet nav */}
          <nav className="ab-nav" aria-label="About sections">
            <button
              type="button"
              className="ab-brand"
              onClick={() => go("top")}
            >
              Yashish<span>.</span>
            </button>
            <div className="ab-links">
              <button type="button" onClick={() => go("experience")}>
                Experience
              </button>
              <button type="button" onClick={() => go("approach")}>
                Approach
              </button>
              <button type="button" onClick={() => go("contact")}>
                Contact
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ab-close"
            >
              <X strokeWidth={2.4} className="size-5" />
            </button>
          </nav>

          {/* Hero */}
          <section id="ab-top" className="ab-hero">
            <div className="ab-hero-copy">
              <p className="ab-eyebrow">{about.eyebrow}</p>
              <h2 id={titleId} className="ab-display">
                {runs(about.headline)}
              </h2>
              <p className="ab-lede">{runs(about.intro)}</p>
            </div>
            <div className="ab-portrait">
              <div className="ab-portrait-screen">
                <DotMatrix srcs={photos} theme={theme} />
              </div>
              <div className="ab-portrait-card">
                <p className="ab-portrait-name">{about.card.name}</p>
                <p className="ab-mono">{about.card.meta}</p>
                <p className="ab-mono ab-accent">{about.card.since}</p>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section id="ab-experience" className="ab-section">
            <div className="ab-head-row">
              <div>
                <h3 className="ab-h2">{runs(ex.title)}</h3>
                <p className="ab-sub">{ex.sub}</p>
              </div>
              <a
                className="ab-outline-btn"
                href={href(ex.resume)}
                target="_blank"
                rel="noreferrer"
              >
                <Download aria-hidden="true" className="size-4" />
                Download resume
              </a>
            </div>
            <div className="ab-table" role="table" aria-label="Experience">
              <div className="ab-tr ab-th" role="row">
                <span role="columnheader">Company</span>
                <span role="columnheader">Role</span>
                <span role="columnheader">Years</span>
                <span role="columnheader">Focus</span>
                <span role="columnheader">Work</span>
              </div>
              {ex.roles.map((r) => (
                <div key={r.company} className="ab-tr" role="row">
                  <span role="cell" className="ab-co">
                    <i
                      aria-hidden="true"
                      style={{
                        background: `linear-gradient(150deg, ${r.colors[0]}, ${r.colors[1]})`,
                      }}
                    >
                      {r.mark}
                    </i>
                    {r.company}
                  </span>
                  <span role="cell">{r.role}</span>
                  <span
                    role="cell"
                    className={`ab-mono ${r.current ? "ab-accent" : ""}`}
                  >
                    {r.years}
                  </span>
                  <span role="cell" className="ab-muted">
                    {r.focus}
                  </span>
                  <span role="cell">
                    {r.cases ? (
                      <span className="ab-pill">
                        {r.cases} case {r.cases === 1 ? "study" : "studies"}
                      </span>
                    ) : (
                      <span className="ab-muted">—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Approach */}
          <section id="ab-approach" className="ab-section">
            <h3 className="ab-h2">{runs(ap.title)}</h3>
            <p className="ab-sub">{ap.sub}</p>
            <div className="ab-cards">
              {ap.cards.map((c, i) => (
                <article key={c.title} className="ab-card">
                  <span className="ab-mono ab-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4>{c.title}</h4>
                  <p>{c.body}</p>
                </article>
              ))}
            </div>
            <div className="ab-row-card">
              <span className="ab-row-icon" aria-hidden="true">
                <Camera className="size-5" />
              </span>
              <span>
                <strong>{ap.aside.title}</strong>
                <span className="ab-muted">{ap.aside.body}</span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="ab-row-arrow size-5"
              />
            </div>
            <blockquote className="ab-quote">
              <span aria-hidden="true">&ldquo;</span>
              <p>
                {about.quote.lead} <em>{about.quote.rest}</em>
              </p>
            </blockquote>
          </section>

          {/* Contact */}
          <section id="ab-contact" className="ab-section">
            <p className="ab-eyebrow">{ct.eyebrow}</p>
            <h3 className="ab-h2">{runs(ct.title)}</h3>
            <p className="ab-sub">{ct.sub}</p>
            <div className="ab-socials">
              {ct.links.map((l) => (
                <a
                  key={l.label}
                  href={href(l.href)}
                  target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="ab-social"
                >
                  <span>
                    <strong>{l.label}</strong>
                    <span className="ab-mono">{l.handle}</span>
                  </span>
                  <ArrowRight aria-hidden="true" className="size-5" />
                </a>
              ))}
            </div>
          </section>

          <footer className="ab-footer">
            <span>
              © {new Date().getFullYear()} {about.footer}
            </span>
            <button type="button" onClick={() => go("top")}>
              Back to top ↑
            </button>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  );
}
