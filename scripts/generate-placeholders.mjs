/**
 * Generates the art-directed placeholder imagery (and a stub resume) so the
 * site ships with no broken images. Real assets simply overwrite these files.
 *
 *   npm run placeholders            # writes only missing files
 *   npm run placeholders -- --force # regenerates everything
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const force = process.argv.includes("--force");

const C = {
  ink: "#151514",
  deep: "#262523",
  paper: "#f1f0ec",
  stone: "#d9d7d0",
  smoke: "#8f8d86",
  accent: "#d9431b",
};

const grain = (w, h, opacity = 0.1) => `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <rect id="grain-layer" width="${w}" height="${h}" filter="url(#grain)" opacity="${opacity}"/>`;

const svg = (w, h, body, grainOpacity = 0.1) => {
  const g = grain(w, h, grainOpacity);
  const [filter, layer] = [g.slice(0, g.indexOf("<rect id")), g.slice(g.indexOf("<rect id"))];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${filter}
    <filter id="soft"><feGaussianBlur stdDeviation="40"/></filter>
    <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  ${body}
  ${layer}
</svg>`;
};

const rings = (cx, cy, from, to, step, color, opacity) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) =>
    `<circle cx="${cx}" cy="${cy}" r="${from + i * step}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="2"/>`
  ).join("");

const images = {
  // Feature: a single bold form in a dark field.
  "projects/project-01.webp": [2400, 1350, svg(2400, 1350, `
    <rect width="2400" height="1350" fill="${C.ink}"/>
    <radialGradient id="a1" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#ff7a4d"/><stop offset="0.55" stop-color="${C.accent}"/><stop offset="1" stop-color="#7c220a"/>
    </radialGradient>
    ${rings(1640, 760, 700, 1300, 120, C.paper, 0.06)}
    <circle cx="1640" cy="760" r="560" fill="url(#a1)"/>
    <circle cx="1460" cy="560" r="260" fill="#ffb08f" opacity="0.35" filter="url(#soft)"/>
    <rect x="160" y="1010" width="560" height="2" fill="${C.paper}" opacity="0.35"/>
    <rect x="160" y="240" width="96" height="96" fill="${C.paper}"/>`, 0.12)],

  // Tall: stacked slabs, a system of parts.
  "projects/project-02.webp": [1600, 2000, svg(1600, 2000, `
    <rect width="1600" height="2000" fill="${C.stone}"/>
    <rect x="270" y="560" width="520" height="1080" rx="56" fill="${C.ink}" opacity="0.25" filter="url(#soft)" transform="translate(30 60)"/>
    <rect x="270" y="560" width="520" height="1080" rx="56" fill="${C.ink}"/>
    <rect x="830" y="380" width="520" height="1080" rx="56" fill="${C.ink}" opacity="0.2" filter="url(#soft)" transform="translate(30 60)"/>
    <rect x="830" y="380" width="520" height="1080" rx="56" fill="${C.paper}"/>
    <circle cx="1090" cy="760" r="150" fill="${C.accent}"/>
    <rect x="950" y="1000" width="280" height="22" rx="11" fill="${C.ink}" opacity="0.8"/>
    <rect x="950" y="1050" width="190" height="22" rx="11" fill="${C.ink}" opacity="0.3"/>
    <circle cx="530" cy="1500" r="44" fill="${C.paper}" opacity="0.9"/>`, 0.1)],

  // Offset: twelve steps reduced to three.
  "projects/project-03.webp": [1500, 2000, svg(1500, 2000, `
    <rect width="1500" height="2000" fill="#dedbd2"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${150 + i * 100}" y="300" width="2" height="560" fill="${C.ink}" opacity="${0.08 + i * 0.02}"/>`).join("")}
    <path d="M0 2000 L0 1100 A900 900 0 0 1 900 2000 Z" fill="${C.ink}"/>
    <circle cx="1000" cy="1180" r="70" fill="${C.ink}" opacity="0.18"/>
    <circle cx="1170" cy="1180" r="70" fill="${C.ink}" opacity="0.4"/>
    <circle cx="1340" cy="1180" r="70" fill="${C.accent}"/>`, 0.09)],

  // Wide: a swatch grid, tokens as material.
  "projects/project-04.webp": [2400, 1600, svg(2400, 1600, `
    <rect width="2400" height="1600" fill="#2a2926"/>
    <circle cx="600" cy="300" r="600" fill="#4a4844" opacity="0.6" filter="url(#soft)"/>
    ${[["#f1f0ec", "#d9d7d0", "#b9b7b0", "#8f8d86", "#5f5e59", "#3a3936"],
       ["#ffe0d4", "#ffb08f", "#ff7a4d", "#d9431b", "#a3300f", "#6d1f08"],
       ["#f1f0ec", "#151514", "#f1f0ec", "#151514", "#f1f0ec", "#151514"]]
      .map((row, r) => row.map((c, i) =>
        `<rect x="${560 + i * 220}" y="${380 + r * 300}" width="190" height="${r === 2 ? 60 : 250}" rx="${r === 2 ? 30 : 6}" fill="${c}"/>`).join("")).join("")}`, 0.1)],

  // Compact: motion trail on the accent.
  "projects/project-05.webp": [1600, 1200, svg(1600, 1200, `
    <rect width="1600" height="1200" fill="${C.accent}"/>
    ${Array.from({ length: 7 }, (_, i) => `<circle cx="${380 + i * 140}" cy="${760 - i * 60}" r="${150 + i * 6}" fill="${C.ink}" opacity="${0.08 + i * 0.13}"/>`).join("")}
    <rect x="160" y="980" width="1280" height="3" fill="${C.ink}" opacity="0.4"/>`, 0.12)],

  // Archive: soft, photographic, deliberately out of focus.
  "archive/archive-01.webp": [1200, 1600, svg(1200, 1600, `
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c2335"/><stop offset="0.55" stop-color="#5a4a63"/><stop offset="0.78" stop-color="#e0855a"/><stop offset="1" stop-color="#f4c08a"/>
    </linearGradient>
    <rect width="1200" height="1600" fill="url(#dusk)"/>
    <g filter="url(#blur8)" fill="#121218">
      <rect x="0" y="1180" width="180" height="420"/><rect x="160" y="1040" width="140" height="560"/>
      <rect x="290" y="1220" width="220" height="380"/><rect x="500" y="960" width="110" height="640"/>
      <rect x="600" y="1150" width="260" height="450"/><rect x="850" y="1080" width="150" height="520"/>
      <rect x="990" y="1250" width="210" height="350"/>
    </g>
    <circle cx="820" cy="1180" r="70" fill="#ffd9a8" opacity="0.7" filter="url(#soft)"/>`, 0.14)],

  "archive/archive-02.webp": [1600, 1200, svg(1600, 1200, `
    <filter id="pan"><feGaussianBlur stdDeviation="60 3"/></filter>
    <rect width="1600" height="1200" fill="#cfd5d6"/>
    <g filter="url(#pan)">
      <rect y="0" width="1600" height="560" fill="#dfe3e1"/>
      <rect y="560" width="1600" height="300" fill="#5d7a80"/>
      <rect y="860" width="1600" height="340" fill="#c9b79a"/>
      <rect x="300" y="820" width="500" height="80" fill="#e9e4da"/>
    </g>
    <rect y="0" width="70" height="1200" fill="#1b1c1c"/><rect x="1530" y="0" width="70" height="1200" fill="#1b1c1c"/>`, 0.14)],

  "archive/archive-03.webp": [1400, 1400, svg(1400, 1400, `
    <rect width="1400" height="1400" fill="#0d0b0b"/>
    <g filter="url(#soft)">
      <path d="M380 0 L120 1400 L640 1400 Z" fill="#c2301a" opacity="0.55"/>
      <path d="M1020 0 L760 1400 L1300 1400 Z" fill="#e8743a" opacity="0.45"/>
      <path d="M700 0 L560 1400 L860 1400 Z" fill="#f2d2b6" opacity="0.25"/>
    </g>
    ${[[260, 420, 46], [520, 300, 30], [980, 380, 54], [1150, 620, 26], [700, 520, 38]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffc7a1" opacity="0.5" filter="url(#blur8)"/>`).join("")}
    <rect y="1180" width="1400" height="220" fill="#060505"/>`, 0.16)],

  "archive/archive-04.webp": [1200, 1600, svg(1200, 1600, `
    <rect width="1200" height="1600" fill="${C.paper}"/>
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${240 + i * 90}" cy="${1220 - i * 110}" r="120" fill="${i === 8 ? C.accent : C.ink}" opacity="${i === 8 ? 1 : 0.05 + i * 0.07}"/>`).join("")}
    <rect x="120" y="1440" width="960" height="2" fill="${C.ink}" opacity="0.3"/>`, 0.08)],

  "archive/archive-05.webp": [1600, 1200, svg(1600, 1200, `
    <rect width="1600" height="1200" fill="#9a958b"/>
    <g filter="url(#soft)">
      <path d="M620 160 L1180 160 L1420 1040 L860 1040 Z" fill="#f3e2c4" opacity="0.85"/>
    </g>
    <g filter="url(#blur8)" fill="#7d786f">
      <rect x="880" y="140" width="34" height="920" transform="skewX(15)"/>
      <rect x="600" y="580" width="840" height="30" transform="skewX(15)"/>
    </g>
    <rect y="1040" width="1600" height="160" fill="#6f6a61"/>`, 0.14)],

  // Portrait pair: neutral at rest, accent-lit on hover. Replace with two
  // photos of the same framing and size.
  "portrait/portrait.webp": [1200, 1500, portrait("#3b3a37", "#6a6862", "#1a1918", "#f1f0ec")],
  "portrait/portrait-alt.webp": [1200, 1500, portrait("#7c220a", C.accent, "#151514", "#ffd2bf")],
};

function portrait(bgA, bgB, figure, rim) {
  return svg(1200, 1500, `
    <radialGradient id="pbg" cx="0.3" cy="0.2" r="1">
      <stop offset="0" stop-color="${bgB}"/><stop offset="1" stop-color="${bgA}"/>
    </radialGradient>
    <filter id="dof"><feGaussianBlur stdDeviation="16"/></filter>
    <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${rim}" stop-opacity="0.35"/><stop offset="0.45" stop-color="${rim}" stop-opacity="0"/>
    </linearGradient>
    <rect width="1200" height="1500" fill="url(#pbg)"/>
    <g filter="url(#dof)">
      <g fill="${figure}" transform="rotate(-5 640 640)">
        <ellipse cx="640" cy="620" rx="185" ry="235"/>
        <path d="M560 800 C560 900 540 960 480 1000 L800 1000 C740 960 720 900 720 800 Z"/>
      </g>
      <path d="M120 1500 C140 1180 330 1040 560 1000 L760 990 C980 1020 1120 1160 1160 1500 Z" fill="${figure}"/>
      <ellipse cx="560" cy="560" rx="70" ry="160" fill="url(#side)" transform="rotate(-5 640 640)"/>
    </g>
    <rect width="1200" height="1500" fill="url(#side)" opacity="0.4"/>`, 0.14);
}

function ogImage() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="${C.ink}"/>
    <circle cx="1080" cy="560" r="300" fill="${C.accent}"/>
    <text x="80" y="300" font-family="Helvetica Neue, Arial, sans-serif" font-size="112" font-weight="600" letter-spacing="-5" fill="${C.paper}">Dramebazz<tspan fill="${C.accent}">.</tspan></text>
    <text x="84" y="380" font-family="Helvetica Neue, Arial, sans-serif" font-size="40" fill="${C.smoke}">Product Designer</text>
  </svg>`;
}

// One-page PDF stub so the Resume link never 404s.
function resumePdf() {
  const text = "Resume coming soon. Replace public/resume.pdf with your own file.";
  const stream = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}

const shouldWrite = (file) => force || !existsSync(file);

for (const [rel, [w, h, markup]] of Object.entries(images)) {
  const file = join(root, rel);
  if (!shouldWrite(file)) continue;
  mkdirSync(dirname(file), { recursive: true });
  await sharp(Buffer.from(markup)).resize(w, h).webp({ quality: 82 }).toFile(file);
  console.log("wrote", rel);
}

const og = join(root, "og-image.png");
if (shouldWrite(og)) {
  await sharp(Buffer.from(ogImage())).png().toFile(og);
  console.log("wrote og-image.png");
}

const resume = join(root, "resume.pdf");
if (shouldWrite(resume)) {
  writeFileSync(resume, resumePdf());
  console.log("wrote resume.pdf");
}
