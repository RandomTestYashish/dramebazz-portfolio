import type { Metadata } from "next";

import { profile } from "@/content";

// PLACEHOLDER: set `url` to the production domain before deploying so
// Open Graph, the sitemap and canonical URLs resolve correctly.
export const siteConfig = {
  name: profile.name,
  title: `${profile.name} | ${profile.role}`,
  description:
    "Product designer crafting thoughtful experiences, design systems and interactions for products used by millions.",
  url: "https://example.com",
  ogImage: "/og-image.png",
  creator: "@yourhandle",
  keywords: [
    "product designer",
    "UX designer",
    "interaction design",
    "design systems",
    "portfolio",
  ],
} as const;

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  manifest: "/site.webmanifest",
};

export function personJsonLd(sameAs: string[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.role,
    url: siteConfig.url,
    email: `mailto:${profile.email}`,
    sameAs,
  };
}
