import type { Project } from "./types";

// PLACEHOLDER: project names, copy and years are examples.
// Images live in /public/projects. Drop real files in with the same names.
export const projects: Project[] = [
  {
    slug: "airtel-thanks",
    title: "Airtel Thanks",
    summary: "Redesigning everyday telecom experiences at scale.",
    disciplines: ["Product Design", "UX", "Systems"],
    year: "2025",
    image: "/projects/project-01.webp",
    imageAlt: "Airtel Thanks project cover",
  },
  {
    slug: "wynk-music",
    title: "Wynk Music",
    summary: "A calmer way to find the next song you will love.",
    disciplines: ["Interaction Design", "Mobile"],
    year: "2024",
    image: "/projects/project-02.webp",
    imageAlt: "Wynk Music project cover",
  },
  {
    slug: "recharge-flow",
    title: "Recharge, rebuilt",
    summary: "Turning a twelve-step payment into three confident taps.",
    disciplines: ["UX", "Payments"],
    year: "2024",
    image: "/projects/project-03.webp",
    imageAlt: "Recharge flow project cover",
  },
  {
    slug: "design-system",
    title: "One design language",
    summary:
      "A shared system of tokens, components and patterns across four product teams.",
    disciplines: ["Design Systems", "Tokens", "Documentation"],
    year: "2023",
    image: "/projects/project-04.webp",
    imageAlt: "Design system project cover",
  },
  {
    slug: "motion-studies",
    title: "Motion studies",
    summary: "Small interaction experiments that later shipped in product.",
    disciplines: ["Motion", "Prototyping"],
    year: "2022",
    image: "/projects/project-05.webp",
    imageAlt: "Motion studies project cover",
  },
];
