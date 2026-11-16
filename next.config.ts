import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a plain static build in out/ (used for previews).
// NEXT_PUBLIC_BASE_PATH (e.g. /dramebazz-portfolio) serves it from a
// sub-folder, as GitHub Pages does.
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  ...(staticExport
    ? {
        output: "export",
        distDir: ".next-export",
        images: { unoptimized: true },
        ...(basePath ? { basePath, trailingSlash: true } : {}),
      }
    : {}),
};

export default nextConfig;
