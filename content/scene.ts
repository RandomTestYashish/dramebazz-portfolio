/**
 * The one-screen collage. Every piece is a cut-out of the original artwork
 * (public/scene/*.webp), placed on a 1448 x 1086 canvas.
 *
 * `anchor` decides where a piece goes when the screen is wider than 4:3:
 *   left   - drifts towards the left edge (with a little inset)
 *   center - stays with the portrait and the tiles
 *   right  - hugs the right edge (the polaroid is cut there)
 */

export type PanelId =
  | "product"
  | "motion"
  | "ai"
  | "experience"
  | "about"
  | "contact";

export type Anchor = "left" | "center" | "right";

export type Piece = {
  id: string;
  src: string;
  alt: string;
  x: number;
  y: number;
  w: number;
  h: number;
  anchor: Anchor;
  z: number;
  /** Opens this panel when tapped. */
  opens?: PanelId;
  /** Accessible name for the tap target. */
  label?: string;
  /** Hover tilt in degrees. */
  tilt?: number;
};

export const CANVAS = { w: 1448, h: 1086 } as const;

export const pieces: Piece[] = [
  {
    id: "person",
    src: "/scene/person.webp",
    alt: "Yashish Kpur in sunglasses, cut out on torn lime paper",
    x: 400,
    y: 78,
    w: 702,
    h: 682,
    anchor: "center",
    z: 1,
    opens: "about",
    label: "About Yashish",
    tilt: 0,
  },
  {
    id: "name",
    src: "/scene/name.webp",
    alt: "Yashish Kpur",
    x: 60,
    y: 22,
    w: 312,
    h: 106,
    anchor: "left",
    z: 3,
    opens: "about",
    label: "About Yashish",
    tilt: -2,
  },
  {
    id: "spark",
    src: "/scene/spark.webp",
    alt: "",
    x: 378,
    y: 108,
    w: 80,
    h: 80,
    anchor: "left",
    z: 3,
  },
  {
    id: "headline",
    src: "/scene/headline.webp",
    alt: "Product Designer and Motion Designer",
    x: 86,
    y: 140,
    w: 480,
    h: 262,
    anchor: "left",
    z: 3,
  },
  {
    id: "tagline",
    src: "/scene/tagline.webp",
    alt: "Designing digital experiences with clarity, motion and a bit of curiosity.",
    x: 130,
    y: 398,
    w: 328,
    h: 130,
    anchor: "left",
    z: 3,
  },
  {
    id: "connect",
    src: "/scene/connect.webp",
    alt: "Let's Connect",
    x: 138,
    y: 524,
    w: 284,
    h: 94,
    anchor: "left",
    z: 3,
    opens: "contact",
    label: "Let's connect",
    tilt: -2,
  },
  {
    id: "note",
    src: "/scene/note.webp",
    alt: "Clarity Makes Momentum, a torn note pinned over a photo of India Gate",
    x: 1028,
    y: 158,
    w: 420,
    h: 474,
    anchor: "right",
    z: 3,
    opens: "about",
    label: "Clarity makes momentum: about my approach",
    tilt: 2,
  },
  {
    id: "arrow",
    src: "/scene/arrow.webp",
    alt: "",
    x: 1160,
    y: 606,
    w: 80,
    h: 54,
    anchor: "center",
    z: 3,
  },
  {
    id: "tile1",
    src: "/scene/tile1.webp",
    alt: "Phone showing Airtel",
    x: 104,
    y: 636,
    w: 384,
    h: 410,
    anchor: "center",
    z: 4,
    opens: "product",
    label: "Product Work",
    tilt: -2,
  },
  {
    id: "tile2",
    src: "/scene/tile2.webp",
    alt: "Phone playing a motion reel",
    x: 480,
    y: 650,
    w: 314,
    h: 396,
    anchor: "center",
    z: 4,
    opens: "motion",
    label: "Motion Work",
    tilt: 2,
  },
  {
    id: "tile3",
    src: "/scene/tile3.webp",
    alt: "Phone with an AI sparkle",
    x: 792,
    y: 640,
    w: 304,
    h: 406,
    anchor: "center",
    z: 4,
    opens: "ai",
    label: "AI Experiments",
    tilt: -2,
  },
  {
    id: "tile4",
    src: "/scene/tile4.webp",
    alt: "Phone listing Paytm, Wynk and Airtel",
    x: 1092,
    y: 668,
    w: 312,
    h: 378,
    anchor: "center",
    z: 4,
    opens: "experience",
    label: "Past Experience",
    tilt: 2,
  },
  {
    id: "smiley",
    src: "/scene/smiley.webp",
    alt: "",
    x: 38,
    y: 868,
    w: 120,
    h: 130,
    anchor: "center",
    z: 5,
  },
];

