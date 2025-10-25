import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ultra-minimal configuration for Vercel
  output: "standalone",
  serverExternalPackages: ["pdf-parse", "esbuild"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
