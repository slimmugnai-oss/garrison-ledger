import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import remarkGfm from "remark-gfm";

const nextConfig: NextConfig = {
  /* config options here */
  output: undefined, // Ensure we're not trying to export static files
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

const withMDX = createMDX({
  // Basic configuration to avoid serialization issues
});

export default withMDX(nextConfig);
