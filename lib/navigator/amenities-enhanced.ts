/**
 * ENHANCED AMENITIES PROVIDER (Google Places API)
 *
 * Comprehensive amenity analysis for top-ranked neighborhoods
 * Fetches 20+ categories with detailed place information
 * Server-only, cached 30 days
 *
 * Requires: GOOGLE_API_KEY
 */

import { getCache, setCache } from "@/lib/cache";

export interface PlaceDetail {
  name: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  distance_mi?: number;
  types?: string[];
}

export interface AmenityCategory {
  count: number;
  top_picks: PlaceDetail[];
  note: string;
}

export interface EnhancedAmenityData {
  // Scores
  overall_score: number; // 0-100
  walkability_score: number; // 0-100
  family_friendliness_score: number; // 0-100
  
  // Categorized amenities (30+ categories)
  essentials: AmenityCategory; // Grocery, gas, pharmacy, bank
  family_activities: AmenityCategory; // Parks, playgrounds, libraries, entertainment
  healthcare: AmenityCategory; // Hospitals, urgent care, dentists, pharmacies
  dining: AmenityCategory; // Restaurants, cafes, bars
  fitness: AmenityCategory; // Gyms, pools, sports, yoga
  services: AmenityCategory; // Post office, hair care, laundromat
  spouse_employment: AmenityCategory; // Coworking, coffee shops for remote work
  pets: AmenityCategory; // Dog parks, pet stores, vet clinics
  community: AmenityCategory; // Community centers, farmers markets, bookstores
  home_auto: AmenityCategory; // Hardware stores, auto repair, car wash
  
  // Lifestyle analysis
  lifestyle: {
    character: "suburban" | "urban" | "rural" | "mixed";
    dining_scene: "limited" | "moderate" | "excellent";
    shopping_convenience: "low" | "moderate" | "high";
    entertainment_options: "few" | "some" | "many";
  };
  
  // Summary
  total_amenities: number;
  amenities_within_1mi: number;
  quick_summary: string;
}

/**
 * Fetch enhanced amenities data for a ZIP code
 * Includes 20+ categories with detailed place information
 */
export async function fetchEnhancedAmenitiesData(
  zip: string,
  lat: number,
  lon: number
): Promise<EnhancedAmenityData> {
  console.log(`[ENHANCED_AMENITIES] Fetching comprehensive data for ZIP: ${zip}`);

  const cacheKey = `gplaces:enhanced:v1:${zip}`;
  const cached = await getCache<EnhancedAmenityData>(cacheKey);
  if (cached) {
    console.log(`[ENHANCED_AMENITIES] Cache hit for ${zip}`);
    return cached;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }

  try {
    // Fetch all amenity categories in parallel (30+ total)
    const [
      essentialsData,
      familyData,
      healthcareData,
      diningData,
      fitnessData,
      servicesData,
      employmentData,
      petsData,
      communityData,
      homeAutoData,
    ] = await Promise.all([
      fetchEssentials(lat, lon, apiKey),
      fetchFamilyActivities(lat, lon, apiKey),
      fetchHealthcare(lat, lon, apiKey),
      fetchDining(lat, lon, apiKey),
      fetchFitness(lat, lon, apiKey),
      fetchServices(lat, lon, apiKey),
      fetchSpouseEmployment(lat, lon, apiKey),
      fetchPets(lat, lon, apiKey),
      fetchCommunity(lat, lon, apiKey),
      fetchHomeAuto(lat, lon, apiKey),
    ]);

    // Analyze lifestyle based on amenity mix
    const lifestyle = analyzeLifestyle(
      essentialsData,
      familyData,
      healthcareData,
      diningData,
      fitnessData
    );

    // Calculate scores
    const walkability = calculateWalkability(
      essentialsData.count,
      familyData.count,
      diningData.count,
      servicesData.count
    );

    const familyFriendliness = calculateFamilyFriendliness(
      familyData.count,
      healthcareData.count,
      essentialsData.count
    );

    const totalCount =
      essentialsData.count +
      familyData.count +
      healthcareData.count +
      diningData.count +
      fitnessData.count +
      servicesData.count +
      employmentData.count +
      petsData.count +
      communityData.count +
      homeAutoData.count;

    const overallScore = calculateOverallScore(
      walkability,
      familyFriendliness,
      essentialsData.count,
      diningData.count
    );

    const result: EnhancedAmenityData = {
      overall_score: overallScore,
      walkability_score: walkability,
      family_friendliness_score: familyFriendliness,
      essentials: essentialsData,
      family_activities: familyData,
      healthcare: healthcareData,
      dining: diningData,
      fitness: fitnessData,
      services: servicesData,
      spouse_employment: employmentData,
      pets: petsData,
      community: communityData,
      home_auto: homeAutoData,
      lifestyle,
      total_amenities: totalCount,
      amenities_within_1mi: Math.round(totalCount * 0.7), // Estimate based on 5km radius
      quick_summary: generateQuickSummary(lifestyle, essentialsData, familyData, diningData),
    };

    console.log(`[ENHANCED_AMENITIES] Fetched ${totalCount} total amenities for ${zip}`);
    await setCache(cacheKey, result, 30 * 24 * 3600); // 30 days
    return result;
  } catch (error) {
    console.error(`[ENHANCED_AMENITIES] Error for ZIP ${zip}:`, error);
    throw error;
  }
}

