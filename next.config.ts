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
};

export default nextConfig;
