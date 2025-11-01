import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ultra-minimal configuration for Vercel
  serverExternalPackages: ["pdf-parse", "esbuild"],
  // Temporarily disable ESLint during build to fix configuration issues
  eslint: { ignoreDuringBuilds: true },

  // Security Headers (XSS, Clickjacking, Content Injection Protection)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://accounts.google.com https://*.clerk.dev https://*.clerk.accounts.dev https://clerk.garrisonledger.com https://www.googletagmanager.com https://*.googletagmanager.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://*.clerk.dev https://clerk.garrisonledger.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.clerk.dev https://*.clerk.accounts.dev https://clerk.garrisonledger.com https://www.googletagmanager.com https://*.googletagmanager.com https://vercel.live https://*.google-analytics.com https://*.analytics.google.com",
              "frame-src 'self' https://js.stripe.com https://accounts.google.com https://*.clerk.dev https://*.clerk.accounts.dev https://clerk.garrisonledger.com https://vercel.live",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

export default nextConfig;
