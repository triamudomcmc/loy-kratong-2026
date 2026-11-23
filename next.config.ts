import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server for the Docker image (see Dockerfile).
  output: "standalone",
  // These packages must stay external: wordcut loads its dictionaries through __dirname,
  // and chromium ships a binary that cannot be bundled.
  serverExternalPackages: ["wordcut", "puppeteer-core", "@sparticuz/chromium"],
  // The old moderation page moved to /admin; keep old bookmarks working.
  async redirects() {
    return [{ source: "/filter", destination: "/admin", permanent: false }];
  },
  outputFileTracingIncludes: {
    "/api/capture": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    // Server Actions (pushKratong) run under whichever page route posts them.
    "/*": ["./node_modules/wordcut/data/*.txt"],
  },
};

export default nextConfig;
