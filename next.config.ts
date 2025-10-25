import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "supabase.co",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix pdf-parse build error - externalize for server
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
      };

      // Externalize pdf-parse to avoid bundling test files
      if (!Array.isArray(config.externals)) {
        config.externals = [];
      }
      config.externals.push("pdf-parse");
    }
    return config;
  },
};

export default nextConfig;
