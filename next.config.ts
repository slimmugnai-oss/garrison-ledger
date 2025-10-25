import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ultra-minimal configuration for Vercel
  serverExternalPackages: ["pdf-parse", "esbuild"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
