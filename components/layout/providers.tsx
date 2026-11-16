"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {/* "user" drops transform/layout animation when the OS asks for reduced motion. */}
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </ThemeProvider>
  );
}