/** The nav strip is one cut-out; each word gets its own tap target (canvas px, relative to the strip). */
export const navPiece = {
  src: "/scene/nav.webp",
  x: 810,
  y: 18,
  w: 602,
  h: 104,
  anchor: "right" as Anchor,
  z: 6,
};
export const navLinks: {
  label: string;
  opens: PanelId;
  x: number;
  w: number;
}[] = [
  { label: "Work", opens: "product", x: 40, w: 78 },
  { label: "About", opens: "about", x: 152, w: 86 },
  { label: "Contact", opens: "contact", x: 428, w: 150 },
];

/* -------------------------------------------------------------------------
 * Panels: what opens when a piece is tapped. Each one is a set of new tiles.
 * PLACEHOLDER: copy, years and links are drafts. Edit freely.
 * ----------------------------------------------------------------------- */

export type Icon =
  | "smartphone"
  | "users"
  | "gift"
  | "zap"
  | "rewind"
  | "play"
  | "film"
  | "sparkles"
  | "bot"
  | "wand"
  | "brain"
  | "briefcase"
  | "music"
  | "wallet"
  | "pen"
  | "camera"
  | "compass"
  | "gamepad"
  | "mail"
  | "linkedin"
  | "instagram"
  | "file";

export type SubTile = {
  title: string;
  /** Short line under the title on the tile. */
  kicker: string;
  summary: string;
  tags: string[];
  icon: Icon;
  /** Two colours for the tile's screen. */
  colors: [string, string];
  href?: string;
  cta?: string;
};

export type Panel = {
  id: PanelId;
  kicker: string;
  title: string;
  intro: string;
  tiles: SubTile[];
};

