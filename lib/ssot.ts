/**
 * SINGLE SOURCE OF TRUTH (SSOT)
 *
 * All user-facing facts, counts, and model/cost truths must reference this module.
 * DO NOT hardcode values in UI, docs, or admin panels.
 *
 * Last Updated: 2025-01-19
 */

export const ssot = {
  /**
   * SYSTEM VERSION & METADATA
   */
  lastUpdatedISO: "2025-01-19",
  version: "4.0.0",
  environment: process.env.NODE_ENV || "development",

  /**
   * BRAND & DESIGN SYSTEM
   */
  brand: {
    name: "Garrison Ledger",
    tagline: "Military Financial Intelligence Platform",
    primary: "slate-900→slate-800", // Primary brand gradient
    semantics: {
      success: "green-600",
      warn: "amber-600",
      danger: "red-600",
      info: "blue-600",
    },
    typography: {
      headings: "Lora",
      body: "Inter",
    },
  },

  /**
   * AI MODELS & COSTS
   */
  models: {
    planGeneration: {
      provider: "Google",
      model: "Gemini-2.0-Flash",
      approxCostPerPlanUSD: 0.02,
      maxTokens: 8192,
      temperature: 0.7,
    },
    explainers: {
      provider: "Google",
      model: "Gemini-2.0-Flash",
    },
    assessment: {
      provider: "Google",
      model: "Gemini-2.0-Flash",
    },
    // Legacy reference (for documentation only)
    legacy: {
      provider: "OpenAI",
      model: "GPT-4o",
      approxCostPerPlanUSD: 0.25,
    },
  },

  /**
   * FEATURE STATUS
   * Track what's live, deprecated, or removed
   */
  features: {
    baseComparison: {
      status: "removed",
      reason: "factual-only policy",
      removedDate: "2025-01-19",
      replacement: "Individual base guides with official data",
    },
    naturalSearch: {
      status: "removed",
      reason: "cost optimization",
      removedDate: "2025-01-18",
    },
    baseGuides: {
      status: "active",
      version: "elite",
      totalBases: 203,
    },
    pcsMoneyCopilot: {
      status: "active",
      tier: "premium-exclusive",
    },
    aiPlanGeneration: {
      status: "active",
      tier: "all-tiers",
    },
    lesAuditor: {
      status: "beta",
      tier: "free-and-premium",
      freeUploadsPerMonth: 1,
      premiumUploadsPerMonth: null, // unlimited
      maxFileSizeMB: 5,
      supportedFormats: ["PDF"],
      futureFormats: ["image-ocr", "manual-entry"],
    },
    askAssistant: {
      status: "active",
      tier: "all-tiers",
      model: "Gemini-2.5-Flash",
      modelNote: "GA since June 2025, production-stable",
      rateLimits: {
        free: { questionsPerMonth: 5, maxTokens: 2048, fileAnalysis: false },
        premium: { questionsPerMonth: 50, maxTokens: 4096, fileAnalysis: false },
      },
      creditPacks: [
        { credits: 25, priceCents: 199 },
        { credits: 100, priceCents: 599 },
        { credits: 250, priceCents: 999 },
      ],
    },
    intelLibrary: {
      status: "deprecated",
      reason: "Transformed into Ask Assistant",
      deprecatedDate: "2025-01-23",
      replacement: "/dashboard/ask",
    },
  },

  /**
   * PRICING & MONETIZATION
   */
  pricing: {
    subscription: {
      monthly: {
        priceUSD: 9.99,
        priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
        productId: "prod_TE5hK7gmtxzx1R",
      },
      annual: {
        priceUSD: 99,
        priceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || "",
        productId: "prod_TE5hK7gmtxzx1R",
        savings: 20, // $99 vs $119.88
      },
    },
    questionPacks: {
      pack25: {
        questions: 25,
        priceUSD: 1.99,
        priceId: process.env.STRIPE_QUESTION_PACK_25_PRICE_ID || "",
        productId: "prod_TI2nU6NbiSqE3u",
        perQuestionCost: 0.0796,
      },
      pack100: {
        questions: 100,
        priceUSD: 5.99,
        priceId: process.env.STRIPE_QUESTION_PACK_100_PRICE_ID || "",
        productId: "prod_TI2pfWg3kcUG3l",
        perQuestionCost: 0.0599,
      },
      pack250: {
        questions: 250,
        priceUSD: 9.99,
        priceId: process.env.STRIPE_QUESTION_PACK_250_PRICE_ID || "",
        productId: "prod_TI2qsCEXsNzfvS",
        perQuestionCost: 0.03996,
      },
    },
  },

  /**
   * PLATFORM COUNTS
   * These should be computed at build/CI time
   * Manual edits discouraged - use generated/metrics.json
   */
  counts: {
    // Build-time generated (TODO: CI script)
    pages: 130, // From build output
    apiRoutes: 98, // After natural-search removal

    // Base counts (from bases-clean.ts)
    bases: {
      conus: 163,
      oconus: 40,
      total: 203,
    },

    // User metrics (should come from analytics)
    users: {
      total: null, // Populated from database
      premium: null,
      free: null,
    },
  },

  /**
   * EXTERNAL DATA VENDORS
   */
  vendors: {
    weather: {
      name: "Google Weather API",
      provider: "Google",
      cacheDays: 1,
      cacheHours: 24,
      attribution: "Google",
      licenseDoc: "docs/vendors/weather.md",
      apiUrl: "https://weather.googleapis.com/v1/currentConditions:lookup",
    },
    housing: {
      name: "Zillow Market Data",
      provider: "RapidAPI",
      cacheDays: 30,
      attribution: "Zillow",
      licenseDoc: "docs/vendors/housing.md",
      apiUrl: "https://zillow-com1.p.rapidapi.com",
    },
    schools: {
      name: "GreatSchools",
      provider: "Direct API",
      gated: true, // Premium only
      cacheDays: 30,
      attribution: "GreatSchools",
      licenseDoc: "docs/vendors/greatschools.md",
      tier: "premium",
    },
    crime: {
      name: "Crime Data API",
      provider: "Configurable",
      cacheDays: 30,
      attribution: "Crime Data Provider",
      licenseDoc: "docs/vendors/crime.md",
      apiUrl: "https://api.crime-data.com/v1/crime",
    },
    amenities: {
      name: "Google Places API",
      provider: "Google",
      cacheDays: 30,
      attribution: "Google",
      licenseDoc: "docs/vendors/amenities.md",
      apiUrl: "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    },
    demographics: {
      name: "RapidAPI Demographics",
      provider: "RapidAPI",
      cacheDays: 30,
      attribution: "Demographics Provider",
      licenseDoc: "docs/vendors/demographics.md",
      apiUrl: "https://demographics-api.p.rapidapi.com/demographics",
    },
    military: {
      name: "Google Places API",
      provider: "Google",
      cacheDays: 30,
      attribution: "Google",
      licenseDoc: "docs/vendors/military.md",
      apiUrl: "https://maps.googleapis.com/maps/api/place/textsearch/json",
    },
  },

  /**
   * DATA INTEGRITY POLICY
   */
  dataPolicy: {
    factualOnly: true,
    provenanceRequired: true,
    fallback: "Show 'Unavailable' + source link if data cannot be fetched.",
    noSyntheticData: true,
    noEstimates: true,
    noRandomization: true,
    requireAttribution: true,
  },

  /**
   * SYSTEM CONSTANTS
   * Operational constants for tools and calculations
   */
  constants: {
    mileageCentsPerMileFallback: 67, // $0.67/mile (2025 DFAS rate)
    travelDayMieFactor: 0.75, // 75% M&IE on travel days (GSA rule)
  },

  /**
   * MILITARY PAY CONSTANTS
   * Official DoD pay and allowances (updated periodically)
   */
  militaryPay: {
    // Basic Allowance for Subsistence (BAS) - Monthly rates in cents
    // Source: DFAS - https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
    // As of: 2025-01-01
    // Updated: 2025-10-22 to official 2025 rates
    basMonthlyCents: {
      officer: 31698, // $316.98/month (2025 rate)
      enlisted: 46025, // $460.25/month (2025 rate)
    },
    // LES comparison thresholds
    comparisonThresholds: {
      bahDeltaCents: 500, // $5.00 variance threshold for BAH mismatch
      basDeltaCents: 100, // $1.00 variance threshold for BAS
      colaDeltaCents: 500, // $5.00 variance threshold for COLA
      specialPayDeltaCents: 500, // $5.00 variance threshold for special pays
    },
  },

  /**
   * COST STRUCTURE (for profitability tracking)
   */
  costs: {
    perUserMonthly: 0.35, // AI + API costs
    margin: 0.965, // 96.5% margin
    aiCostPerPlan: 0.02,
    weatherApiCostPer1000: 0.1,
    housingApiCostPer1000: 0.5,
    schoolsApiCostPer1000: 0.25,
  },

  /**
   * PERFORMANCE BUDGETS
   */
  performance: {
    pageLoadMaxSeconds: 3,
    coreWebVitals: {
      LCP: 2.5, // Largest Contentful Paint
      FID: 0.1, // First Input Delay
      CLS: 0.1, // Cumulative Layout Shift
    },
    bundleSize: {
      firstLoad: 200, // KB
      maxRoute: 50, // KB per route
    },
    mobile: {
      minTouchTarget: 44, // pixels (WCAG AAA)
      maxLoadTime3G: 5, // seconds
    },
  },

  /**
   * SECURITY & COMPLIANCE
   */
  security: {
    rlsEnabled: true,
    authProvider: "Clerk",
    rateLimiting: true,
    wcagLevel: "AA",
    encryptionAtRest: true,
  },

  /**
   * URLS & LINKS
   */
  urls: {
    production: "https://garrisonledger.com",
    github: "https://github.com/yourusername/garrison-ledger",
    docs: {
      systemStatus: "SYSTEM_STATUS.md",
      changelog: "CHANGELOG.md",
      development: "docs/DEVELOPMENT_WORKFLOW.md",
      iconUsage: "docs/ICON_USAGE_GUIDE.md",
    },
    external: {
      dfas: "https://www.dfas.mil",
      dodea: "https://www.dodea.edu",
      tsp: "https://www.tsp.gov",
      va: "https://www.va.gov",
    },
  },

  /**
   * CONTACT & SUPPORT
   */
  contact: {
    supportEmail: "support@garrisonledger.com",
    founderEmail: "hello@garrisonledger.com",
    veteranFounded: true,
    militarySpouseTeam: true,
  },
} as const;

/**
 * TYPE EXPORTS for TypeScript autocomplete
 */
export type BrandColors = typeof ssot.brand.semantics;
export type FeatureStatus = typeof ssot.features;
export type VendorConfig = typeof ssot.vendors;
export type PricingTier = keyof typeof ssot.pricing;

/**
 * HELPER FUNCTIONS
 */

/**
 * Get current AI model for a specific use case
 */
export function getAIModel(useCase: keyof typeof ssot.models) {
  return ssot.models[useCase];
}

/**
 * Check if a feature is active
 */
export function isFeatureActive(feature: keyof typeof ssot.features): boolean {
  return ssot.features[feature].status === "active";
}

/**
 * Get vendor config
 */
export function getVendor(vendor: keyof typeof ssot.vendors) {
  return ssot.vendors[vendor];
}

/**
 * Get cache TTL for a vendor in milliseconds
 */
export function getVendorCacheTTL(vendor: keyof typeof ssot.vendors): number {
  const config = ssot.vendors[vendor];
  return config.cacheDays * 24 * 60 * 60 * 1000;
}

/**
 * Format cost as USD currency
 */
export function formatCost(cost: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cost);
}

/**
 * Get pricing for a specific tier
 */
export function getPricing(tier: PricingTier) {
  return ssot.pricing[tier];
}

/**
 * VALIDATION: Ensure all critical env vars are present
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GOOGLE_API_KEY",
    "RAPIDAPI_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Export default for easy import
 */
export default ssot;
