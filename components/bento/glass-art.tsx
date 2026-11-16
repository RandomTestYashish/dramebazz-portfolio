import { useId, type ReactNode } from "react";

export type GlassKind = "product" | "motion" | "ai";

/** Rounded-rectangle path. */
const rr = (x: number, y: number, w: number, h: number, r: number): string =>
  `M${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x + r}Q${x},${y + h} ${x},${y + h - r}V${y + r}Q${x},${y} ${x + r},${y}Z`;

/** Four-point sparkle path. */
const sparkle = (cx: number, cy: number, r: number): string => {
  const k = r * 0.16;
  return `M${cx},${cy - r}Q${cx + k},${cy - k} ${cx + r},${cy}Q${cx + k},${cy + k} ${cx},${cy + r}Q${cx - k},${cy + k} ${cx - r},${cy}Q${cx - k},${cy - k} ${cx},${cy - r}Z`;
};

const diamond = (cx: number, cy: number, r: number): string =>
  `M${cx},${cy - r}L${cx + r},${cy}L${cx},${cy + r}L${cx - r},${cy}Z`;

const circle = (cx: number, cy: number, r: number): string =>
  `M${cx - r},${cy}A${r},${r} 0 1 0 ${cx + r},${cy}A${r},${r} 0 1 0 ${cx - r},${cy}Z`;

type Piece = { d: string; tint: 0 | 1 | 2; className?: string };

/** Glass tints, drawn from the page accent (orange, pink, violet). */
const TINTS = [
  ["#ffb36b", "#ff7a3d"],
  ["#ff8ab4", "#ff4f8b"],
  ["#c79bff", "#7b3cff"],
] as const;

const ART: Record<GlassKind, { pieces: Piece[]; groups?: { transform: string; from: number; to: number }[] }> = {
  // Pencil and brush, crossed.
  product: {
    pieces: [
      // Brush (behind)
      { d: "M-7,-80Q0,-86 7,-80L10,16L-10,16Z", tint: 2 },
      { d: rr(-11, 16, 22, 18, 3), tint: 1 },
      { d: "M-11,34C-15,56 -6,74 0,84C6,74 15,56 11,34Z", tint: 0, className: "glass-tip" },
      // Pencil
      { d: rr(-15, -78, 30, 18, 6), tint: 1 },
      { d: rr(-15, -60, 30, 10, 2), tint: 2 },
      { d: rr(-15, -50, 30, 94, 3), tint: 0 },
      { d: "M-15,44L15,44L0,78Z", tint: 1 },
      { d: "M-5.5,66L5.5,66L0,79Z", tint: 2, className: "glass-tip" },
    ],
    groups: [
      { transform: "translate(104 102) rotate(36)", from: 0, to: 3 },
      { transform: "translate(98 100) rotate(-38)", from: 3, to: 8 },
    ],
  },
  // Keyframes on a timeline, with an easing curve.
  motion: {
    pieces: [
      { d: "M18,104C70,104 76,34 132,34H184V46H132C88,46 82,116 18,116Z", tint: 2 },
      { d: rr(14, 132, 172, 14, 7), tint: 1 },
      { d: diamond(46, 139, 15), tint: 0, className: "glass-key" },
      { d: diamond(100, 139, 26), tint: 1, className: "glass-key glass-key-main" },
      { d: diamond(154, 139, 15), tint: 2, className: "glass-key" },
      { d: diamond(184, 40, 11), tint: 0, className: "glass-key" },
    ],
  },
  // AI: a large sparkle with a small one and a spark.
  ai: {
    pieces: [
      { d: sparkle(92, 110, 66), tint: 2, className: "glass-spark" },
      { d: sparkle(158, 46, 26), tint: 1, className: "glass-spark glass-spark-2" },
      { d: circle(48, 40, 10), tint: 0, className: "glass-spark glass-spark-3" },
    ],
  },
};

/**
 * Illustration made of glass pieces: each shape gets an extruded back face,
 * a tinted translucent body, a sheen and a bright rim, so it reads as 3D
 * glass. The whole piece floats slowly in 3D (CSS).
 */
export function GlassArt({ kind }: { kind: GlassKind }): ReactNode {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const art = ART[kind];

  const piece = (p: Piece, i: number): ReactNode => (
    <g key={i} className={p.className}>
      <path d={p.d} fill={`url(#${uid}-depth${p.tint})`} transform="translate(4 7)" />
      <path d={p.d} fill={`url(#${uid}-body${p.tint})`} />
      <path d={p.d} fill={`url(#${uid}-sheen)`} />
      <path d={p.d} fill="none" stroke={`url(#${uid}-rim)`} strokeWidth={2.2} />
    </g>
  );

  const body = art.groups
    ? art.groups.map((g, gi) => (
        <g key={gi} transform={g.transform}>
          {art.pieces.slice(g.from, g.to).map((p, i) => piece(p, g.from + i))}
        </g>
      ))
    : art.pieces.map(piece);

  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className="bento-icon bento-glass" data-kind={kind}>
      <defs>
        {TINTS.map(([light, deep], t) => (
          <g key={t}>
            <linearGradient id={`${uid}-body${t}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="0.4" stopColor={light} stopOpacity="0.72" />
              <stop offset="1" stopColor={deep} stopOpacity="0.92" />
            </linearGradient>
            <linearGradient id={`${uid}-depth${t}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={deep} stopOpacity="0.55" />
              <stop offset="1" stopColor="#3b1a8c" stopOpacity="0.45" />
            </linearGradient>
          </g>
        ))}
        <radialGradient id={`${uid}-sheen`} cx="0.3" cy="0.2" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.85" />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#7b3cff" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#${uid}-shadow)`}>{body}</g>
    </svg>
  );
}
