import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a plain static build in out/ (used for previews).
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  ...(staticExport
    ? { output: "export", distDir: ".next-export", images: { unoptimized: true } }
    : {}),
};

export default nextConfig;
