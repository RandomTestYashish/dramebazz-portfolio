"use client";

import {
  ArrowUpRight,
  Layers,
  Moon,
  Pause,
  Play,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion as m } from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { PanelSheet } from "@/components/scene/panel-sheet";
import { panels, type PanelId } from "@/content/scene";
import { DotMatrix } from "./dot-matrix";
import { Intro, NAME_ID, ROLE_ID, type IntroPhase } from "./intro";
import { applySquircles, nativeSquircle } from "./squircle";

type OpenFn = (id: PanelId, from: HTMLElement) => void;
type Theme = "light" | "dark";

const THEME_KEY = "bento-theme";

/* Theme lives in localStorage (a per-viewer convenience), read through a
   tiny external store so server and first client render agree on "light". */
const subscribeTheme = (cb: () => void): (() => void) => {
  window.addEventListener(THEME_KEY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(THEME_KEY, cb);
    window.removeEventListener("storage", cb);
  };
};
const readTheme = (): Theme => {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};
const serverTheme = (): Theme => "light";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (cb: () => void): (() => void) => {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const readReduce = (): boolean => window.matchMedia(REDUCE_QUERY).matches;
const serverReduce = (): boolean => true;

/** Reset a card's tilt. */
const untilt = (card: HTMLElement): void => {
  card.style.removeProperty("--rx");
  card.style.removeProperty("--ry");
  delete card.dataset.tilt;
};

/** Hairline for the squircle fallback (hidden where CSS draws it natively). */
function SquircleEdge(): ReactNode {
  return (
    <svg aria-hidden="true" className="sq-edge" preserveAspectRatio="none">
      <path />
    </svg>
  );
}

/** Each tile carries one icon, drawn in dots (same language as the screen). */
const WORK: { id: PanelId; icon: LucideIcon }[] = [
  { id: "product", icon: Layers },
  { id: "motion", icon: Play },
  { id: "ai", icon: Sparkles },
];

/** First sentence of a panel intro, as a card description. */
const firstLine = (text: string): string => text.split(/(?<=\.)\s/)[0] ?? text;

/** Dial detents: three positions, like a real stepped dial. */
const MOTION_LABEL = ["Breathe", "Wave", "Still"] as const;
const DENSITY_LABEL = ["High", "Ultra", "Medium"] as const;
const TONE_LABEL = ["Ink", "Accent", "Duo"] as const;

/** Photos on the player screen, switched in a loop by the dots. */
const PHOTOS = ["/scene/photo-1.webp", "/scene/photo-2.webp"];

const SETTLE = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const;

const delay = (i: number): CSSProperties =>
  ({ "--enter-delay": `${60 + i * 70}ms` }) as CSSProperties;

export function Bento(): ReactNode {
  const [open, setOpen] = useState<PanelId | null>(null);
  const [phase, setPhase] = useState<IntroPhase>("hello");
  const returnFocus = useRef<HTMLElement | null>(null);
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const reduceMotion = useSyncExternalStore(subscribeReduce, readReduce, serverReduce);
  const rootRef = useRef<HTMLDivElement>(null);
  const tilted = useRef<HTMLElement | null>(null);
  const [density, setDensity] = useState(0);
  const [motion, setMotion] = useState(0);
  const [tone, setTone] = useState(0);
  const dials = [
    {
      label: "Density",
      value: DENSITY_LABEL[density as 0 | 1 | 2],
      turn: () => setDensity((d) => (d + 1) % 3),
    },
    {
      label: "Motion",
      value: MOTION_LABEL[motion as 0 | 1 | 2],
      turn: () => setMotion((m) => (m + 1) % 3),
    },
    {
      label: "Tone",
      value: TONE_LABEL[tone as 0 | 1 | 2],
      turn: () => setTone((t) => (t + 1) % 3),
    },
  ];

  const [fallbackTheme, setFallbackTheme] = useState<Theme | null>(null);
  const current = fallbackTheme ?? theme;

  const setTheme = (next: Theme): void => {
    if (next === current) return;
    try {
      window.localStorage.setItem(THEME_KEY, next);
      setFallbackTheme(null);
      window.dispatchEvent(new Event(THEME_KEY));
    } catch {
      // Storage blocked (private mode): still switch for this visit.
      setFallbackTheme(next);
    }
  };

  const openPanel = useCallback<OpenFn>((id, from) => {
    returnFocus.current = from;
    setOpen(id);
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  }, []);

  // Continuous (squircle) corners: native CSS where possible, else clip paths.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || nativeSquircle()) return;
    return applySquircles(root);
  }, []);

  /* Cards lean away from the cursor's side, as if pressed there. Written
     straight to CSS variables so pointer moves never re-render React. */
  const onTilt = (e: ReactPointerEvent<HTMLDivElement>): void => {
    if (e.pointerType !== "mouse" || reduceMotion) return;
    const card = (e.target as Element).closest<HTMLElement>(".bento-card");
    if (tilted.current && tilted.current !== card) untilt(tilted.current);
    tilted.current = card;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
    // Big cards lean less, so their far edge never swings too far.
    const max = Math.min(10, 2400 / r.width);
    card.style.setProperty("--rx", `${(-ny * max).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(nx * max).toFixed(2)}deg`);
    card.dataset.tilt = "on";
  };
  const endTilt = (): void => {
    if (tilted.current) untilt(tilted.current);
    tilted.current = null;
  };

  // Intro timeline: "Hello," → the full line → it settles into the title.
  useEffect(() => {
    const quick = window.matchMedia(REDUCE_QUERY).matches;
    const timers = quick
      ? [window.setTimeout(() => setPhase("done"), 0)]
      : [
          window.setTimeout(() => setPhase((p) => (p === "hello" ? "line" : p)), 1100),
          window.setTimeout(() => setPhase("done"), 3500),
        ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);
  const skipIntro = useCallback(() => setPhase("done"), []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = open ? "hidden" : "";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="bento"
      data-theme={current}
      data-intro={phase === "done" ? "done" : "playing"}
    >
      <AnimatePresence>
        {phase === "done" ? null : (
          <Intro key="intro" phase={phase} onSkip={skipIntro} />
        )}
      </AnimatePresence>

      {/* The title is where the intro's name and role come to rest. */}
      <header className="bento-title">
        <h1>
          {phase === "done" ? (
            <m.span layoutId={NAME_ID} transition={SETTLE} className="wordmark">
              YASHISH
            </m.span>
          ) : (
            <span className="title-wait wordmark">YASHISH</span>
          )}
          <span className="sr-only"> Kpur</span>
        </h1>
        <p>
          {phase === "done" ? (
            <m.span layoutId={ROLE_ID} transition={SETTLE}>
              Product and Motion Designer
            </m.span>
          ) : (
            <span className="title-wait">Product and Motion Designer</span>
          )}
        </p>
      </header>

      {/* Theme: its own pill on the page edge, outside the grid. */}
      <div
        role="radiogroup"
        aria-label="Theme"
        className="theme-rail enter"
        data-active={current}
        style={delay(7)}
      >
        <span className="theme-rail-hl" aria-hidden="true" />
        <button
          type="button"
          role="radio"
          aria-checked={current === "light"}
          aria-label="Light theme"
          onClick={() => setTheme("light")}
        >
          <Sun aria-hidden="true" className="size-[18px]" />
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={current === "dark"}
          aria-label="Dark theme"
          onClick={() => setTheme("dark")}
        >
          <Moon aria-hidden="true" className="size-[18px]" />
        </button>
        <span className="theme-rail-label" aria-hidden="true">
          {current === "dark" ? "Dark" : "Light"}
        </span>
      </div>

      {/* Dot fill shared by the tile icons. */}
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <defs>
          <pattern
            id="bento-dot-fill"
            width="0.56"
            height="0.56"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="0.28" cy="0.28" r="0.2" className="bento-dot-fill" />
            {/* Dots stream through the strokes like a marquee sign. */}
            {reduceMotion ? null : (
              <animateTransform
                attributeName="patternTransform"
                type="translate"
                from="0 0"
                to="0.56 0"
                dur="0.7s"
                repeatCount="indefinite"
              />
            )}
          </pattern>
          {/* The accent gradient, slowly turning. Icons are masks over it. */}
          <linearGradient id="bento-accent-grad" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#ff9a3c" />
            <stop offset="0.38" stopColor="#ff4f8b" />
            <stop offset="0.7" stopColor="#b05cff" />
            <stop offset="1" stopColor="#7b3cff" />
            {reduceMotion ? null : (
              <animateTransform
                attributeName="gradientTransform"
                type="rotate"
                values="0 0.5 0.5;40 0.5 0.5;-30 0.5 0.5;0 0.5 0.5"
                dur="9s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>
        </defs>
      </svg>

      <div
        className="bento-grid"
        onPointerMove={onTilt}
        onPointerLeave={endTilt}
      >
        {/* Intro */}
        <section
          aria-label="Introduction"
          className="bento-card bento-intro enter"
          style={delay(1)}
        >
          <span className="bento-tag">
            <span className="bento-dot" aria-hidden="true" />
            Open to new projects
          </span>

          <p className="bento-statement">
            Designing digital experiences with <em>clarity</em>,{" "}
            <em>motion</em> and a bit of curiosity.
          </p>

          <button
            type="button"
            aria-haspopup="dialog"
            onClick={(e) => openPanel("contact", e.currentTarget)}
            className="bento-btn bento-btn-accent"
          >
            Let&rsquo;s connect
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </button>
          <SquircleEdge />
        </section>

        {/* Centre: a retro player. LCD strip, dot screen, three dials. */}
        <section
          aria-label="About Yashish"
          className="bento-card bento-device bento-hero enter"
          style={{ gridArea: "person", ...delay(2) }}
        >
          <PlayerDisplay playing={motion !== 2} dials={dials} />
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label="About Yashish Kpur"
            onClick={(e) => openPanel("about", e.currentTarget)}
            className="device-screen device-screen-hero"
          >
            <DotMatrix
              srcs={PHOTOS}
              density={density}
              motion={motion}
              tone={tone}
              theme={current}
            />
            <Image
              src="/scene/photo-1.webp"
              alt="Yashish Kpur"
              width={546}
              height={640}
              priority
              unoptimized
              draggable={false}
              className="dot-fallback"
            />
            <span className="bento-about-pill">
              About me
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </span>
          </button>

          <SquircleEdge />
        </section>

        {/* Work */}
        {WORK.map((w, i) => {
          const panel = panels[w.id];
          const Icon = w.icon;
          return (
            <button
              key={w.id}
              type="button"
              aria-haspopup="dialog"
              aria-label={panel.title}
              onClick={(e) => openPanel(w.id, e.currentTarget)}
              style={{ gridArea: w.id, ...delay(3 + i) }}
              className="bento-card bento-tile bento-work enter"
            >
              <span className="bento-copy">
                <span className="bento-count">
                  {panel.tiles.length} projects
                </span>
                <span className="bento-h3">{panel.title}</span>
                <span className="bento-p">{firstLine(panel.intro)}</span>
              </span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="bento-icon">
                <mask
                  id={`bento-icon-mask-${w.id}`}
                  maskUnits="userSpaceOnUse"
                  x="-2"
                  y="-2"
                  width="28"
                  height="28"
                >
                  <Icon
                    width={24}
                    height={24}
                    stroke="url(#bento-dot-fill)"
                    strokeWidth={2.6}
                    className={`bento-icon-${w.id}`}
                  />
                </mask>
                <rect
                  x="-2"
                  y="-2"
                  width="28"
                  height="28"
                  fill="url(#bento-accent-grad)"
                  mask={`url(#bento-icon-mask-${w.id})`}
                />
              </svg>
              <span className="bento-arrow" aria-hidden="true">
                <ArrowUpRight strokeWidth={2.4} className="size-4" />
              </span>
              <SquircleEdge />
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {open ? (
          <PanelSheet key={open} panel={panels[open]} onClose={close} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Length of the pretend track, in seconds (3:42). */
const TRACK = 222;
const MARQUEE = "Now playing \u00b7 Yashish \u00b7 Product and Motion Designer \u00b7 ";

type Dial = { label: string; value: string; turn: () => void };

/**
 * The player's LCD: name and clock, a scrolling title, a progress line and
 * the player's own controls (density, motion, tone). The clock writes to the
 * DOM directly so it never re-renders React.
 */
function PlayerDisplay({
  playing,
  dials,
}: {
  playing: boolean;
  dials: Dial[];
}): ReactNode {
  const timeRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      elapsed.current = (elapsed.current + 1) % TRACK;
      const t = elapsed.current;
      const mm = String(Math.floor(t / 60)).padStart(2, "0");
      const ss = String(t % 60).padStart(2, "0");
      if (timeRef.current) timeRef.current.textContent = `${mm}:${ss}`;
      progressRef.current?.style.setProperty("--p", (t / TRACK).toFixed(4));
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="lcd" data-playing={playing}>
      <div className="lcd-top" aria-hidden="true">
        <span className="lcd-state">
          {playing ? <Play className="lcd-glyph" /> : <Pause className="lcd-glyph" />}
          YASHISH
        </span>
        <span className="lcd-time" ref={timeRef}>
          00:00
        </span>
      </div>
      <div className="lcd-marquee" aria-hidden="true">
        <span className="lcd-track">
          <span>{MARQUEE}</span>
          <span>{MARQUEE}</span>
        </span>
      </div>
      <span className="lcd-progress" aria-hidden="true" ref={progressRef} />
      <div className="lcd-controls">
        {dials.map((d) => (
          <button
            key={d.label}
            type="button"
            onClick={d.turn}
            aria-label={`${d.label}: ${d.value}. Press to change.`}
            className="lcd-btn"
          >
            <span className="lcd-btn-label">{d.label}</span>
            <span className="lcd-btn-value">{d.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
