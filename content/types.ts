export type Profile = {
  name: string;
  role: string;
  /** Short line shown as the hero eyebrow. */
  discipline: string;
  headline: { lead: string; emphasis: string };
  intro: string;
  currently: string;
  availability: { open: boolean; label: string };
  email: string;
  portrait: { src: string; hoverSrc: string; alt: string };
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  disciplines: string[];
  year: string;
  /** Path under /public. Replace the placeholder file, keep the path. */
  image: string;
  imageAlt: string;
  /** Leave undefined until the case study exists. The card renders without a link. */
  href?: string;
};

export type Role = {
  start: string;
  end: string;
  title: string;
  company: string;
  summary: string;
};

export type CapabilityGroup = {
  name: string;
  items: string[];
};

export type Metric = {
  prefix?: string;
  value: number;
  /** Decimal places to show while counting. */
  decimals?: number;
  suffix?: string;
  label: string;
  context: string;
};

export type ArchiveItem = {
  image: string;
  alt: string;
  caption: string;
  /** Shapes the collage. */
  ratio: "portrait" | "landscape" | "square";
};

export type SocialLink = {
  label: string;
  href: string;
  external: boolean;
};
