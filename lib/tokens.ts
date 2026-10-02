/**
 * Motion tokens for JS-driven animation. CSS mirrors these in globals.css
 * (--ease-out, --duration-*). Keep the two in sync.
 */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const duration = {
  fast: 0.25,
  base: 0.6,
  slow: 1,
  reveal: 0.9,
};

export const stagger = {
  words: 0.06,
  items: 0.08,
};

/** Distance content travels when it reveals on scroll, in px. */
export const revealOffset = 28;

export const spring = {
  /** Pointer-follow: soft and quick to settle, never bouncy. */
  pointer: { stiffness: 150, damping: 20, mass: 0.4 },
  magnetic: { stiffness: 220, damping: 18, mass: 0.5 },
};
