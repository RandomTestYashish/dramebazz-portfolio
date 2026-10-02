# Dramebazz Portfolio

Personal portfolio for a product designer. Next.js 16, React 19, TypeScript, Tailwind CSS v4, Motion, Lenis and a small amount of WebGL (OGL).

Built on [rbp-portfolio](https://github.com/DavidHDev/rbp-portfolio) and designed against the [Taste Skill](https://github.com/leonxlnx/taste-skill) rules (installed at `.claude/skills/design-taste-frontend`).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Replacing content

All copy and data live in `content/`. Components never need editing to change content.

| File | What it holds |
|---|---|
| `content/profile.ts` | Name, headline, intro, availability, email, portrait paths |
| `content/projects.ts` | Selected work (title, summary, disciplines, year, image, optional `href`) |
| `content/experience.ts` | Roles and dates |
| `content/capabilities.ts` | Capability groups and daily tools |
| `content/metrics.ts` | Impact numbers. **Placeholders: verify or remove before publishing.** |
| `content/archive.ts` | Personal archive images and captions |
| `content/social.ts` | LinkedIn, Instagram, resume links |
| `lib/metadata.ts` | SEO: production URL, description, social handle |

Anything marked `PLACEHOLDER` in a comment is example content.

A project without an `href` shows "Case study soon" instead of a link. Add `href` when the case study exists.

Project layouts are assigned by position (feature, tall, offset, wide, compact), so the first project is always the large one.

## Replacing images

Every image has a fixed path. Drop a real file in with the same name and it just works.

```
public/portrait/portrait.webp       4:5, About section, shown at rest
public/portrait/portrait-alt.webp   same framing, revealed by the hover morph
public/projects/project-01.webp     16:9 or wider (feature)
public/projects/project-02.webp     4:5 (tall)
public/projects/project-03.webp     3:4 (offset)
public/projects/project-04.webp     3:2 (wide)
public/projects/project-05.webp     4:3 (compact)
public/archive/archive-01..05.webp  ratio set per item in content/archive.ts
public/og-image.png                 1200x630 social card
public/resume.pdf                   your resume
```

The current files are generated placeholders. `npm run placeholders` recreates any that are missing; `-- --force` regenerates all of them (and overwrites real images, so be careful).

Keep raw originals (PSDs, full-res exports, videos) in `assets/`. That folder is not served. Export web versions into `public/`.

## Design system

Tokens are in `app/globals.css` (colour, type scale, spacing, radius, motion, z-index) and `lib/tokens.ts` (JS motion values).

- **Colour:** warm white / near-black monochrome with one vermilion accent, used only for emphasis and live state. Light and dark themes follow the system and can be toggled.
- **Type:** Geist and Geist Mono. Fluid scale: `text-display`, `text-h2`, `text-h3`, `text-figure`, `text-lead`, `text-meta`.
- **Shape:** media uses a 3px radius, interactive controls are full pills. Nothing in between.
- **Motion:** one easing curve (`--ease-out`). Reveals on scroll, a masked headline reveal, magnetic email, pointer-drift on project images, and a WebGL hover morph on the About portrait (fine pointers only). Everything respects `prefers-reduced-motion`.

## Hero canyon

The hero background is `components/shaders/ravine.tsx`, an original ray-marched canyon whose props mirror React Bits Pro's Ravine (`speed`, `steps`, `fov`, `nearColor`, ...). If you buy React Bits Pro you can swap the official component into `components/hero/hero-atmosphere.tsx` without other changes.

Settings live in `hero-atmosphere.tsx`:

- Desktop: 96 ray-march steps, full resolution, speed 0.1. Mobile: 48 steps, 75% resolution, speed 0.08.
- If frames run slow, it steps quality down twice, then holds a still frame.
- It stops rendering when the hero is off-screen or the tab is hidden.
- Reduced motion shows one still frame. Without WebGL, a static graphite gradient shows instead.

The hero is a dark surface in both themes (`.on-dark`), and fades into the page through `.hero-fade`.

## Structure

```
app/            layout, page, globals.css, sitemap, robots, icons
components/
  navigation/   fixed nav, scroll-spy, theme toggle, mobile menu
  hero/         hero copy and the canyon atmosphere
  about/        editorial statement, portrait with WebGL morph
  projects/     selected work grid and cards
  experience/   timeline
  capabilities/ capabilities and tools
  metrics/      impact numbers with count-up
  creative/     personal archive collage
  contact/      contact section, copy-to-clipboard email
  footer/
  layout/       providers, smooth scroll, skip link
  shaders/      Ravine canyon (hero), flow shader (contact background)
  ui/           Reveal, SplitReveal, Magnetic, ArrowLink, SectionHeading
content/        all editable content
lib/            metadata, tokens, hooks
scripts/        placeholder image generator
```
