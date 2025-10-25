import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ultra-minimal configuration for Vercel
  serverExternalPackages: ["pdf-parse", "esbuild"],
  // REMOVED: eslint/typescript ignores - enforce quality
};

export default nextConfig;
