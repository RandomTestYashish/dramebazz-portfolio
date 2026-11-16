"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

/** Shared layout id: the role flies from the intro into the page title. */
export const ROLE_ID = "title-role";

const EASE = [0.22, 1, 0.36, 1] as const;

type Segment = { text: string; className?: string; role?: boolean };
type Line = { segments: Segment[]; hold: number; erase: boolean };

/** The typewriter script: each line types, holds, and (but the last) erases. */
const SCRIPT: Line[] = [
  { segments: [{ text: "Hi", className: "intro-hello" }], hold: 650, erase: true },
  {
    segments: [{ text: "My name is " }, { text: "Yashish", className: "intro-name" }],
    hold: 750,
    erase: true,
  },
  {
    segments: [
      { text: "I am a " },
      { text: "Product and Motion Designer", className: "intro-role", role: true },
    ],
    hold: 850,
    erase: false,
  },
];

const TYPE_MS = 46;
const ERASE_MS = 20;
const lengthOf = (l: Line): number => l.segments.reduce((n, s) => n + s.text.length, 0);

/**
 * Loading intro over the page background: a typewriter writes one short line
 * at a time ("Hi" → "My name is Yashish" → the role), erasing between them.
 * When the last line is done the role keeps its layout id and settles into
 * the page title.
 */
export function Intro({
  onDone,
  onSkip,
  soundSlot,
}: {
  onDone: () => void;
  onSkip: () => void;
  /** Optional control shown under the text (the sound toggle). */
  soundSlot?: ReactNode;
}): ReactNode {
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    void (async () => {
      await wait(420);
      for (let li = 0; li < SCRIPT.length; li++) {
        const line = SCRIPT[li];
        if (!line || cancelled) return;
        setLineIdx(li);
        const full = lengthOf(line);
        for (let n = 1; n <= full; n++) {
          if (cancelled) return;
          setTyped(n);
          // A touch of rhythm so it reads like typing, not a ticker.
          await wait(TYPE_MS + ((n * 7) % 3) * 9);
        }
        await wait(line.hold);
        if (line.erase) {
          for (let n = full - 1; n >= 0; n--) {
            if (cancelled) return;
            setTyped(n);
            await wait(ERASE_MS);
          }
          await wait(200);
        }
      }
      if (!cancelled) onDone();
    })();

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [onDone]);

  const line = SCRIPT[lineIdx] ?? SCRIPT[0];
  let left = typed;

  return (
    <motion.div
      className="intro"
      role="presentation"
      onClick={onSkip}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: EASE } }}
    >
      <p className="intro-text" aria-hidden="true">
        {line?.segments.map((seg, i) => {
          const shown = seg.text.slice(0, Math.max(0, left));
          left -= seg.text.length;
          // The role only takes its layout id once fully typed, so it
          // doesn't animate its own growth while the letters arrive.
          if (seg.role && shown.length === seg.text.length) {
            return (
              <motion.span key={i} layoutId={ROLE_ID} className={seg.className}>
                {shown}
              </motion.span>
            );
          }
          return (
            <span key={i} className={seg.className}>
              {shown}
            </span>
          );
        })}
        <span className="intro-caret" />
      </p>
      <span className="sr-only">
        Hi. My name is Yashish. I am a Product and Motion Designer.
      </span>
      <div className="intro-foot">
        {soundSlot}
        <span className="intro-skip">Tap anywhere to skip</span>
      </div>
    </motion.div>
  );
}
