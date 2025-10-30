/**
 * BASE NAVIGATOR TYPES
 *
 * Types for neighborhood analysis and scoring
 */

export type KidsGrade = "elem" | "middle" | "high";

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

export interface PlaceDetail {
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  distance_mi?: number;
  types?: string[];
}

export interface NeighborhoodIntelligence {
  quick_verdict: string;
  confidence_score: number;
  lifestyle: {
    character: "suburban" | "urban" | "rural" | "mixed";
    walkability_score: number;
    family_friendliness: number;
    dining_scene: "limited" | "moderate" | "excellent";
    shopping_convenience: "low" | "moderate" | "high";
  };
  amenities_summary: string;
  schools_summary: string;
  commute_summary: string;
  quality_of_life_summary: string;
  bottom_line: string;
  key_strengths: string[];
  considerations: string[];
}

export interface EnhancedAmenityCategory {
  count: number;
  top_picks: PlaceDetail[];
  note: string;
}

export interface NeighborhoodCard {
  zip: string;
  family_fit_score: number;
  subscores: {
    schools: number; // 0-100
    rentVsBah: number; // 0-100
    commute: number; // 0-100
    weather: number; // 0-100
    amenities: number; // 0-100
    demographics: number; // 0-100
    military: number; // 0-100
  };
  school_score: number; // 0-10
  median_rent_cents: number | null;
  commute_am_minutes: number | null;
  commute_pm_minutes: number | null;
  weather_index: number; // 0-10
  payload: {
    top_schools: School[];
    sample_listings: Listing[];
    weather_note: string;
    commute_text: string;
    amenities_data?: {
      amenities_score: number;
      grocery_stores: number;
      restaurants: number;
      gyms: number;
      hospitals: number;
      shopping_centers: number;
      note: string;
    };
    demographics_data?: {
      demographics_score: number;
      population: number;
      median_age: number;
      median_income: number;
      diversity_index: number;
      family_households: number;
      note: string;
    };
    military_data?: {
      military_score: number;
      commissary_distance_mi: number | null;
      exchange_distance_mi: number | null;
      va_facility_distance_mi: number | null;
      military_housing_distance_mi: number | null;
      note: string;
    };
    // Enhanced data for top 3 neighborhoods
    intelligence?: NeighborhoodIntelligence;
    enhanced_amenities?: {
      overall_score: number;
      walkability_score: number;
      family_friendliness_score: number;
      essentials: EnhancedAmenityCategory;
      family_activities: EnhancedAmenityCategory;
      healthcare: EnhancedAmenityCategory;
      dining: EnhancedAmenityCategory;
      fitness: EnhancedAmenityCategory;
      services: EnhancedAmenityCategory;
      spouse_employment: EnhancedAmenityCategory;
      total_amenities: number;
      quick_summary: string;
    };
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
  verdict: "Good fit" | "Stretch" | "Over cap vs BAH";
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
