"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Brain,
  Briefcase,
  Camera,
  Compass,
  FileText,
  Film,
  Gamepad2,
  Gift,
  Instagram,
  Linkedin,
  Mail,
  Music,
  PenTool,
  Play,
  Rewind,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  Wand2,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

import type { Icon, Panel, SubTile } from "@/content/scene";

const ICONS: Record<Icon, LucideIcon> = {
  smartphone: Smartphone,
  users: Users,
  gift: Gift,
  zap: Zap,
  rewind: Rewind,
  play: Play,
  film: Film,
  sparkles: Sparkles,
  bot: Bot,
  wand: Wand2,
  brain: Brain,
  briefcase: Briefcase,
  music: Music,
  wallet: Wallet,
  pen: PenTool,
  camera: Camera,
  compass: Compass,
  gamepad: Gamepad2,
  mail: Mail,
  linkedin: Linkedin,
  instagram: Instagram,
  file: FileText,
};

/** Hand-placed look: each tile sits at its own small angle. */
const TILTS = [0];
const tiltAt = (i: number): number => TILTS[i % TILTS.length] ?? 0;

export function PanelSheet({
  panel,
  onClose,
}: {
  panel: Panel;
  onClose: () => void;
}): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const lastTile = useRef<number | null>(null);

  // Focus the sheet on open; Escape steps back from a tile, then closes.
  useEffect(() => {
    sheetRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (active !== null) setActive(null);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onClose]);

  // Back from a detail view: return focus to the tile that opened it.
  useEffect(() => {
    if (active === null && lastTile.current !== null) {
      sheetRef.current
        ?.querySelector<HTMLButtonElement>(`[data-tile="${lastTile.current}"]`)
        ?.focus();
    }
  }, [active]);

  // Keep Tab inside the sheet.
  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== "Tab" || !sheetRef.current) return;
    const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const open = (i: number): void => {
    lastTile.current = i;
    setActive(i);
  };

  const tile = active !== null ? panel.tiles[active] : null;

  return (
    <motion.div
      className="sheet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="sheet-shadow"
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 40, scale: 0.96 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 24, scale: 0.98 }
        }
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      >
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          data-lenis-prevent
          className="sheet outline-none"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="sheet-close"
          >
            <X strokeWidth={2.5} className="size-5" />
          </button>

          <header className="mb-6 pr-14 md:mb-8">
            <p className="sheet-kicker">{panel.kicker}</p>
            <h2 id={titleId} className="sheet-title">
              {panel.title}
            </h2>
            <p className="mt-3 max-w-[46ch] text-[0.95rem] text-[#74726c] md:text-base">
              {panel.intro}
            </p>
          </header>

          <AnimatePresence mode="wait" initial={false}>
            {tile && active !== null ? (
              <TileDetail
                key={`d-${active}`}
                tile={tile}
                index={active}
                onBack={() => setActive(null)}
              />
            ) : (
              <motion.ul
                key="grid"
                className="sheet-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {panel.tiles.map((t, i) => (
                  <motion.li
                    key={t.title}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 40, rotate: tiltAt(i) * 3 }
                    }
                    animate={{ opacity: 1, y: 0, rotate: tiltAt(i) }}
                    transition={{
                      delay: 0.12 + i * 0.07,
                      type: "spring",
                      stiffness: 170,
                      damping: 17,
                    }}
                  >
                    <motion.button
                      type="button"
                      data-tile={i}
                      onClick={() => open(i)}
                      whileHover={
                        reduce
                          ? {}
                          : { y: -4 }
                      }
                      whileTap={reduce ? {} : { scale: 0.97 }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 18,
                      }}
                      className="polaroid group w-full cursor-pointer text-left"
                    >
                      <TileScreen tile={t} />
                      <span className="polaroid-label">
                        {t.title}
                        <ArrowUpRight
                          aria-hidden="true"
                          strokeWidth={2.2}
                          className="size-4 shrink-0"
                        />
                      </span>
                      <span className="polaroid-kicker">{t.kicker}</span>
                    </motion.button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TileScreen({
  tile,
  big = false,
}: {
  tile: SubTile;
  big?: boolean;
}): ReactNode {
  const Glyph = ICONS[tile.icon];
  return (
    <span
      className={`tile-screen ${big ? "tile-screen-big" : ""}`}
      style={{
        // Theme colours only: orange or warm cream, alternating by tile.
        background:
          tile.title.length % 2
            ? "radial-gradient(90% 80% at 25% 10%, #ffb347 0%, rgb(255 179 71 / 0) 65%), linear-gradient(180deg, #ff6a2c 0%, #ff4f8b 45%, #8b4dff 100%)"
            : "radial-gradient(120% 90% at 30% 20%, #fbf8f3 0%, #ece3d6 100%)",
      }}
    >
      <span className="tile-phone">
        <span className="tile-notch" />
        <Glyph
          aria-hidden="true"
          strokeWidth={1.6}
          className={big ? "size-14" : "size-9"}
        />
        <span className="tile-phone-text">{tile.title}</span>
      </span>
    </span>
  );
}

function TileDetail({
  tile,
  index,
  onBack,
}: {
  tile: SubTile;
  index: number;
  onBack: () => void;
}): ReactNode {
  const reduce = useReducedMotion() ?? false;
  const backRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    backRef.current?.focus();
  }, []);

  const external = tile.href?.startsWith("http");

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="grid items-start gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12"
    >
      <div
        className="polaroid polaroid-static"
        style={{ rotate: `${tiltAt(index)}deg` }}
      >
        <TileScreen tile={tile} big />
        <span className="polaroid-label">{tile.title}</span>
      </div>

      <div className="flex flex-col gap-5">
        <button
          ref={backRef}
          type="button"
          onClick={onBack}
          className="detail-back"
        >
          <ArrowLeft aria-hidden="true" strokeWidth={2.2} className="size-4" />
          All tiles
        </button>
        <div>
          <p className="sheet-kicker">{tile.kicker}</p>
          <h3 className="detail-title">{tile.title}</h3>
        </div>
        <p className="max-w-[48ch] text-base leading-relaxed text-[#2c2b28] md:text-lg">
          {tile.summary}
        </p>
        <ul className="flex flex-wrap gap-2">
          {tile.tags.map((tag) => (
            <li key={tag} className="sticker">
              {tag}
            </li>
          ))}
        </ul>
        {tile.href ? (
          <a
            href={tile.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="lime-btn self-start"
          >
            {tile.cta ?? "Open"}
            <ArrowUpRight
              aria-hidden="true"
              strokeWidth={2.4}
              className="size-5"
            />
          </a>
        ) : (
          <p className="hand-note">Case study coming soon</p>
        )}
      </div>
    </motion.div>
  );
}
