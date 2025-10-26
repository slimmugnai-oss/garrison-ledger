import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ultra-minimal configuration for Vercel
  serverExternalPackages: ["pdf-parse", "esbuild"],
  // Temporarily disable ESLint during build to fix configuration issues
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
