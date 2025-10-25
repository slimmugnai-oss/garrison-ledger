import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Vercel with MDX support
  serverExternalPackages: ["pdf-parse", "esbuild"],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  eslint: {
    // Disable ESLint during build to avoid config issues
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle esbuild issues with MDX bundler
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    // Exclude esbuild from client-side bundling
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push("esbuild");
    }

    return config;
  },
};

export default nextConfig;
