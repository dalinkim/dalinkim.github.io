import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages serves static files only, so export the whole site as HTML.
  output: "export",
  // Emit /about/index.html instead of /about.html so Pages serves clean URLs.
  trailingSlash: true,
  // The image optimizer needs a server; Pages can't run one.
  images: { unoptimized: true },
};

export default nextConfig;
