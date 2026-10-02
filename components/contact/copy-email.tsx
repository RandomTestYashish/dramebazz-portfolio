"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { Magnetic } from "@/components/ui/magnetic";
import { duration, ease } from "@/lib/tokens";

type CopyState = "idle" | "copied" | "failed";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyEmail({ email }: { email: string }): ReactNode {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const id = window.setTimeout(() => setState("idle"), 2200);
    return () => window.clearTimeout(id);
  }, [state]);

  const copy = async (): Promise<void> => {
    setState((await writeClipboard(email)) ? "copied" : "failed");
  };

  const label =
    state === "copied" ? "Copied to clipboard" : state === "failed" ? "Copy failed, use the link" : "Copy email";

  return (
    <div className="flex flex-col items-start gap-4">
      <Magnetic strength={0.18}>
        <button
          type="button"
          onClick={copy}
          className="group inline-flex min-h-11 max-w-full cursor-pointer items-center gap-4 text-left text-h3 font-medium break-all"
        >
          <span className="link-underline">{email}</span>
          <span
            aria-hidden="true"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill border border-line transition-colors duration-300 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background"
          >
            {state === "copied" ? (
              <Check strokeWidth={1.5} className="size-4" />
            ) : (
              <Copy strokeWidth={1.5} className="size-4" />
            )}
          </span>
          <span className="sr-only">, copy to clipboard</span>
        </button>
      </Magnetic>
      <p className="meta h-4 overflow-hidden text-muted-foreground" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            className="block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: duration.fast, ease: ease.out }}
          >
            {state === "copied" ? <span className="text-accent">{label}</span> : label}
          </motion.span>
        </AnimatePresence>
      </p>
    </div>
  );
}
