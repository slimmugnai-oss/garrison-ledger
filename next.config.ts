import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: undefined, // Ensure we're not trying to export static files
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'supabase.co',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix pdf-parse build error - ignore test files
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
      };
      
      // Ignore pdf-parse test files during build
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'commonjs canvas',
      });
    }
    return config;
  },
};

export default nextConfig;
