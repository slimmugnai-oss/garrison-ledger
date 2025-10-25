import { ClerkProvider } from "@clerk/nextjs";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";

import { DEFAULT_META, softwareAppSchema, organizationSchema } from "@/lib/seo-config";

import PageViewTracker from "./components/analytics/PageViewTracker";
import ReferralCapture from "./components/auth/ReferralCapture";
import KeyboardShortcuts from "./components/ui/KeyboardShortcuts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...DEFAULT_META,
  icons: {
    icon: [
      { url: "/next.svg", sizes: "any" },
      { url: "/next.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/next.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    shortcut: "/next.svg",
    apple: "/next.svg",
  },
  ...(process.env.NEXT_PUBLIC_ENV !== "production"
    ? { robots: { index: false, follow: false } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
          />
        </head>
        <body
          className={`${inter.variable} ${lora.variable} text-text-body bg-background font-sans antialiased`}
        >
          <ReferralCapture />
          <KeyboardShortcuts />
          <PageViewTracker />
          {children}
          <GoogleAnalytics gaId="G-TCPN1EGMD8" />
        </body>
      </html>
    </ClerkProvider>
  );
}
