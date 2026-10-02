import type { ArchiveItem } from "./types";

// Images live in /public/archive. Replace the files, keep the names.
export const archive: ArchiveItem[] = [
  {
    image: "/archive/archive-01.webp",
    alt: "Dusk over a city skyline",
    caption: "Photography",
    ratio: "portrait",
  },
  {
    image: "/archive/archive-02.webp",
    alt: "A coastline seen from a train window",
    caption: "Travel",
    ratio: "landscape",
  },
  {
    image: "/archive/archive-03.webp",
    alt: "Stage lights at a small concert",
    caption: "Music",
    ratio: "square",
  },
  {
    image: "/archive/archive-04.webp",
    alt: "Still from a motion study",
    caption: "Motion",
    ratio: "portrait",
  },
  {
    image: "/archive/archive-05.webp",
    alt: "Morning light through a window",
    caption: "Visual experiments",
    ratio: "landscape",
  },
];
