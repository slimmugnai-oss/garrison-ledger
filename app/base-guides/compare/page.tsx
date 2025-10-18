import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { generatePageMeta } from "@/lib/seo-config";
import BaseComparisonClient from "./BaseComparisonClient";

export const metadata: Metadata = generatePageMeta({
  title: "Military Base Comparison Tool - Compare Housing, BAH & Schools | Garrison Ledger",
  description: "Compare military bases side-by-side: BAH rates, housing options, school ratings, and PCS considerations. Make informed decisions for your next duty station.",
  path: "/base-guides/compare",
  keywords: [
    "military base comparison",
    "compare military bases",
    "BAH comparison",
    "military housing comparison",
    "base school ratings",
    "PCS base selection",
    "duty station comparison",
    "military installation comparison"
  ]
});

interface PageProps {
  searchParams: {
    bases?: string;
  };
}

export default function BaseComparisonPage({ searchParams }: PageProps) {
  const baseIds = searchParams.bases?.split(',') || [];

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="text-sm font-semibold">Base Comparison Tool</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-serif font-black mb-6 leading-tight">
                Compare Military Bases
              </h1>
              
              <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
                Side-by-side comparison of BAH rates, housing options, school ratings, and PCS considerations to make the best decision for your next duty station.
              </p>
            </div>
          </div>
        </section>

        {/* Main Comparison Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          }>
            <BaseComparisonClient baseIds={baseIds} />
          </Suspense>
        </div>
      </div>

      <Footer />
      
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Military Base Comparison Tool",
            "description": "Compare military bases side-by-side for housing, BAH rates, schools, and PCS considerations",
            "url": "https://garrisonledger.com/base-guides/compare",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
    </>
  );
}
