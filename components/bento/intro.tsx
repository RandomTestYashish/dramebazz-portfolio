"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export type IntroPhase = "hi" | "name" | "role" | "done";

/** Shared layout id: the role flies from the intro into the page title. */
export const ROLE_ID = "title-role";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Each line rises in out of a blur and drifts up and away. */
const line = {
  initial: { opacity: 0, y: 16, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(8px)" },
  transition: { duration: 0.5, ease: EASE },
} as const;

/**
 * Loading intro over the page background, one short line at a time:
 * "Hi" → "My name is Yashish" → "I am a Product and Motion Designer".
 * The last line's role keeps a layout id, so it settles into the title.
 */
export function Intro({
  phase,
  onSkip,
}: {
  phase: IntroPhase;
  onSkip: () => void;
}): ReactNode {
  return (
    <motion.div
      className="intro"
      role="presentation"
      onClick={onSkip}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE } }}
    >
      <AnimatePresence mode="wait">
        {phase === "hi" ? (
          <motion.p key="hi" className="intro-text" {...line}>
            <span className="intro-hello">Hi</span>
          </motion.p>
        ) : null}
        {phase === "name" ? (
          <motion.p key="name" className="intro-text" {...line}>
            My name is <span className="intro-name">Yashish</span>
          </motion.p>
        ) : null}
        {phase === "role" ? (
          <motion.p key="role" className="intro-text" {...line}>
            I am a{" "}
            <motion.span layoutId={ROLE_ID} className="intro-role">
              Product and Motion Designer
            </motion.span>
          </motion.p>
        ) : null}
      </AnimatePresence>
      <span className="intro-skip">Tap to skip</span>
    </motion.div>
  );
}
