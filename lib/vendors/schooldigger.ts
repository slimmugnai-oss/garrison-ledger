/**
 * SCHOOLDIGGER API WRAPPER
 *
 * Server-only wrapper for SchoolDigger API v2.3
 * Handles authentication, timeouts, and caching
 *
 * Environment Variables (DO NOT PREFIX WITH NEXT_PUBLIC):
 * - SCHOOLDIGGER_APP_ID
 * - SCHOOLDIGGER_APP_KEY
 * - SCHOOLDIGGER_BASE_URL (default: https://api.schooldigger.com/v2.3)
 * - SCHOOLDIGGER_TIMEOUT_MS (default: 6000)
 * - SCHOOLDIGGER_CACHE_TTL_SEC (default: 86400)
 */

const BASE = process.env.SCHOOLDIGGER_BASE_URL || "https://api.schooldigger.com/v2.3";
const APP_ID = process.env.SCHOOLDIGGER_APP_ID!;
const APP_KEY = process.env.SCHOOLDIGGER_APP_KEY!;
const TIMEOUT = Number(process.env.SCHOOLDIGGER_TIMEOUT_MS ?? 6000);
const REVALIDATE = Number(process.env.SCHOOLDIGGER_CACHE_TTL_SEC ?? 86400);

/**
 * Append authentication parameters to request
 */
function withAuth(params: Record<string, string | number>) {
  return new URLSearchParams({
    appID: APP_ID,
    appKey: APP_KEY,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
}

/**
 * Core fetch wrapper with auth, timeout, and caching
 */
export async function sdFetch<T>(
  path: string,
  params: Record<string, string | number>
): Promise<T> {
  const url = `${BASE}${path}?${withAuth(params).toString()}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT);

  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      next: { revalidate: REVALIDATE },
      cache: "force-cache",
    });
    clearTimeout(t);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`SchoolDigger ${res.status}: ${text}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    clearTimeout(t);
    throw error;
  }
}

/**
 * SchoolDigger API Response Types
 */
export interface SchoolDiggerSchool {
  schoolid: string;
  schoolName: string;
  phone?: string;
  url?: string;
  urlCompare?: string;
  address: {
    latLong: {
      latitude: number;
      longitude: number;
    };
    street?: string;
    city?: string;
    state?: string;
    stateFull?: string;
    zip?: string;
    zip4?: string;
    cityURL?: string;
    zipURL?: string;
    html?: string;
  };
  distance?: number;
  locale?: string;
  lowGrade?: string;
  highGrade?: string;
  schoolLevel?: string;
  isCharterSchool?: string;
  isMagnetSchool?: string;
  isVirtualSchool?: string;
  isTitleISchool?: string;
  isTitleISchoolwideSchool?: string;
  district?: {
    districtID: string;
    districtName: string;
    url?: string;
    rankURL?: string;
  };
  county?: {
    countyName: string;
    countyURL?: string;
  };
  rankHistory?: Array<{
    year: number;
    rank: number;
    rankOf: number;
    rankStars: number; // 1-5 scale
    rankLevel?: string;
    rankStatewidePercentage?: number;
    averageStandardScore?: number;
  }>;
  rankMovement?: number;
  schoolYearlyDetails?: Array<{
    year: number;
    numberOfStudents?: number;
    percentFreeDiscLunch?: number;
    percentofAfricanAmericanStudents?: number;
    percentofAsianStudents?: number;
    percentofHispanicStudents?: number;
    percentofIndianStudents?: number;
    percentofPacificIslanderStudents?: number;
    percentofWhiteStudents?: number;
    percentofTwoOrMoreRaceStudents?: number;
    percentofUnspecifiedRaceStudents?: number;
    teachersFulltime?: number;
    pupilTeacherRatio?: number;
    numberofAfricanAmericanStudents?: number;
    numberofAsianStudents?: number;
    numberofHispanicStudents?: number;
    numberofIndianStudents?: number;
    numberofPacificIslanderStudents?: number;
    numberofWhiteStudents?: number;
    numberofTwoOrMoreRaceStudents?: number;
    numberofUnspecifiedRaceStudents?: number;
  }>;
  isPrivate?: boolean;
  privateDays?: number;
  privateHours?: number;
  privateHasLibrary?: boolean;
  privateCoed?: string;
  privateOrientation?: string;
  ncesPrivateSchoolID?: string;
}

export interface SchoolDiggerResponse {
  numberOfSchools: number;
  numberOfPages: number;
  schoolList: SchoolDiggerSchool[];
}

/**
 * Search schools by ZIP code
 */
export function getSchoolsByZip(
  zip: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>("/schools", { zip, perPage, page, sortBy: "rank" });
}

/**
 * Search schools by distance from lat/lon
 */
export function getSchoolsByDistance(
  lat: number,
  lon: number,
  distanceMiles = 5,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>("/schools", {
    lat,
    lon,
    distanceMiles,
    perPage,
    page,
    sortBy: "rank",
  });
}

/**
 * Search schools by state
 */
export function getSchoolsByState(
  st: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>("/schools", { st, perPage, page, sortBy: "rank" });
}

/**
 * Get school rankings by state
 */
export function getSchoolRankingsByState(
  st: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>(`/rankings/schools/${st}`, { perPage, page });
}

/**
 * Search districts by state
 */
export function getDistrictsByState(
  st: string,
  perPage = 25,
  page = 1
): Promise<{ numberOfDistricts: number; numberOfPages: number; districtList: any[] }> {
  return sdFetch("/districts", { st, perPage, page });
}
