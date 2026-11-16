import type { ReactNode } from "react";

import { Bento } from "@/components/bento/bento";
import { socialLinks } from "@/content";
import { personJsonLd } from "@/lib/metadata";

export default function HomePage(): ReactNode {
  const jsonLd = personJsonLd(
    socialLinks.filter((link) => link.href.startsWith("http")).map((link) => link.href)
  );

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Bento />
    </main>
  );
}
