import { Providers } from "@/components/layout/providers";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { baseMetadata } from "@/lib/metadata";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Kalam, Poppins } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const kalam = Kalam({
  variable: "--font-kalam",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-block",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${kalam.variable} ${poppins.variable} min-h-dvh bg-white font-sans text-[#1d1d1b] antialiased`}
      >
        <Providers>
          <SkipToContent />
          {children}
          <div className="grain" aria-hidden="true" />
        </Providers>
      </body>
    </html>
  );
}
