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
      "Referer": "https://www.garrisonledger.com",
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
  // For now, we'll use a simple mapping of ZIP codes to states
  // In production, you might want to use a more comprehensive ZIP-to-state lookup
  const getStateFromZip = (zip: string): string => {
    const zipNum = parseInt(zip);
    if (zipNum >= 98000 && zipNum <= 99999) return "WA"; // Washington
    if (zipNum >= 90000 && zipNum <= 96699) return "CA"; // California
    if (zipNum >= 10000 && zipNum <= 14999) return "NY"; // New York
    if (zipNum >= 20000 && zipNum <= 29999) return "DC"; // Washington DC
    if (zipNum >= 30000 && zipNum <= 39999) return "GA"; // Georgia
    if (zipNum >= 40000 && zipNum <= 49999) return "KY"; // Kentucky
    if (zipNum >= 50000 && zipNum <= 59999) return "IA"; // Iowa
    if (zipNum >= 60000 && zipNum <= 69999) return "IL"; // Illinois
    if (zipNum >= 70000 && zipNum <= 79999) return "LA"; // Louisiana
    if (zipNum >= 80000 && zipNum <= 89999) return "CO"; // Colorado
    return "WA"; // Default to Washington for military bases
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
