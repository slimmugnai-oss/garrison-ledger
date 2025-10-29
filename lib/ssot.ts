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
  lastUpdatedISO: "2025-10-29",
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
      model: "Gemini-2.5-Flash",
      approxCostPerPlanUSD: 0.02,
      maxTokens: 8192,
      temperature: 0.7,
    },
    explainers: {
      provider: "Google",
      model: "Gemini-2.5-Flash",
    },
    assessment: {
      provider: "Google",
      model: "Gemini-2.5-Flash",
    },
    pcsOCR: {
      provider: "Google",
      model: "Gemini-2.5-Flash",
      approxCostPerDocumentUSD: 0.0003,
      features: ["vision", "structured_output", "json_mode"],
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
      specialPays: {
        supported: ["SDAP", "IDP", "FSA", "FLPP", "SEA", "FLIGHT", "SUB", "DIVE", "JUMP", "HDP"],
        implementation: "hybrid", // user_profiles for 4 legacy, catalog for new pays
        v1Flat: ["SDAP", "IDP", "FSA", "FLPP", "HDP"], // flat_monthly rates
        v1RateTables: ["SEA", "FLIGHT", "SUB", "DIVE", "JUMP"], // deferred to v2
        catalogTable: "special_pay_catalog",
        assignmentsTable: "user_special_pay_assignments",
      },
      czte: {
        enabled: true,
        version: "v1_simple_boolean",
        profileField: "currently_deployed_czte",
        futureEnhancement: "full_deployment_table_with_dates",
      },
    },
    askAssistant: {
      status: "active",
      tier: "all-tiers",
      model: "Gemini-2.5-Flash",
      modelNote: "GA since June 2025, production-stable",
      rateLimits: {
        free: { questionsPerMonth: 5, maxTokens: 3072, fileAnalysis: false },
        premium: { questionsPerMonth: 50, maxTokens: 6144, fileAnalysis: false },
      },
      creditPacks: [
        { credits: 25, priceCents: 199 },
        { credits: 100, priceCents: 599 },
        { credits: 250, priceCents: 999 },
      ],
      creditExpiration: {
        initialDays: 30, // Credits expire after 30 days
        refreshType: "monthly", // Monthly refresh of credits
        rollover: false, // Unused credits don't roll over
      },
      initialization: {
        maxRetries: 3, // Retry credit initialization up to 3 times
        retryDelayMs: 200, // Start with 200ms delay, doubles each retry
        backupTrigger: true, // Database trigger acts as backup if webhook fails
      },
      // RAG (Retrieval-Augmented Generation) System - NEW!
      rag: {
        enabled: true,
        embeddingModel: "text-embedding-3-small", // OpenAI, 1536 dimensions
        embeddingCostPer1M: 0.02, // $0.02 per 1M tokens
        vectorDB: "Supabase pgvector", // Free with existing Supabase plan
        searchAlgorithm: "HNSW", // Hierarchical Navigable Small World
        similarityThreshold: 0.7, // Minimum cosine similarity for results
        maxChunksRetrieved: 10, // Top K chunks to retrieve
        chunkStrategy: {
          maxChunkSize: 500, // words
          overlapSize: 50, // words
          preserveContext: true, // Include title/headers in chunks
        },
        hybridSearch: {
          vectorWeight: 0.7, // 70% weight to vector similarity
          keywordWeight: 0.3, // 30% weight to keyword matching
          deduplicate: true,
        },
        performance: {
          targetSearchTime: 100, // ms for vector search
          targetTotalTime: 2000, // ms for complete answer generation
        },
      },
      // Data Freshness Tracking - NEW!
      dataFreshness: {
        enabled: true,
        strategy: "cache-first-live-fallback", // Check cache, fetch live if stale
        freshnessThresholds: {
          daily: 1,
          weekly: 7,
          monthly: 30,
          quarterly: 90,
          annually: 365,
        },
        autoRefresh: {
          stale: "background", // Schedule background refresh if stale
          expired: "immediate", // Fetch live immediately if expired
        },
      },
    },
    intelLibrary: {
      status: "deprecated",
      reason: "Transformed into Ask Assistant",
      deprecatedDate: "2025-01-23",
      replacement: "/dashboard/ask",
    },
    tdyCopilot: {
      status: "removed",
      reason: "strategic pivot - focusing on 4 core tools",
      removedDate: "2025-10-29",
      replacement: null,
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
   *
   * NOTE: Google API Consolidation (Updated 2025-10-29)
   * All Google services (weather, distance, amenities, military) now use GOOGLE_API_KEY
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
      apiKey: "GOOGLE_API_KEY",
    },
    distance: {
      name: "Google Distance Matrix API",
      provider: "Google",
      cacheDays: 1,
      attribution: "Google",
      licenseDoc: "docs/vendors/distance.md",
      apiUrl: "https://maps.googleapis.com/maps/api/distancematrix/json",
      apiKey: "GOOGLE_API_KEY",
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
      name: "SchoolDigger",
      provider: "Direct API",
      gated: true, // Premium only
      cacheDays: 1,
      cacheHours: 24,
      attribution: "SchoolDigger",
      licenseDoc: "docs/vendors/schooldigger.md",
      tier: "all",
      apiUrl: "https://api.schooldigger.com/v2.3",
      apiKey: "SCHOOLDIGGER_APP_ID + SCHOOLDIGGER_APP_KEY",
      ratingScale: "1-5 stars (converted to 0-10)",
    },
    amenities: {
      name: "Google Places API",
      provider: "Google",
      cacheDays: 30,
      attribution: "Google",
      licenseDoc: "docs/vendors/amenities.md",
      apiUrl: "https://places.googleapis.com/v1/places:searchNearby",
      apiKey: "GOOGLE_API_KEY",
    },
    demographics: {
      name: "Default Demographics",
      provider: "Hardcoded Defaults",
      cacheDays: 30,
      attribution: "N/A",
      licenseDoc: "docs/vendors/demographics.md",
      note: "Using neutral defaults until proper API integration",
    },
    military: {
      name: "Google Places API",
      provider: "Google",
      cacheDays: 30,
      attribution: "Google",
      licenseDoc: "docs/vendors/military.md",
      apiUrl: "https://places.googleapis.com/v1/places:searchText",
      apiKey: "GOOGLE_API_KEY",
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
    "GOOGLE_API_KEY", // Consolidated Google API key (weather, distance, amenities, military)
    "RAPIDAPI_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SCHOOLDIGGER_APP_ID", // SchoolDigger API
    "SCHOOLDIGGER_APP_KEY",
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
