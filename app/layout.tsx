import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { GoogleAnalytics } from '@next/third-parties/google';
import { DEFAULT_META, softwareAppSchema, organizationSchema } from "@/lib/seo-config";
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
          className={`${inter.variable} ${lora.variable} font-sans antialiased bg-background text-text-body`}
        >
          {children}
          <GoogleAnalytics gaId="G-TCPN1EGMD8" />
        </body>
      </html>
    </ClerkProvider>
  );
}
