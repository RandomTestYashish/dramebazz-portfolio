"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";

import {
  navLinks,
  navPiece,
  panels,
  pieces,
  type Anchor,
  type PanelId,
  type Piece,
} from "@/content/scene";
import { PanelSheet } from "./panel-sheet";

/** How far each anchor group drifts into the spare width on wide screens. */
const DRIFT: Record<Anchor, number> = { left: 0.1, center: 0.5, right: 1 };

type Box = {
  left: string;
  top: string;
  width: string;
  height: string;
  zIndex: number;
};

function place(p: {
  x: number;
  y: number;
  w: number;
  h: number;
  anchor: Anchor;
  z: number;
}): Box {
  return {
    left: `calc(var(--u) * ${p.x} + var(--ex) * ${DRIFT[p.anchor]})`,
    top: `calc(var(--u) * ${p.y} + var(--ey) * 0.5)`,
    width: `calc(var(--u) * ${p.w})`,
    height: `calc(var(--u) * ${p.h})`,
    zIndex: p.z,
  };
}

const byId = (id: string): Piece => {
  const p = pieces.find((piece) => piece.id === id);
  if (!p) throw new Error(`Unknown piece ${id}`);
  return p;
};

/* ------------------------------------------------------------------------- */

export function Scene(): ReactNode {
  const [open, setOpen] = useState<PanelId | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const openPanel = useCallback((id: PanelId, from: HTMLElement | null) => {
    returnFocus.current = from;
    setOpen(id);
  }, []);

  const close = useCallback(() => {
    setOpen(null);
    // Give the sheet its exit before focus goes back.
    requestAnimationFrame(() => returnFocus.current?.focus());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = open ? "hidden" : "";
    return () => {
      root.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <DesktopScene onOpen={openPanel} />
      <MobileScene onOpen={openPanel} />

      <AnimatePresence>
        {open ? (
          <PanelSheet key={open} panel={panels[open]} onClose={close} />
        ) : null}
      </AnimatePresence>
    </>
  );
}

type OpenFn = (id: PanelId, from: HTMLElement | null) => void;

/* ---------------------------------------------------------------- desktop */

function DesktopScene({ onOpen }: { onOpen: OpenFn }): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 18 });
  const py = useSpring(my, { stiffness: 60, damping: 18 });

  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (reduce || e.pointerType !== "mouse") return;
    mx.set((e.clientX / window.innerWidth - 0.5) * -14);
    my.set((e.clientY / window.innerHeight - 0.5) * -8);
  };

  const person = byId("person");
  const rest = pieces.filter((p) => p.id !== "person");

  return (
    <div className="scene scene-desktop" onPointerMove={onMove}>
      <h1 className="sr-only">
        Yashish Kpur, Product Designer and Motion Designer
      </h1>

      {/* Portrait drifts gently against the cursor. */}
      <motion.div
        className="absolute"
        style={{ ...place(person), x: px, y: py }}
      >
        <ScenePiece piece={person} index={0} onOpen={onOpen} fill />
      </motion.div>

      {rest.map((piece, i) => (
        <div key={piece.id} className="absolute" style={place(piece)}>
          <ScenePiece piece={piece} index={i + 1} onOpen={onOpen} fill />
        </div>
      ))}

      <div className="absolute" style={place(navPiece)}>
        <NavStrip onOpen={onOpen} index={pieces.length + 1} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- mobile */

function MobileScene({ onOpen }: { onOpen: OpenFn }): ReactNode {
  const tiles = ["tile1", "tile2", "tile3", "tile4"].map(byId);
  return (
    <div className="scene scene-mobile">
      <div className="mx-auto flex max-w-[34rem] flex-col gap-5 px-4 pt-5 pb-12">
        <div className="w-[62%]">
          <ScenePiece piece={byId("name")} index={0} onOpen={onOpen} />
        </div>
        <NavStrip onOpen={onOpen} index={1} />

        <div className="relative mt-2 w-[94%]">
          <ScenePiece piece={byId("headline")} index={2} onOpen={onOpen} />
        </div>
        <div className="w-[78%]">
          <ScenePiece piece={byId("tagline")} index={3} onOpen={onOpen} />
        </div>
        <div className="w-[62%]">
          <ScenePiece piece={byId("connect")} index={4} onOpen={onOpen} />
        </div>

        <div className="-mx-2">
          <ScenePiece piece={byId("person")} index={5} onOpen={onOpen} />
        </div>

        <div className="relative -mt-24 grid grid-cols-2 gap-x-1 gap-y-2">
          {tiles.map((t, i) => (
            <ScenePiece key={t.id} piece={t} index={6 + i} onOpen={onOpen} />
          ))}
          <div className="pointer-events-none absolute top-[34%] -left-2 w-[22%]">
            <ScenePiece piece={byId("smiley")} index={10} onOpen={onOpen} />
          </div>
        </div>

        <div className="ml-auto w-[88%]">
          <ScenePiece piece={byId("note")} index={11} onOpen={onOpen} />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- pieces */

function ScenePiece({
  piece,
  index,
  onOpen,
  fill = false,
}: {
  piece: Piece;
  index: number;
  onOpen: OpenFn;
  /** Fill a positioned box (desktop) instead of flowing at its own ratio. */
  fill?: boolean;
}): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const tilt = piece.tilt ?? 0;

  const img = (
    <Image
      src={piece.src}
      alt={piece.opens ? "" : piece.alt}
      width={piece.w}
      height={piece.h}
      priority
      unoptimized
      draggable={false}
      sizes={fill ? `${Math.round((piece.w / 1448) * 100)}vw` : "90vw"}
      className={`pointer-events-none block select-none ${fill ? "h-full w-full" : "h-auto w-full"}`}
    />
  );

  // Entrance is plain CSS so the collage shows even before JS loads.
  const enterStyle = {
    "--enter-delay": `${80 + index * 60}ms`,
    "--enter-rotate": `${-tilt * 1.5}deg`,
  } as CSSProperties;
  const enterClass = `enter ${fill ? "h-full w-full" : ""}`;

  if (!piece.opens) {
    return (
      <div
        className={`piece ${enterClass}`}
        style={enterStyle}
        aria-hidden={piece.alt ? undefined : true}
      >
        {piece.alt ? <span className="sr-only">{piece.alt}</span> : null}
        {img}
      </div>
    );
  }

  const target = piece.opens;
  const isPerson = piece.id === "person";

  return (
    <div className={enterClass} style={enterStyle}>
      <motion.button
        type="button"
        whileHover={
          reduce
            ? {}
            : isPerson
              ? {
                  scale: 1.015,
                  transition: { type: "spring", stiffness: 260, damping: 20 },
                }
              : {
                  y: -8,
                  rotate: tilt,
                  scale: 1.035,
                  transition: { type: "spring", stiffness: 320, damping: 18 },
                }
        }
        whileTap={reduce ? {} : { scale: 0.97 }}
        onClick={(e) => onOpen(target, e.currentTarget)}
        aria-label={`${piece.label ?? piece.alt}. ${piece.alt}`}
        aria-haspopup="dialog"
        className={`piece piece-tap group relative block cursor-pointer ${fill ? "h-full w-full" : "w-full"} ${
          isPerson ? "piece-person" : ""
        }`}
      >
        {img}
        {isPerson || piece.id === "name" || piece.id === "note" ? (
          <span
            aria-hidden="true"
            className={`piece-hint ${isPerson ? "piece-hint-person" : ""}`}
          >
            {piece.id === "note" ? "My approach ↗" : "About me ↗"}
          </span>
        ) : null}
      </motion.button>
    </div>
  );
}

function NavStrip({
  onOpen,
  index,
}: {
  onOpen: OpenFn;
  index: number;
}): ReactNode {
  return (
    <nav
      aria-label="Primary"
      style={
        {
          "--enter-delay": `${80 + index * 50}ms`,
          "--enter-y": "-24px",
        } as CSSProperties
      }
      className="piece enter relative h-full w-full"
    >
      <Image
        src={navPiece.src}
        alt=""
        width={navPiece.w}
        height={navPiece.h}
        priority
        unoptimized
        draggable={false}
        sizes="45vw"
        className="pointer-events-none block h-full w-full select-none"
      />
      <ul className="absolute inset-0">
        {navLinks.map((link) => (
          <li
            key={link.label}
            className="absolute top-[18%] h-[64%]"
            style={{
              left: `${(link.x / navPiece.w) * 100}%`,
              width: `${(link.w / navPiece.w) * 100}%`,
            }}
          >
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={(e) => onOpen(link.opens, e.currentTarget)}
              className="nav-hit group relative block h-full w-full cursor-pointer rounded-md"
            >
              <span className="sr-only">{link.label}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                className="nav-scribble absolute right-[10%] -bottom-[6%] left-[10%] h-[22%] w-[80%]"
              >
                <path
                  pathLength={1}
                  d="M2 8 C 20 3, 40 10, 60 5 S 90 6, 98 4"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
