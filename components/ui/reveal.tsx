"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { duration, ease, revealOffset, stagger } from "@/lib/tokens";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Fraction of the element that must be visible before it reveals. */
  amount?: number;
};

/** Fades and lifts content in once, when it first enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.25,
}: RevealProps): ReactNode {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: revealOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: duration.reveal, delay, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}

type SplitRevealProps = {
  text: string;
  className?: string;
  /** Words from this index on get the accent treatment. */
  emphasisFrom?: number;
  delay?: number;
  /** Animate on mount instead of on scroll (used above the fold). */
  immediate?: boolean;
};

/**
 * Word-by-word masked reveal for display headlines. The full string is
 * exposed once to assistive tech; the animated words are hidden from it.
 */
export function SplitReveal({
  text,
  className,
  emphasisFrom,
  delay = 0,
  immediate = false,
}: SplitRevealProps): ReactNode {
  const words = text.split(" ");
  const trigger = immediate
    ? { animate: "visible" }
    : { whileInView: "visible", viewport: { once: true, amount: 0.4 } };

  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger.words, delayChildren: delay }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            // Bottom padding keeps descenders clear of the mask.
            className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top"
          >
            <motion.span
              className={`inline-block ${
                emphasisFrom !== undefined && i >= emphasisFrom
                  ? "text-accent"
                  : ""
              }`}
              variants={{
                hidden: { y: "105%" },
                visible: { y: "0%" },
              }}
              transition={{ duration: duration.slow, ease: ease.out }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </motion.span>
  );
}
