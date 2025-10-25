import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal configuration for Vercel
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse']
  },
  pageExtensions: ["js", "jsx", "ts", "tsx"]
};

export default nextConfig;
