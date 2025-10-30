// lib/vendors/schooldigger.ts
const BASE = process.env.SCHOOLDIGGER_BASE_URL || "https://api.schooldigger.com/v2.3";
const APP_ID = process.env.SCHOOLDIGGER_APP_ID!;
const APP_KEY = process.env.SCHOOLDIGGER_APP_KEY!;
const TIMEOUT = Number(process.env.SCHOOLDIGGER_TIMEOUT_MS ?? 6000);
const REVALIDATE = Number(process.env.SCHOOLDIGGER_CACHE_TTL_SEC ?? 86400);

function withAuth(params: Record<string, string | number>) {
  return new URLSearchParams({
    appID: APP_ID,
    appKey: APP_KEY,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
}

export async function sdFetch<T>(
  path: string,
  params: Record<string, string | number>
): Promise<T> {
  const url = `${BASE}${path}?${withAuth(params).toString()}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);

  const res = await fetch(url, {
    signal: ctrl.signal,
    next: { revalidate: REVALIDATE },
    cache: "force-cache",
    headers: {
      "Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://www.garrisonledger.com",
    },
  });
  clearTimeout(t);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SchoolDigger ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// SchoolDigger API Response Types
export interface SchoolDiggerAddress {
  latLong: {
    latitude: number;
    longitude: number;
  };
  street: string;
  city: string;
  state: string;
  stateFull: string;
  zip: string;
  zip4: string;
  cityURL: string;
  zipURL: string;
  html: string;
}

export interface SchoolDiggerDistrict {
  districtID: string;
  districtName: string;
  url: string;
  rankURL: string;
}

export interface SchoolDiggerCounty {
  countyName: string;
  countyURL: string;
}

export interface SchoolDiggerRankHistory {
  year: number;
  rank: number;
  rankOf: number;
  rankStars: number;
  rankLevel: string;
  rankStatewidePercentage: number;
  averageStandardScore: number;
}

export interface SchoolDiggerSchoolYearlyDetails {
  year: number;
  numberOfStudents: number;
  percentFreeDiscLunch: number;
  percentofAfricanAmericanStudents: number;
  percentofAsianStudents: number;
  percentofHispanicStudents: number;
  percentofIndianStudents: number;
  percentofPacificIslanderStudents: number;
  percentofWhiteStudents: number;
  percentofTwoOrMoreRaceStudents: number;
  percentofUnspecifiedRaceStudents: number;
}

export interface SchoolDiggerSchool {
  schoolid: string;
  schoolName: string;
  phone: string;
  url: string;
  urlCompare: string;
  address: SchoolDiggerAddress;
  distance: number;
  locale: string;
  lowGrade: string;
  highGrade: string;
  schoolLevel: string;
  isCharterSchool: string;
  isMagnetSchool: string;
  isVirtualSchool: string;
  isTitleISchool: string;
  isTitleISchoolwideSchool: string;
  district: SchoolDiggerDistrict;
  county: SchoolDiggerCounty;
  rankHistory: SchoolDiggerRankHistory[];
  rankMovement: number;
  schoolYearlyDetails: SchoolDiggerSchoolYearlyDetails[];
  isPrivate: boolean;
  privateDays: number;
  privateHours: number;
  privateHasLibrary: boolean;
  privateCoed: string;
  privateOrientation: string;
  ncesPrivateSchoolID: string;
}

export interface SchoolDiggerResponse {
  numberOfSchools: number;
  numberOfPages: number;
  schoolList: SchoolDiggerSchool[];
}

// API Functions
export function getSchoolsByZip(
  zip: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  // Comprehensive ZIP-to-state mapping for military base coverage
  const getStateFromZip = (zip: string): string => {
    const zipNum = parseInt(zip);
    
    // California (90000-96199)
    if (zipNum >= 90000 && zipNum <= 96199) return "CA";
    
    // Washington (98000-99499)
    if (zipNum >= 98000 && zipNum <= 99499) return "WA";
    
    // New York (10000-14999)
    if (zipNum >= 10000 && zipNum <= 14999) return "NY";
    
    // DC/MD/VA (20000-22999)
    if (zipNum >= 20000 && zipNum <= 20599) return "DC";
    if (zipNum >= 20600 && zipNum <= 21999) return "MD";
    if (zipNum >= 22000 && zipNum <= 24699) return "VA";
    
    // West Virginia (24700-26999)
    if (zipNum >= 24700 && zipNum <= 26999) return "WV";
    
    // North Carolina (27000-28999) - CRITICAL for Fort Liberty (Bragg)
    if (zipNum >= 27000 && zipNum <= 28999) return "NC";
    
    // South Carolina (29000-29999)
    if (zipNum >= 29000 && zipNum <= 29999) return "SC";
    
    // Georgia (30000-31999)
    if (zipNum >= 30000 && zipNum <= 31999) return "GA";
    
    // Florida (32000-34999)
    if (zipNum >= 32000 && zipNum <= 34999) return "FL";
    
    // Alabama (35000-36999)
    if (zipNum >= 35000 && zipNum <= 36999) return "AL";
    
    // Tennessee (37000-38599)
    if (zipNum >= 37000 && zipNum <= 38599) return "TN";
    
    // Kentucky (40000-42799)
    if (zipNum >= 40000 && zipNum <= 42799) return "KY";
    
    // Missouri (63000-65999)
    if (zipNum >= 63000 && zipNum <= 65999) return "MO";
    
    // Kansas (66000-67999)
    if (zipNum >= 66000 && zipNum <= 67999) return "KS";
    
    // Louisiana (70000-71599)
    if (zipNum >= 70000 && zipNum <= 71599) return "LA";
    
    // Oklahoma (73000-74999)
    if (zipNum >= 73000 && zipNum <= 74999) return "OK";
    
    // Texas (75000-79999, 88000-88999)
    if (zipNum >= 75000 && zipNum <= 79999) return "TX";
    if (zipNum >= 88000 && zipNum <= 88999) return "TX";
    
    // Colorado (80000-81699)
    if (zipNum >= 80000 && zipNum <= 81699) return "CO";
    
    // Hawaii (96700-96899)
    if (zipNum >= 96700 && zipNum <= 96899) return "HI";
    
    // Alaska (99500-99999)
    if (zipNum >= 99500 && zipNum <= 99999) return "AK";
    
    // Default fallback
    console.warn(`[SCHOOLDIGGER] Unknown ZIP range: ${zip}, defaulting to CA`);
    return "CA";
  };

  return sdFetch<SchoolDiggerResponse>("/schools", {
    zip,
    st: getStateFromZip(zip),
    perPage,
    page,
    sortBy: "rank",
    includeUnrankedSchoolsInRankSort: "true",
  });
}

export function getSchoolsByLatLon(
  latitude: number,
  longitude: number,
  distanceMiles = 5,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>("/schools", {
    latitude,
    longitude,
    distanceMiles,
    perPage,
    page,
    sortBy: "rank",
    includeUnrankedSchoolsInRankSort: "true",
  });
}

export function getSchoolsByState(
  state: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>("/schools", {
    st: state,
    perPage,
    page,
    sortBy: "rank",
    includeUnrankedSchoolsInRankSort: "true",
  });
}

export function getDistrictsByState(
  state: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>("/districts", {
    st: state,
    perPage,
    page,
  });
}

export function getSchoolRankingsByState(
  state: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>(`/rankings/schools/${state}`, {
    perPage,
    page,
  });
}

// Utility Functions
export function formatAddress(address: SchoolDiggerAddress): string {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

export function formatGradeRange(lowGrade: string, highGrade: string): string {
  if (lowGrade === highGrade) {
    return lowGrade;
  }
  return `${lowGrade}-${highGrade}`;
}

export function convertSchoolDiggerRating(school: SchoolDiggerSchool): number {
  const latestRank = school.rankHistory?.[0];
  if (!latestRank || !latestRank.rankStars) {
    return 7; // Neutral score if no rating
  }
  return Math.max(0, Math.min(10, latestRank.rankStars * 2)); // Convert 1-5 stars to 0-10
}
