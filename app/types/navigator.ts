/**
 * BASE NAVIGATOR TYPES
 * 
 * Types for neighborhood analysis and scoring
 */

export type KidsGrade = 'elem' | 'middle' | 'high';

export interface BaseSeed {
  code: string;
  name: string;
  branch: string;
  state: string;
  center: { lat: number; lng: number };
  gate: { lat: number; lng: number };
  candidateZips: string[];
  mha: string;
}

export interface School {
  name: string;
  rating: number;
  grades: string;
  distance_mi?: number;
  address?: string;
  type?: string;
}

export interface Listing {
  title: string;
  price_cents: number;
  url: string;
  photo?: string;
  zip?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export interface NeighborhoodCard {
  zip: string;
  family_fit_score: number;
  subscores: {
    schools: number;      // 0-100
    rentVsBah: number;    // 0-100
    commute: number;      // 0-100
    weather: number;      // 0-100
  };
  school_score: number;        // 0-10
  median_rent_cents: number | null;
  commute_am_minutes: number | null;
  commute_pm_minutes: number | null;
  weather_index: number;       // 0-10
  payload: {
    top_schools: School[];
    sample_listings: Listing[];
    weather_note: string;
    commute_text: string;
  };
}

export interface NavigatorRequest {
  baseCode: string;
  bedrooms?: number;
  bahMonthlyCents: number;
  kidsGrades?: KidsGrade[];
}

export interface NavigatorResponse {
  base: BaseSeed;
  results: NeighborhoodCard[];
}

export interface AnalyzeListingRequest {
  baseCode: string;
  listingUrl: string;
  bedrooms?: number;
  bahMonthlyCents: number;
}

export interface AnalyzeListingResponse {
  verdict: 'Good fit' | 'Stretch' | 'Over cap vs BAH';
  payload: {
    listing: Listing & { lat?: number; lng?: number };
    subscores: {
      rentVsBah: number;
      schools: number;
      commute: number;
    };
    commute_text: string;
    top_schools: School[];
  };
}

export interface WatchlistData {
  id?: string;
  user_id: string;
  base_code: string;
  zips: string[];
  max_rent_cents?: number;
  bedrooms?: number;
  max_commute_minutes?: number;
  kids_grades?: string[];
}

