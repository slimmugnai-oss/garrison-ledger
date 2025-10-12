import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
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
  title: "Garrison Ledger",
  description: "Personal finance tracking and management application",
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
        <body
          className={`${inter.variable} ${lora.variable} font-sans antialiased bg-background text-text-body`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
