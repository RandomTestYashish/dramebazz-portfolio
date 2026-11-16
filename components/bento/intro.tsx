"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export type IntroPhase = "hello" | "line" | "done";

/** Shared layout ids: these two pieces fly from the intro into the title. */
export const NAME_ID = "title-name";
export const ROLE_ID = "title-role";

const EASE = [0.22, 1, 0.36, 1] as const;

const word = (i: number) => ({
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.55, ease: EASE, delay: i * 0.08 },
});

/**
 * Loading intro. The page background fills the screen and a sentence types
 * itself in: "Hello," first, then the rest. When it ends, the name and the
 * role keep their layout ids so they glide into the page title.
 */
export function Intro({
  phase,
  onSkip,
}: {
  phase: IntroPhase;
  onSkip: () => void;
}): ReactNode {
  const lead = ["my", "name", "is"];
  const mid = ["and", "I", "am", "a"];

  return (
    <motion.div
      className="intro"
      role="presentation"
      onClick={onSkip}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}
    >
      <p className="intro-text">
        <motion.span
          className="intro-hello"
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
        >
          Hello,
        </motion.span>{" "}
        {phase === "line" ? (
          <>
            {lead.map((w, i) => (
              <motion.span key={w} className="intro-word" {...word(i)}>
                {w}{" "}
              </motion.span>
            ))}
            <motion.span
              layoutId={NAME_ID}
              className="intro-name wordmark"
              {...word(lead.length)}
            >
              YASHISH
            </motion.span>{" "}
            {mid.map((w, i) => (
              <motion.span
                key={w}
                className="intro-word"
                {...word(lead.length + 1 + i)}
              >
                {w}{" "}
              </motion.span>
            ))}
            {/* The full stop rides inside the role so it never wraps alone. */}
            <motion.span
              layoutId={ROLE_ID}
              className="intro-role"
              {...word(lead.length + 1 + mid.length)}
            >
              Product and Motion Designer.
            </motion.span>
          </>
        ) : null}
      </p>
      <span className="intro-skip">Tap to skip</span>
    </motion.div>
  );
}
