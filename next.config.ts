import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // These packages must stay external: wordcut loads its dictionaries through __dirname,
  // and chromium ships a binary that cannot be bundled.
  serverExternalPackages: ["firebase-admin", "wordcut", "puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/capture": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    // Server Actions (pushKratong) run under whichever page route posts them.
    "/*": ["./node_modules/wordcut/data/*.txt"],
  },
};

export default nextConfig;
