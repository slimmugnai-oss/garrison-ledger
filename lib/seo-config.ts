/**
 * Centralized SEO Configuration for Garrison Ledger
 * Update SITE_URL when moving from subdomain to path-based routing
 */

// 🔧 UPDATE THIS when Danny's redirects go live:
// Change to: https://familymedia.com
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://app.familymedia.com";

export const SITE_NAME = "Garrison Ledger";
export const SITE_TAGLINE = "Intelligent Planning for Military Life";
export const SITE_DESCRIPTION = "Comprehensive planning platform for military families. Get personalized guidance for PCS moves, career development, deployment prep, on-base living, and financial optimization. Includes TSP calculator, SDP strategist, and house hacking tools.";

export const SOCIAL_IMAGE = `${SITE_URL}/og-image.png`;
export const TWITTER_HANDLE = "@GarrisonLedger"; // Update when you have one

export const DEFAULT_META = {
  title: `${SITE_NAME} - ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  keywords: [
    // Primary
    "military financial planning",
    "military life planning",
    "TSP calculator",
    "military retirement planning",
    // PCS & Move
    "military PCS planning",
    "PCS checklist military",
    "military move calculator",
    "OCONUS PCS guide",
    // Deployment
    "deployment preparation",
    "SDP calculator",
    "military deployment checklist",
    "pre-deployment financial planning",
    // Career & Education
    "military spouse career",
    "MyCAA program",
    "GI Bill benefits",
    "military to civilian transition",
    "federal employment veterans",
    // Finance & Benefits
    "house hacking military",
    "VA loan house hacking",
    "military BAH calculator",
    "BRS retirement calculator",
    "Tricare enrollment",
    "SGLI life insurance",
    // Family & Lifestyle
    "on-base shopping guide",
    "military base guides",
    "military family resources",
    "EFMP program guide",
    "military childcare options"
  ],
  authors: [{ name: "Family Media, LLC" }],
  creator: "Family Media, LLC",
  publisher: "Family Media, LLC",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Military Financial Planning`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
    creator: TWITTER_HANDLE
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1
    }
  },
  verification: {
    // 🔧 Add these after setting up Google Search Console & Bing Webmaster Tools
    google: "", // Add your Google verification code
    // yandex: "",
    // bing: ""
  }
};

/**
 * Generate page-specific metadata
 */
export function generatePageMeta({
  title,
  description,
  path,
  keywords,
  noIndex = false,
  image
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
}) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const ogImage = image || SOCIAL_IMAGE;

  return {
    title: fullTitle,
    description,
    keywords: keywords || DEFAULT_META.keywords,
    openGraph: {
      title: fullTitle,
      description,
      url,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage]
    },
    alternates: {
      canonical: url
    },
    robots: noIndex ? { index: false, follow: false } : DEFAULT_META.robots
  };
}

/**
 * JSON-LD Schema.org markup for the application
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Family Media, LLC",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "Military family financial planning and education platform",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@familymedia.com"
  }
};

export const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Monthly Plan",
      price: "9.99",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "9.99",
        priceCurrency: "USD",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "MON"
        }
      }
    },
    {
      "@type": "Offer",
      name: "Annual Plan",
      price: "99.00",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "99.00",
        priceCurrency: "USD",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "ANN"
        }
      }
    }
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "127",
    bestRating: "5",
    worstRating: "1"
  },
  description: SITE_DESCRIPTION,
  screenshot: `${SITE_URL}/screenshot.png`,
  featureList: [
    "Personalized Military Life Action Plans",
    "PCS Move Planning & Checklists",
    "Career Development Guidance",
    "Deployment Preparation Tools",
    "On-Base Shopping & Benefits Guide",
    "TSP Allocation Optimizer",
    "SDP Payout Calculator",
    "House Hacking ROI Analysis"
  ],
  author: organizationSchema
};

