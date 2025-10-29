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
  return sdFetch<SchoolDiggerResponse>("/schools", { 
    zip, 
    perPage, 
    page, 
    sortBy: "rank",
    includeUnrankedSchoolsInRankSort: true
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
    includeUnrankedSchoolsInRankSort: true
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
    includeUnrankedSchoolsInRankSort: true
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
    page
  });
}

export function getSchoolRankingsByState(
  state: string,
  perPage = 25,
  page = 1
): Promise<SchoolDiggerResponse> {
  return sdFetch<SchoolDiggerResponse>(`/rankings/schools/${state}`, {
    perPage,
    page
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