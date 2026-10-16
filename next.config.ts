import path from "node:path";
import type { NextConfig } from "next";

// Static export: no server, so Cache Components and Partial Prerendering
// (enabled by the create-next-app template) are not used.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
