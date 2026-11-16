/**
 * About sheet content. Built from what the site already says about Yashish.
 * PLACEHOLDER: confirm years, focus areas, email and social links before
 * publishing (they mirror content/experience.ts and content/scene.ts).
 */

/** Text runs: plain strings, or { em } for accent words, { b } for bold. */
export type Run = string | { em: string } | { b: string };

export type AboutRole = {
  company: string;
  mark: string;
  colors: [string, string];
  role: string;
  years: string;
  current?: boolean;
  focus: string;
  cases?: number;
};

export const about = {
  eyebrow: "Lead Product Designer · Delhi",
  headline: [
    "Designing ",
    { em: "everyday journeys" },
    " for millions, with ",
    { em: "motion" },
    " that explains.",
  ] as Run[],
  intro: [
    "I'm Yashish. I design the products people open every day at ",
    { b: "Airtel Digital" },
    ": recharges, rewards, family plans and the home screen that ties them together. I take ideas from ",
    { b: "first sketch to a coded prototype" },
    ", and I use motion to explain, never to decorate.",
  ] as Run[],
  card: {
    name: "Yashish Kpur",
    meta: "Product & Motion Designer · Delhi",
    since: "Designing since 2018",
  },
  experience: {
    title: ["Eight years, ", { em: "three teams" }] as Run[],
    sub: "From payments to music to telecom: leading design for journeys used by millions. Case studies open from the work tiles.",
    resume: "/resume.pdf",
    roles: [
      {
        company: "Airtel Digital",
        mark: "a",
        colors: ["#e40000", "#5a0000"],
        role: "Lead Product Designer",
        years: "2025 — Now",
        current: true,
        focus: "Self-care, recharge, rewards",
        cases: 5,
      },
      {
        company: "Wynk Music",
        mark: "w",
        colors: ["#ff3d6e", "#3d0018"],
        role: "Senior Product Designer",
        years: "2022 — 25",
        focus: "Discovery, playback",
      },
      {
        company: "Paytm",
        mark: "p",
        colors: ["#00baf2", "#002e5d"],
        role: "Product Designer",
        years: "2018 — 22",
        focus: "Payments, consumer flows",
      },
    ] as AboutRole[],
  },
  approach: {
    title: ["How I like ", { em: "to work" }] as Run[],
    sub: "What I bring to the teams I lead and the teams I join.",
    cards: [
      {
        title: "Clarity first",
        body: "I cut a problem down until the next step is obvious. Clear products move faster, for users and for teams.",
      },
      {
        title: "Motion with a job",
        body: "Every animation should explain something: where you came from, what changed, what to do next.",
      },
      {
        title: "Built, not drawn",
        body: "I prototype in code early, so ideas get tested in the hand, not in a slide deck.",
      },
      {
        title: "Ship and measure",
        body: "Small teams, short loops. I care about what changes after launch, not just how it looks on day one.",
      },
    ],
    aside: {
      title: "Off screen",
      body: "Photography, long walks, tennis and too many side projects.",
    },
  },
  quote: {
    lead: "Clarity makes momentum.",
    rest: "If the next step is obvious, people move faster.",
  },
  contact: {
    eyebrow: "Get in touch",
    title: ["Let's make something ", { em: "move." }] as Run[],
    sub: "Open to new projects and conversations. Email is the fastest way to reach me; I usually reply within a day.",
    links: [
      {
        label: "Email",
        handle: "hello@example.com",
        href: "mailto:hello@example.com",
      },
      {
        label: "LinkedIn",
        handle: "in/yashishkpur",
        href: "https://www.linkedin.com/",
      },
      {
        label: "Instagram",
        handle: "@yashishkpur",
        href: "https://www.instagram.com/",
      },
      { label: "Resume", handle: "PDF, one page", href: "/resume.pdf" },
    ],
  },
  footer: "Yashish Kpur · Product and Motion Designer, Delhi",
};
