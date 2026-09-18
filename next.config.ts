import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML/CSS/JS to `out/`, which any
  // static host serves as-is (GitHub Pages, Cloudflare Pages, Netlify).
  output: "export",
  // Emits `about/index.html` rather than `about.html`, so static hosts resolve
  // `/about/` without rewrite rules.
  trailingSlash: true,
  // No image optimization server exists on a static host.
  images: { unoptimized: true },
};

export default nextConfig;
