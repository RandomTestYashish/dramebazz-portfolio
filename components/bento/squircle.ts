/**
 * Apple-style continuous corners ("corner smoothing 100%" in Figma).
 *
 * Browsers with CSS `corner-shape` draw these natively (see globals.css).
 * Everywhere else this builds the same outline as an SVG path, using the
 * corner-smoothing construction Figma documents, and clips each card to it.
 */

const rad = (deg: number): number => (deg * Math.PI) / 180;

/** Outline of a w x h box with radius r and smoothing s (0..1). */
export function squirclePath(w: number, h: number, r: number, s = 1): string {
  const budget = Math.min(w, h) / 2;
  const R = Math.min(r, budget);
  if (R <= 0) return `M0 0H${w}V${h}H0Z`;

  // Smoothing borrows straight edge; cap it when the box is too small.
  const smooth = Math.min(s, budget / R - 1);
  const p = Math.min((1 + s) * R, budget);
  const arc = 90 * (1 - smooth);
  const L = Math.sin(rad(arc / 2)) * R * Math.SQRT2;
  const alpha = (90 - arc) / 2;
  const p3p4 = R * Math.tan(rad(alpha / 2));
  const beta = 45 * smooth;
  const c = p3p4 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - L - c - d) / 3;
  const a = 2 * b;
  const ab = a + b;
  const abc = a + b + c;
  const f = (n: number): string => n.toFixed(2);

  return [
    `M${f(w - p)} 0`,
    `c${f(a)} 0 ${f(ab)} 0 ${f(abc)} ${f(d)}`,
    `a${f(R)} ${f(R)} 0 0 1 ${f(L)} ${f(L)}`,
    `c${f(d)} ${f(c)} ${f(d)} ${f(b + c)} ${f(d)} ${f(abc)}`,
    `L${f(w)} ${f(h - p)}`,
    `c0 ${f(a)} 0 ${f(ab)} ${f(-d)} ${f(abc)}`,
    `a${f(R)} ${f(R)} 0 0 1 ${f(-L)} ${f(L)}`,
    `c${f(-c)} ${f(d)} ${f(-(b + c))} ${f(d)} ${f(-abc)} ${f(d)}`,
    `L${f(p)} ${f(h)}`,
    `c${f(-a)} 0 ${f(-ab)} 0 ${f(-abc)} ${f(-d)}`,
    `a${f(R)} ${f(R)} 0 0 1 ${f(-L)} ${f(-L)}`,
    `c${f(-d)} ${f(-c)} ${f(-d)} ${f(-(b + c))} ${f(-d)} ${f(-abc)}`,
    `L0 ${f(p)}`,
    `c0 ${f(-a)} 0 ${f(-ab)} ${f(d)} ${f(-abc)}`,
    `a${f(R)} ${f(R)} 0 0 1 ${f(L)} ${f(-L)}`,
    `c${f(c)} ${f(-d)} ${f(b + c)} ${f(-d)} ${f(abc)} ${f(-d)}`,
    "Z",
  ].join("");
}

export const nativeSquircle = (): boolean =>
  typeof CSS !== "undefined" && CSS.supports("corner-shape", "squircle");

/**
 * Fallback: clip every `.bento-card` under root to a smoothed outline and
 * draw its hairline with the card's `.sq-edge` svg. Returns a cleanup.
 */
export function applySquircles(root: HTMLElement): () => void {
  root.dataset.squircle = "js";
  const cards = [...root.querySelectorAll<HTMLElement>(".bento-card")];

  const shape = (card: HTMLElement): void => {
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    if (!w || !h) return;
    const r = parseFloat(getComputedStyle(card).getPropertyValue("--sq-r")) || 24;
    const d = squirclePath(w, h, r);
    card.style.clipPath = `path("${d}")`;
    const edge = card.querySelector<SVGSVGElement>(":scope > .sq-edge");
    if (edge) {
      edge.setAttribute("viewBox", `0 0 ${w} ${h}`);
      edge.querySelector("path")?.setAttribute("d", d);
    }
  };

  const ro = new ResizeObserver((entries) => {
    for (const e of entries) shape(e.target as HTMLElement);
  });
  for (const card of cards) {
    shape(card);
    ro.observe(card);
  }
  return () => {
    ro.disconnect();
    delete root.dataset.squircle;
    for (const card of cards) card.style.clipPath = "";
  };
}
