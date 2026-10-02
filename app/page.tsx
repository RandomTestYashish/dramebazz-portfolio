import type { ReactNode } from "react";

import { About } from "@/components/about/about";
import { Capabilities } from "@/components/capabilities/capabilities";
import { Contact } from "@/components/contact/contact";
import { Archive } from "@/components/creative/archive";
import { Experience } from "@/components/experience/experience";
import { Hero } from "@/components/hero/hero";
import { Metrics } from "@/components/metrics/metrics";
import { SelectedWork } from "@/components/projects/selected-work";
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
      <Hero />
      <About />
      <SelectedWork />
      <Experience />
      <Capabilities />
      <Metrics />
      <Archive />
      <Contact />
    </main>
  );
}
