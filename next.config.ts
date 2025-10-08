import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: undefined, // Ensure we're not trying to export static files
  trailingSlash: false,
};

export default nextConfig;
