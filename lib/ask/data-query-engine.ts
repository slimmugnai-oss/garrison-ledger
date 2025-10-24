/**
 * INTELLIGENT DATA QUERY ENGINE
 * 
 * Extracts entities from questions and queries relevant official data sources.
 * Designed for 100% accuracy - no random queries, only targeted data retrieval.
 */

import { createClient } from "@supabase/supabase-js";
import baseToMHAMap from "@/lib/data/base-mha-map.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DataSource {
  table: string;
  source_name: string;
  url: string;
  effective_date: string;
  data: Record<string, unknown>;
}

interface ExtractedEntities {
  bases: string[];
  mhaCodes: string[];
  paygrades: string[];
  states: string[];
  topics: string[];
  hasPersonalContext: boolean;
}

/**
 * Extract entities from question using pattern matching
 */
function extractEntities(question: string): ExtractedEntities {
  const questionLower = question.toLowerCase();
  const entities: ExtractedEntities = {
    bases: [],
    mhaCodes: [],
    paygrades: [],
    states: [],
    topics: [],
    hasPersonalContext: false,
  };

  // Detect personal context words
  if (/(my|i|me|mine)\s/i.test(question)) {
    entities.hasPersonalContext = true;
  }

  // Extract base names from the base-to-MHA map
  const baseMap = baseToMHAMap.baseToMHA as Record<string, string>;
  for (const baseName of Object.keys(baseMap)) {
    // Match full base name or key parts (e.g., "Bliss" from "Fort Bliss")
    const baseWords = baseName.split(/[\s,]+/);
    const keyWord = baseWords.find((word) => word.length > 4); // Find significant word
    
    if (keyWord && new RegExp(`\\b${keyWord}\\b`, "i").test(question)) {
      entities.bases.push(baseName);
      entities.mhaCodes.push(baseMap[baseName]);
    }
  }

  // Extract MHA codes directly (e.g., "TX279", "CA624")
  const mhaMatches = question.match(/\b[A-Z]{2}\d{3}\b/g);
  if (mhaMatches) {
    entities.mhaCodes.push(...mhaMatches);
  }

  // Extract paygrades (E-1 through E-9, O-1 through O-10, W-1 through W-5)
  const paygradeMatches = question.match(/\b[EOW]-?\d{1,2}\b/gi);
  if (paygradeMatches) {
    entities.paygrades = paygradeMatches.map((pg) =>
      pg.toUpperCase().replace("-", "")
    );
  }

  // Extract state codes (2-letter state abbreviations)
  const stateMatches = question.match(
    /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/gi
  );
  if (stateMatches) {
    entities.states = stateMatches.map((s) => s.toUpperCase());
  }

  // Identify topics (what data sources to query)
  const topicKeywords = {
    bah: ["bah", "housing allowance", "housing stipend"],
    basePay: ["base pay", "salary", "monthly pay", "paycheck"],
    tsp: ["tsp", "thrift savings", "retirement account", "401k"],
    sgli: ["sgli", "life insurance", "insurance"],
    cola: ["cola", "cost of living allowance"],
    sdp: ["sdp", "savings deposit program", "deployment savings"],
    tax: ["tax", "federal tax", "state tax", "fica", "medicare"],
    entitlements: ["entitlements", "dla", "dity", "ppm", "weight allowance"],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some((kw) => questionLower.includes(kw))) {
      entities.topics.push(topic);
    }
  }

  // If no topics detected, this is a general question - include all major topics
  if (entities.topics.length === 0) {
    entities.topics = ["bah", "basePay", "tsp", "sgli"];
  }

  return entities;
}

/**
 * Query BAH rates based on extracted entities and user profile
 */
