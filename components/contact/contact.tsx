import type { ReactNode } from "react";

import { profile, socialLinks } from "@/content";
import { ShaderFlow } from "@/components/shaders/shader-flow";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Reveal, SplitReveal } from "@/components/ui/reveal";
import { CopyEmail } from "./copy-email";

// Faded toward the top-left so the shader never sits under the headline.
const SHADER_MASK =
  "radial-gradient(ellipse 70% 80% at 85% 100%, #000 0%, rgb(0 0 0 / 0.5) 45%, transparent 75%)";

export function Contact(): ReactNode {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-30"
        style={{ WebkitMaskImage: SHADER_MASK, maskImage: SHADER_MASK }}
      >
        <ShaderFlow
          className="absolute inset-0 h-full w-full"
          scale={3.5}
          brightness={1.6}
          iterations={10}
          flowSpeed={[0.05, 0.1]}
          // Linear-RGB stops: warm grey into the vermilion accent.
          colorLowA={[0.42, 0.4, 0.37]}
          colorHighA={[0.85, 0.26, 0.11]}
          fadeCx={0.5}
          fadeCy={0.5}
          fadeRx={2}
          fadeRy={2}
        />
      </div>

      <div className="container-page section-space grid grid-cols-1 gap-y-16 md:grid-cols-12 md:gap-x-6">
        <h2
          id="contact-title"
          className="text-display font-medium text-balance md:col-span-11 lg:col-span-10"
        >
          <SplitReveal text="Have a product worth making better?" emphasisFrom={5} />
        </h2>

        <Reveal className="md:col-span-7 lg:col-span-6">
          <p className="mb-8 max-w-[38ch] text-lead text-muted-foreground">
            I&rsquo;m open to lead and senior product design roles, and the
            occasional collaboration. Email is the fastest way to reach me.
          </p>
          <CopyEmail email={profile.email} />
        </Reveal>

        <Reveal
          delay={0.1}
          className="md:col-span-4 md:col-start-9 md:self-end lg:col-span-3 lg:col-start-10"
        >
          <ul className="flex flex-col border-t border-line pt-4">
            <li>
              <ArrowLink href={`mailto:${profile.email}`}>Email</ArrowLink>
            </li>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <ArrowLink href={link.href} external={link.external}>
                  {link.label}
                </ArrowLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
