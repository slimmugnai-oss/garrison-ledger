/**
 * BASE NAVIGATOR - MAIN UI
 *
 * Family Fit Score for military base neighborhoods
 * Premium feature with free preview (top 3 results)
 */

import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import basesAllData from "@/lib/data/bases-all.json";
import { 
  generateSEOTitle, 
  generateSEODescription, 
  generateOGTitle, 
  generateOGDescription 
} from "@/lib/seo/base-keywords";
import {
  generatePlaceSchema,
  generateWebPageSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/base-schema";

const bases = basesAllData.bases;

import BaseNavigatorClient from "./BaseNavigatorClient";

export async function generateStaticParams() {
  return bases.map((base) => ({
    base: base.code.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ base: string }>;
}): Promise<Metadata> {
  const { base } = await params;
  const baseData = bases.find((b) => b.code.toLowerCase() === base.toLowerCase());

  if (!baseData) {
    return { title: "Base Navigator" };
  }

  // Generate SEO-optimized metadata
  const seoTitle = generateSEOTitle(baseData);
  const seoDescription = generateSEODescription(baseData);
  const ogTitle = generateOGTitle(baseData);
  const ogDescription = generateOGDescription(baseData);
  const baseUrl = `https://www.garrisonledger.com/dashboard/navigator/${baseData.code}`;
  const baseName = baseData.name.split(',')[0].trim();

  return {
    title: seoTitle,
    description: seoDescription,
    
    // Open Graph
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: baseUrl,
      siteName: 'Garrison Ledger',
      type: 'website',
      images: [
        {
          url: '/og-base-navigator.png', // TODO: Create base-specific OG images
          width: 1200,
          height: 630,
          alt: `${baseName} Neighborhood Guide for Military Families`,
        },
      ],
      locale: 'en_US',
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: ['/og-base-navigator.png'],
    },
    
    // Additional SEO
    keywords: [
      `${baseName} housing`,
      `${baseName} schools`,
      `${baseName} neighborhoods`,
      `PCS to ${baseName}`,
      `${baseName} BAH`,
      `best neighborhoods near ${baseName}`,
      `${baseName} military housing`,
      `${baseName} off base housing`,
      `${baseData.state} military base`,
    ],
    
    alternates: {
      canonical: baseUrl,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BaseNavigatorPage({ params }: { params: Promise<{ base: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { base } = await params;
  const baseCode = base.toLowerCase(); // Codes are now lowercase (e.g., "shaw", "ftlb")

  // Find base data
  const baseData = bases.find((b) => b.code.toLowerCase() === baseCode);

  if (!baseData) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <h1 className="mb-4 text-2xl font-bold text-gray-900">Base Not Found</h1>
              <p className="mb-6 text-gray-600">
                Base code <code className="rounded bg-gray-100 px-2 py-1">{baseCode}</code> not
                found.
              </p>
              <Link
                href="/dashboard/navigator"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                ← Browse All Bases
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Check premium status
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("tier, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPremium = entitlement?.tier === "premium" && entitlement?.status === "active";

  // Redirect non-premium users to upgrade page
  if (!isPremium) {
    redirect("/dashboard/upgrade?feature=base-navigator");
  }

  // Get user profile for BAH lookup
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("rank, current_base, has_dependents")
    .eq("user_id", user.id)
    .maybeSingle();

  // Query BAH rate if profile is complete
  let bahRateCents: number | null = null;
  let bahSource: "auto" | "manual" = "manual";

  // Check if we have a paygrade field (not rank title)
  // We need to query by paygrade, not by rank
  const { data: profileWithPaygrade } = await supabase
    .from("user_profiles")
    .select("paygrade, has_dependents")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileWithPaygrade?.paygrade && profileWithPaygrade?.has_dependents !== null && baseData.mha) {
    // Normalize paygrade format to E0X format (handles "E-7", "E7", "E07" → "E07")
    let normalizedPaygrade = profileWithPaygrade.paygrade;
    
    // E-7 → E07 (single digit with hyphen)
    normalizedPaygrade = normalizedPaygrade.replace(/^([EOW])-(\d)$/, "$10$2");
    // E7 → E07 (single digit without hyphen)
    normalizedPaygrade = normalizedPaygrade.replace(/^([EOW])(\d)$/, "$10$2");
    // E-07 → E07 (already has zero, just remove hyphen)
    normalizedPaygrade = normalizedPaygrade.replace(/^([EOW])-0(\d)$/, "$10$2");
    
    console.log(`[BAH_AUTO_FILL] Querying BAH: MHA=${baseData.mha}, Paygrade=${normalizedPaygrade}, Deps=${profileWithPaygrade.has_dependents}`);

    const { data: bahRate, error: bahError } = await supabase
      .from("bah_rates")
      .select("rate_cents")
      .eq("mha", baseData.mha)
      .eq("paygrade", normalizedPaygrade)
      .eq("with_dependents", profileWithPaygrade.has_dependents)
      .eq("effective_date", "2025-01-01")
      .maybeSingle();

    if (bahError) {
      console.error(`[BAH_AUTO_FILL] Database error:`, bahError);
    }

    if (bahRate) {
      bahRateCents = bahRate.rate_cents;
      bahSource = "auto";
      console.log(`[BAH_AUTO_FILL] SUCCESS! BAH = $${bahRate.rate_cents / 100}`);
    } else {
      console.log(`[BAH_AUTO_FILL] No BAH rate found for: ${normalizedPaygrade} at ${baseData.mha} with deps=${profileWithPaygrade.has_dependents}`);
    }
  } else {
    console.log(`[BAH_AUTO_FILL] Missing data - paygrade: ${profileWithPaygrade?.paygrade}, deps: ${profileWithPaygrade?.has_dependents}, mha: ${baseData.mha}`);
  }

  // Get user's watchlist for this base (if exists)
  const { data: watchlist } = await supabase
    .from("user_watchlists")
    .select("*")
    .eq("user_id", user.id)
    .eq("base_code", baseCode)
    .maybeSingle();

  // Generate schema.org structured data for SEO
  const placeSchema = generatePlaceSchema(baseData);
  const webPageSchema = generateWebPageSchema(baseData);
  const faqSchema = generateFAQSchema(baseData);
  const breadcrumbSchema = generateBreadcrumbSchema(baseData);

  return (
    <>
      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Header />
      <BaseNavigatorClient
        base={baseData}
        isPremium={true}
        userProfile={{
          rank: profile?.rank,
          currentBase: profile?.current_base,
          hasDependents: profile?.has_dependents,
        }}
        initialWatchlist={watchlist}
        initialBahCents={bahRateCents}
        bahSource={bahSource}
      />
      <Footer />
    </>
  );
}