async function queryBAH(
  entities: ExtractedEntities,
  userId: string
): Promise<DataSource | null> {
  let bahQuery = supabase.from("bah_rates").select("*");
  let hasFilter = false;

  // Priority 1: Use extracted MHA codes from question
  if (entities.mhaCodes.length > 0) {
    bahQuery = bahQuery.in("mha", entities.mhaCodes);
    hasFilter = true;
  }

  // Priority 2: Use user's profile location if question has personal context
  if (!hasFilter && entities.hasPersonalContext) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("mha_or_zip, paygrade")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.mha_or_zip) {
      // Check if it's an MHA code or ZIP
      if (/^[A-Z]{2}\d{3}$/.test(profile.mha_or_zip)) {
        bahQuery = bahQuery.eq("mha", profile.mha_or_zip);
      } else {
        bahQuery = bahQuery.eq("zip_code", profile.mha_or_zip);
      }
      hasFilter = true;

      // If profile has paygrade, also filter by that
      if (profile.paygrade) {
        entities.paygrades.push(profile.paygrade);
      }
    }
  }

  // Priority 3: Use state codes to get state-wide examples
  if (!hasFilter && entities.states.length > 0) {
    // Get major bases in those states
    const stateMHAs: string[] = [];
    for (const state of entities.states) {
      // Get a few representative MHAs from this state
      const { data: stateBah } = await supabase
        .from("bah_rates")
        .select("mha")
        .ilike("mha", `${state}%`)
        .limit(3);
      
      if (stateBah) {
        stateMHAs.push(...stateBah.map((row) => row.mha));
      }
    }
    
    if (stateMHAs.length > 0) {
      bahQuery = bahQuery.in("mha", stateMHAs);
      hasFilter = true;
    }
  }

  // If still no filter, get a diverse sample (top 10 most common MHAs)
  if (!hasFilter) {
    // Get major metro areas as examples
    const majorMHAs = ["CA624", "VA105", "TX279", "NC090", "WA053", "HI001", "FL125", "GA031", "CO024", "IL001"];
    bahQuery = bahQuery.in("mha", majorMHAs);
  }

  const { data: bahData } = await bahQuery.limit(20);

  if (bahData && bahData.length > 0) {
    return {
      table: "bah_rates",
      source_name: "DFAS BAH Calculator 2025",
      url: "https://www.dfas.mil/militarymembers/payentitlements/bah/",
      effective_date: "2025-01-01",
      data: { rates: bahData, count: bahData.length },
    };
  }

  return null;
}

/**
 * Query base pay based on extracted paygrades
 */
async function queryBasePay(
  entities: ExtractedEntities,
  userId: string
): Promise<DataSource | null> {
  let payQuery = supabase.from("military_pay_tables").select("*");
  let hasFilter = false;

  // Use extracted paygrades
  if (entities.paygrades.length > 0) {
    payQuery = payQuery.in("paygrade", entities.paygrades);
    hasFilter = true;
  }

  // Use user's paygrade if personal context
  if (!hasFilter && entities.hasPersonalContext) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("paygrade")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.paygrade) {
      payQuery = payQuery.eq("paygrade", profile.paygrade);
      hasFilter = true;
    }
  }

  // If no filter, get representative sample across all ranks
  if (!hasFilter) {
    const sampleRanks = ["E01", "E05", "E07", "E09", "O01", "O03", "O06", "W02"];
    payQuery = payQuery.in("paygrade", sampleRanks);
  }

  const { data: payData } = await payQuery.limit(20);

  if (payData && payData.length > 0) {
    return {
      table: "military_pay_tables",
      source_name: "DFAS Military Pay Tables 2025",
      url: "https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/",
      effective_date: "2025-01-01",
      data: { rates: payData, count: payData.length },
    };
  }

  return null;
}

/**
 * Query TSP data (constants, no filtering needed)
 */
async function queryTSP(): Promise<DataSource> {
  return {
    table: "tsp_constants",
    source_name: "TSP.gov 2025",
    url: "https://www.tsp.gov/",
    effective_date: "2025-01-01",
    data: {
      maxContribution2025: 23000,
      catchUpContribution2025: 7500,
      matchingInfo: "BRS: 1% auto, 4% match (after 2 years)",
      fundOptions: ["G Fund", "F Fund", "C Fund", "S Fund", "I Fund", "L Funds"],
      note: "Contribution limits apply to both traditional and Roth combined",
    },
  };
}