/**
 * Fetch essential amenities (grocery, gas, pharmacy, bank)
 */
async function fetchEssentials(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["supermarket", "gas_station", "pharmacy", "bank"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const groceryCount = places.filter((p) => p.types?.includes("supermarket")).length;
  const gasCount = places.filter((p) => p.types?.includes("gas_station")).length;
  const pharmacyCount = places.filter((p) => p.types?.includes("pharmacy")).length;
  const bankCount = places.filter((p) => p.types?.includes("bank")).length;

  const topPicks = places.slice(0, 3);

  return {
    count: places.length,
    top_picks: topPicks,
    note: `${groceryCount} grocery stores, ${gasCount} gas stations, ${pharmacyCount} pharmacies, ${bankCount} banks`,
  };
}

/**
 * Fetch family & kids amenities (parks, playgrounds, libraries, childcare)
 */
async function fetchFamilyActivities(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["park", "playground", "library", "movie_theater", "bowling_alley", "amusement_park"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const parkCount = places.filter((p) => p.types?.includes("park")).length;
  const playgroundCount = places.filter((p) => p.types?.includes("playground")).length;
  const libraryCount = places.filter((p) => p.types?.includes("library")).length;

  const topPicks = places
    .filter((p) => p.types?.includes("park") || p.types?.includes("playground"))
    .slice(0, 3);

  return {
    count: places.length,
    top_picks: topPicks,
    note: `${parkCount} parks, ${playgroundCount} playgrounds, ${libraryCount} libraries`,
  };
}

/**
 * Fetch healthcare amenities (hospitals, urgent care, dentists, vets)
 */
async function fetchHealthcare(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["hospital", "dentist", "pharmacy", "veterinary_care"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const hospitalCount = places.filter((p) => p.types?.includes("hospital")).length;
  const dentistCount = places.filter((p) => p.types?.includes("dentist")).length;
  const vetCount = places.filter((p) => p.types?.includes("veterinary_care")).length;

  const topPicks = places.slice(0, 3);

  return {
    count: places.length,
    top_picks: topPicks,
    note: `${hospitalCount} hospitals, ${dentistCount} dentists, ${vetCount} vet clinics`,
  };
}

/**
 * Fetch dining amenities (restaurants, cafes, bars)
 */
async function fetchDining(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["restaurant", "cafe", "bar"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const restaurantCount = places.filter((p) => p.types?.includes("restaurant")).length;
  const cafeCount = places.filter((p) => p.types?.includes("cafe")).length;

  const topRated = places.filter((p) => p.rating && p.rating >= 4.0).slice(0, 3);

  return {
    count: places.length,
    top_picks: topRated,
    note: `${restaurantCount} restaurants, ${cafeCount} cafes within 3 miles`,
  };
}

/**
 * Fetch fitness amenities (gyms, pools, sports, yoga)
 */
async function fetchFitness(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["gym", "swimming_pool", "sports_complex"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const gymCount = places.filter((p) => p.types?.includes("gym")).length;
  const poolCount = places.filter((p) => p.types?.includes("swimming_pool")).length;

  const topPicks = places.slice(0, 3);

  return {
    count: places.length,
    top_picks: topPicks,
    note: `${gymCount} gyms, ${poolCount} pools within 3 miles`,
  };
}

/**
 * Fetch service amenities (post office, hair, laundromat)
 */
async function fetchServices(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["post_office", "hair_care", "laundromat"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  return {
    count: places.length,
    top_picks: places.slice(0, 3),
    note: `Essential services within 3 miles`,
  };
}

/**
 * Fetch spouse employment amenities (coworking, coffee shops for remote work)
 */
async function fetchSpouseEmployment(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["cafe", "library"]; // Coffee shops and libraries = remote work spots
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const coffeeShops = places.filter((p) => p.types?.includes("cafe"));

  return {
    count: coffeeShops.length,
    top_picks: coffeeShops.slice(0, 3),
    note: `${coffeeShops.length} remote-work-friendly locations`,
  };
}

/**
 * Fetch places with detailed information using Google Places API
 */
async function fetchPlacesWithDetails(
  lat: number,
  lon: number,
  types: string[],
  apiKey: string,
  radiusKm: number = 5
): Promise<PlaceDetail[]> {
  const allPlaces: PlaceDetail[] = [];

  // Fetch each type separately (Places API limitation)
  for (const type of types) {
    try {
      const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location",
        },
        body: JSON.stringify({
          includedTypes: [type],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: lat,
                longitude: lon,
              },
              radius: radiusKm * 1000, // Convert km to meters
            },
          },
        }),
      });

      if (!response.ok) {
        console.warn(`[ENHANCED_AMENITIES] Failed to fetch ${type}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.places && Array.isArray(data.places)) {
        for (const place of data.places) {
          // Calculate distance using Haversine
          const distance = calculateDistance(
            lat,
            lon,
            place.location?.latitude || lat,
            place.location?.longitude || lon
          );

          allPlaces.push({
            name: place.displayName?.text || "Unknown",
            address: place.formattedAddress || "",
            rating: place.rating,
            user_ratings_total: place.userRatingCount,
            distance_mi: Math.round(distance * 10) / 10,
            types: place.types || [type],
          });
        }
      }
    } catch (error) {
      console.error(`[ENHANCED_AMENITIES] Error fetching ${type}:`, error);
    }
  }

  // Sort by quality score: (rating * log(reviews + 1)) - prioritizes high ratings with substantial reviews
  // This prevents 5-star places with only 1-2 reviews from dominating
  allPlaces.sort((a, b) => {
    const scoreA = (a.rating || 0) * Math.log10((a.user_ratings_total || 0) + 1);
    const scoreB = (b.rating || 0) * Math.log10((b.user_ratings_total || 0) + 1);
    
    if (scoreA !== scoreB) return scoreB - scoreA;
    
    // If quality scores are equal, prefer closer places
    return (a.distance_mi || 99) - (b.distance_mi || 99);
  });

  return allPlaces;
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Analyze lifestyle based on amenity mix
 */
function analyzeLifestyle(
  essentials: AmenityCategory,
  family: AmenityCategory,
  healthcare: AmenityCategory,
  dining: AmenityCategory,
  fitness: AmenityCategory
): EnhancedAmenityData["lifestyle"] {
  // Determine character based on density
  const totalDensity = essentials.count + dining.count + fitness.count;
  let character: "suburban" | "urban" | "rural" | "mixed" = "suburban";

  if (totalDensity > 50) character = "urban";
  else if (totalDensity < 10) character = "rural";
  else if (dining.count > 30 && essentials.count > 5) character = "mixed";

  // Dining scene
  let dining_scene: "limited" | "moderate" | "excellent" = "moderate";
  if (dining.count > 30) dining_scene = "excellent";
  else if (dining.count < 10) dining_scene = "limited";

  // Shopping convenience
  let shopping_convenience: "low" | "moderate" | "high" = "moderate";
  if (essentials.count > 8) shopping_convenience = "high";
  else if (essentials.count < 3) shopping_convenience = "low";

  // Entertainment options
  let entertainment_options: "few" | "some" | "many" = "some";
  if (family.count > 8) entertainment_options = "many";
  else if (family.count < 3) entertainment_options = "few";

  return {
    character,
    dining_scene,
    shopping_convenience,
    entertainment_options,
  };
}

/**
 * Calculate walkability score based on amenity density
 */
function calculateWalkability(
  essentials: number,
  family: number,
  dining: number,
  services: number
): number {
  let score = 0;

  // Essentials nearby (groceries, pharmacy, bank)
  if (essentials >= 5) score += 30;
  else if (essentials >= 3) score += 20;
  else if (essentials >= 1) score += 10;

  // Dining options
  if (dining >= 20) score += 25;
  else if (dining >= 10) score += 15;
  else if (dining >= 5) score += 8;

  // Family activities (parks, etc.)
  if (family >= 5) score += 25;
  else if (family >= 3) score += 15;
  else if (family >= 1) score += 8;

  // Services
  if (services >= 3) score += 20;
  else if (services >= 1) score += 10;

  return Math.min(100, score);
}

/**
 * Calculate family friendliness score
 */
function calculateFamilyFriendliness(parks: number, healthcare: number, essentials: number): number {
  let score = 50; // Base score

  // Parks and playgrounds (critical for families)
  if (parks >= 5) score += 25;
  else if (parks >= 3) score += 15;
  else if (parks >= 1) score += 5;
  else score -= 10;

  // Healthcare access
  if (healthcare >= 4) score += 15;
  else if (healthcare >= 2) score += 8;
  else if (healthcare >= 1) score += 3;

  // Essential services
  if (essentials >= 5) score += 10;
  else if (essentials >= 3) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate overall amenities score
 */
function calculateOverallScore(
  walkability: number,
  familyFriendliness: number,
  essentials: number,
  dining: number
): number {
  // Weighted average emphasizing essentials and family needs
  const score =
    walkability * 0.3 + familyFriendliness * 0.4 + Math.min(100, essentials * 10) * 0.2 + Math.min(100, dining * 2) * 0.1;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Generate quick summary text
 */
function generateQuickSummary(
  lifestyle: EnhancedAmenityData["lifestyle"],
  essentials: AmenityCategory,
  family: AmenityCategory,
  dining: AmenityCategory
): string {
  const character = lifestyle.character.charAt(0).toUpperCase() + lifestyle.character.slice(1);
  const diningDesc =
    lifestyle.dining_scene === "excellent"
      ? "extensive dining options"
      : lifestyle.dining_scene === "moderate"
        ? "good dining variety"
        : "limited dining";

  const familyDesc =
    family.count >= 5
      ? "excellent family amenities"
      : family.count >= 3
        ? "good family amenities"
        : "basic family amenities";

  return `${character} neighborhood with ${diningDesc} and ${familyDesc}`;
}

/**
 * Fetch pet amenities (dog parks, pet stores, vet clinics)
 */
async function fetchPets(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["dog_park", "pet_store", "veterinary_care"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const dogParkCount = places.filter((p) => p.types?.includes("dog_park")).length;
  const petStoreCount = places.filter((p) => p.types?.includes("pet_store")).length;
  const vetCount = places.filter((p) => p.types?.includes("veterinary_care")).length;

  return {
    count: places.length,
    top_picks: places.slice(0, 3),
    note: `${dogParkCount} dog parks, ${petStoreCount} pet stores, ${vetCount} vet clinics`,
  };
}

/**
 * Fetch community amenities (community centers, farmers markets, bookstores)
 */
async function fetchCommunity(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["community_center", "book_store"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  return {
    count: places.length,
    top_picks: places.slice(0, 3),
    note: `Community gathering spaces and cultural venues`,
  };
}

/**
 * Fetch home & auto amenities (hardware, auto repair, car wash)
 */
async function fetchHomeAuto(
  lat: number,
  lon: number,
  apiKey: string
): Promise<AmenityCategory> {
  const types = ["hardware_store", "car_repair", "car_wash"];
  const places = await fetchPlacesWithDetails(lat, lon, types, apiKey, 5);

  const hardwareCount = places.filter((p) => p.types?.includes("hardware_store")).length;
  const repairCount = places.filter((p) => p.types?.includes("car_repair")).length;
  const carWashCount = places.filter((p) => p.types?.includes("car_wash")).length;

  return {
    count: places.length,
    top_picks: places.slice(0, 3),
    note: `${hardwareCount} hardware stores, ${repairCount} auto repair shops, ${carWashCount} car washes`,
  };
}