export const panels: Record<PanelId, Panel> = {
  product: {
    id: "product",
    kicker: "01 / Product Work",
    title: "Product Work",
    intro: "Journeys used by millions every day. Tap a tile to open it.",
    tiles: [
      {
        title: "Airtel Thanks",
        kicker: "Self-care at scale",
        summary:
          "Redesigning everyday telecom journeys so that paying, recharging and getting help feel effortless.",
        tags: ["Product Design", "UX", "Systems"],
        icon: "smartphone",
        colors: ["#e40000", "#7a0000"],
      },
      {
        title: "Recharge, rebuilt",
        kicker: "12 steps → 3 taps",
        summary:
          "A scroll-driven recharge flow: pick who it is for, dial the pack, pay in one confident tap.",
        tags: ["Payments", "Interaction"],
        icon: "zap",
        colors: ["#d7ff3a", "#5f7d00"],
        href: "https://randomtestyashish.github.io/recharge-scroll/",
        cta: "Open prototype",
      },
      {
        title: "Family",
        kicker: "One plan, many people",
        summary:
          "Managing a shared family plan: members, usage and add-ons in one calm place.",
        tags: ["Product Design", "Prototyping"],
        icon: "users",
        colors: ["#4b6bff", "#1b2366"],
        href: "https://randomtestyashish.github.io/Family_Additional-Features/",
        cta: "Open prototype",
      },
      {
        title: "My Rewards",
        kicker: "Benefits that feel earned",
        summary:
          "Partner benefits and rewards, redesigned so people actually discover and use them.",
        tags: ["UX", "Visual Design"],
        icon: "gift",
        colors: ["#ff8a3d", "#7a2e00"],
      },
      {
        title: "Airtel Rewind",
        kicker: "Your year, in stories",
        summary:
          "A story-style recap of the year: playful, personal and made to be shared.",
        tags: ["Motion", "Storytelling"],
        icon: "rewind",
        colors: ["#b44bff", "#2a0f4d"],
      },
    ],
  },
  motion: {
    id: "motion",
    kicker: "02 / Motion Work",
    title: "Motion Work",
    intro: "Movement that explains things. Tap a tile to open it.",
    tiles: [
      {
        title: "Interaction studies",
        kicker: "Small moments, shipped",
        summary:
          "Micro-interactions explored in prototypes first, several of which later shipped in product.",
        tags: ["Motion", "Prototyping"],
        icon: "play",
        colors: ["#ff4d6d", "#3d0a1a"],
      },
      {
        title: "Story transitions",
        kicker: "Rewind, in motion",
        summary: "Transitions and pacing for a story-format year-in-review.",
        tags: ["Motion", "Storytelling"],
        icon: "film",
        colors: ["#ff9f1c", "#4a2600"],
      },
      {
        title: "Product reels",
        kicker: "Launch films",
        summary:
          "Short product films that show a feature in ten seconds instead of ten slides.",
        tags: ["Video", "Brand"],
        icon: "camera",
        colors: ["#2ec4b6", "#06302c"],
      },
      {
        title: "Motion language",
        kicker: "Easing, timing, rules",
        summary:
          "A shared set of durations, curves and choreography rules so motion feels like one product.",
        tags: ["Systems", "Motion"],
        icon: "compass",
        colors: ["#d7ff3a", "#3a4a00"],
      },
    ],
  },
  ai: {
    id: "ai",
    kicker: "03 / AI Experiments",
    title: "AI Experiments",
    intro: "Where design meets models, plus side projects. Tap a tile to open it.",
    tiles: [
      {
        title: "Agentic assistant",
        kicker: "An assistant that does",
        summary:
          "Exploring how an in-app agent can take action for you, not just answer questions.",
        tags: ["AI", "Conversation design"],
        icon: "bot",
        colors: ["#7b5cff", "#1a0f4d"],
        href: "https://randomtestyashish.github.io/agentic/",
        cta: "Open prototype",
      },
      {
        title: "SENTYAR",
        kicker: "Concept build",
        summary: "An AI-first product concept, designed and built end to end.",
        tags: ["AI", "Prototype"],
        icon: "sparkles",
        colors: ["#ff5fa2", "#4a0f2c"],
        href: "https://randomtestyashish.github.io/SENTYAR/",
        cta: "Open prototype",
      },
      {
        title: "Generative UI",
        kicker: "Screens that adapt",
        summary:
          "Interfaces that rearrange around the person and the moment, not a fixed template.",
        tags: ["AI", "Systems"],
        icon: "wand",
        colors: ["#00c2ff", "#002a3d"],
      },
      {
        title: "Design with Claude",
        kicker: "AI in my workflow",
        summary:
          "Using AI to go from idea to working prototype in hours, then testing it with real people.",
        tags: ["Workflow", "Prototyping"],
        icon: "brain",
        colors: ["#ffb347", "#4a2a00"],
      },
      {
        title: "The Court",
        kicker: "A pixel tennis game",
        summary:
          "A pixel-art tennis game with levels, a leaderboard and multiplayer. Designed and built for fun.",
        tags: ["Game", "Pixel art"],
        icon: "gamepad",
        colors: ["#ff9a3d", "#5a1f00"],
        href: "https://randomtestyashish.github.io/game/",
        cta: "Play it",
      },
      {
        title: "Agentic, exploration 2",
        kicker: "A second take",
        summary:
          "A second direction for the in-app agent, with a different interaction model.",
        tags: ["AI", "Prototype"],
        icon: "sparkles",
        colors: ["#7b5cff", "#1a0f4d"],
        href: "https://randomtestyashish.github.io/agentic/exploration2/",
        cta: "Open prototype",
      },
      {
        title: "Shader toys",
        kicker: "Liquid type and light",
        summary:
          "Small WebGL sketches: liquid ASCII, flowing gradients and portrait morphs.",
        tags: ["WebGL", "Motion"],
        icon: "wand",
        colors: ["#2ec4b6", "#06302c"],
      },
    ],
  },
  experience: {
    id: "experience",
    kicker: "04 / Past Experience",
    title: "Past Experience",
    intro: "Where I have been building. Tap a tile to open it.",
    tiles: [
      {
        title: "Airtel Digital",
        kicker: "Lead Product Designer",
        summary:
          "Leading design for core self-care journeys: setting product direction with PM and engineering, and growing a team of designers.",
        tags: ["2025 – Present", "Leadership"],
        icon: "briefcase",
        colors: ["#e40000", "#5a0000"],
      },
      {
        title: "Wynk Music",
        kicker: "Senior Product Designer",
        summary:
          "Owned discovery and playback: a calmer way to find the next song you will love.",
        tags: ["2022 – 2025", "Mobile"],
        icon: "music",
        colors: ["#ff3d6e", "#3d0018"],
      },
      {
        title: "Paytm",
        kicker: "Product Designer",
        summary:
          "Payments and consumer flows, where every extra tap costs trust.",
        tags: ["Fintech", "Payments"],
        icon: "wallet",
        colors: ["#00baf2", "#002e5d"],
      },
      {
        title: "Earlier work",
        kicker: "Product Designer",
        summary:
          "Consumer products, entertainment and fintech. Learned to ship, measure and iterate in small teams.",
        tags: ["2018 – 2022"],
        icon: "pen",
        colors: ["#d7ff3a", "#2f3d00"],
      },
    ],
  },
  about: {
    id: "about",
    kicker: "Hello",
    title: "About me",
    intro:
      "Product designer and motion designer from Delhi. Clarity makes momentum.",
    tiles: [
      {
        title: "Clarity first",
        kicker: "How I work",
        summary:
          "I cut a problem down until the next step is obvious. Clear products move faster, for users and for teams.",
        tags: ["Approach"],
        icon: "compass",
        colors: ["#d7ff3a", "#2f3d00"],
      },
      {
        title: "Motion with a job",
        kicker: "Why it moves",
        summary:
          "Every animation should explain something: where you came from, what changed, what to do next.",
        tags: ["Motion"],
        icon: "play",
        colors: ["#ff6a3d", "#4a1400"],
      },
      {
        title: "Built, not drawn",
        kicker: "Prototype everything",
        summary:
          "I prototype in code early, so ideas get tested in the hand, not in a slide deck.",
        tags: ["Prototyping"],
        icon: "pen",
        colors: ["#4b6bff", "#141a4d"],
      },
      {
        title: "Delhi, mostly",
        kicker: "Off screen",
        summary: "Photography, long walks, tennis and too many side projects.",
        tags: ["Life"],
        icon: "camera",
        colors: ["#9a9a92", "#2a2a28"],
      },
    ],
  },
  contact: {
    id: "contact",
    kicker: "Let's connect",
    title: "Say hello",
    intro: "Open to new projects and conversations.",
    tiles: [
      {
        title: "Email",
        kicker: "hello@example.com",
        summary: "The fastest way to reach me. I usually reply within a day.",
        tags: ["Email"],
        icon: "mail",
        colors: ["#d7ff3a", "#2f3d00"],
        href: "mailto:hello@example.com",
        cta: "Write an email",
      },
      {
        title: "LinkedIn",
        kicker: "Work history",
        summary: "Roles, recommendations and what I am working on now.",
        tags: ["Social"],
        icon: "linkedin",
        colors: ["#0a66c2", "#00264d"],
        href: "https://www.linkedin.com/",
        cta: "Open LinkedIn",
      },
      {
        title: "Instagram",
        kicker: "Photos and motion",
        summary: "Photography, motion sketches and behind the scenes.",
        tags: ["Social"],
        icon: "instagram",
        colors: ["#ff3d8b", "#4a0026"],
        href: "https://www.instagram.com/",
        cta: "Open Instagram",
      },
      {
        title: "Resume",
        kicker: "PDF",
        summary: "Everything on one page.",
        tags: ["PDF"],
        icon: "file",
        colors: ["#e6e2da", "#5a5850"],
        href: "/resume.pdf",
        cta: "Open resume",
      },
    ],
  },
};