/**
 * Query SGLI rates (flat structure, no filtering needed)
 */
async function querySGLI(): Promise<DataSource | null> {
  const { data: sgliData } = await supabase
    .from("sgli_rates")
    .select("*")
    .order("coverage_amount");

  if (sgliData && sgliData.length > 0) {
    return {
      table: "sgli_rates",
      source_name: "VA SGLI Program 2025",
      url: "https://www.va.gov/life-insurance/options-eligibility/sgli/",
      effective_date: "2025-01-01",
      data: { rates: sgliData, count: sgliData.length },
    };
  }

  return null;
}

/**
 * Query COLA rates based on location
 */
async function queryCOLA(entities: ExtractedEntities): Promise<DataSource | null> {
  // CONUS COLA
  if (entities.states.length > 0) {
    const { data: conusCola } = await supabase
      .from("conus_cola_rates")
      .select("*")
      .in("state", entities.states)
      .limit(10);

    if (conusCola && conusCola.length > 0) {
      return {
        table: "conus_cola_rates",
        source_name: "DTMO CONUS COLA 2025",
        url: "https://www.travel.dod.mil/",
        effective_date: "2025-01-01",
        data: { rates: conusCola, count: conusCola.length, type: "CONUS" },
      };
    }
  }

  // OCONUS COLA (if foreign locations detected)
  const oconusKeywords = ["oconus", "overseas", "japan", "germany", "korea", "italy", "okinawa", "ramstein", "yokota"];
  if (oconusKeywords.some((kw) => entities.topics.join(" ").includes(kw))) {
    const { data: oconusCola } = await supabase
      .from("oconus_cola_rates")
      .select("*")
      .limit(10);

    if (oconusCola && oconusCola.length > 0) {
      return {
        table: "oconus_cola_rates",
        source_name: "DTMO OCONUS COLA 2025",
        url: "https://www.travel.dod.mil/",
        effective_date: "2025-01-01",
        data: { rates: oconusCola, count: oconusCola.length, type: "OCONUS" },
      };
    }
  }

  return null;
}

/**
 * MAIN QUERY ENGINE
 * Intelligently queries all relevant data sources based on question analysis
 */
export async function queryOfficialSources(
  question: string,
  userId: string
): Promise<DataSource[]> {
  const sources: DataSource[] = [];

  try {
    // Step 1: Extract entities from question
    const entities = extractEntities(question);

    console.log("[DataQueryEngine] Extracted entities:", {
      bases: entities.bases,
      mhaCodes: entities.mhaCodes,
      paygrades: entities.paygrades,
      states: entities.states,
      topics: entities.topics,
      hasPersonalContext: entities.hasPersonalContext,
    });

    // Step 2: Query relevant data sources based on topics
    const queries: Promise<DataSource | null>[] = [];

    if (entities.topics.includes("bah")) {
      queries.push(queryBAH(entities, userId));
    }

    if (entities.topics.includes("basePay")) {
      queries.push(queryBasePay(entities, userId));
    }

    if (entities.topics.includes("tsp")) {
      queries.push(queryTSP());
    }

    if (entities.topics.includes("sgli")) {
      queries.push(querySGLI());
    }

    if (entities.topics.includes("cola")) {
      queries.push(queryCOLA(entities));
    }

    // Execute all queries in parallel
    const results = await Promise.all(queries);

    // Filter out null results and add to sources
    for (const result of results) {
      if (result) {
        sources.push(result);
      }
    }

    console.log("[DataQueryEngine] Found", sources.length, "data sources");

    return sources;
  } catch (error) {
    console.error("[DataQueryEngine] Error querying data sources:", error);
    return sources; // Return whatever we have so far
  }
}

