/**
 * CLEAN MILITARY BASE DATA
 * 
 * This file contains deduplicated, validated military installation data.
 * 
 * Branch values: "Army" | "Air Force" | "Navy" | "Marine Corps" | "Joint"
 * Region values: "CONUS" | "OCONUS" (always set)
 */

export interface BaseData {
  id: string;
  title: string;
  branch: 'Army' | 'Air Force' | 'Navy' | 'Marine Corps' | 'Joint';
  state: string;
  city: string;
  url: string;
  lat: number;
  lng: number;
  region: 'CONUS' | 'OCONUS'; // Always set
  country?: string; // For OCONUS bases
  size?: 'Small' | 'Medium' | 'Large';
  featured?: boolean;
  comingSoon?: boolean;
}

// CONUS BASES (Continental United States)
export const conusBases: BaseData[] = [
  // ARMY INSTALLATIONS
  { 
    id: 'jblm', 
    title: "Joint Base Lewis-McChord", 
    branch: "Army", 
    state: "WA", 
    city: "Tacoma", 
    url: "https://familymedia.com/article/base-guides-joint-base-lewis-mcchord", 
    lat: 47.11, 
    lng: -122.55,
    size: "Large",
    featured: true,
    region: "CONUS"
  },
  { 
    id: 'fort-carson', 
    title: "Fort Carson", 
    branch: "Army", 
    state: "CO", 
    city: "Colorado Springs", 
    url: "https://familymedia.com/article/base-guides-fort-carson", 
    lat: 38.737, 
    lng: -104.79,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'jbsa', 
    title: "Joint Base San Antonio", 
    branch: "Army", 
    state: "TX", 
    city: "San Antonio", 
    url: "https://familymedia.com/article/base-guides-joint-base-san-antonio", 
    lat: 29.383, 
    lng: -98.613,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'fort-stewart', 
    title: "Fort Stewart", 
    branch: "Army", 
    state: "GA", 
    city: "Hinesville", 
    url: "https://familymedia.com/article/base-guides-fort-stewart", 
    lat: 31.869, 
    lng: -81.613,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'fort-belvoir', 
    title: "Fort Belvoir", 
    branch: "Army", 
    state: "VA", 
    city: "Fairfax County", 
    url: "https://familymedia.com/article/base-guides-fort-belvoir", 
    lat: 38.711, 
    lng: -77.145,
    size: "Medium",
    region: "CONUS"
  },
  { 
    id: 'fort-liberty', 
    title: "Fort Liberty", 
    branch: "Army", 
    state: "NC", 
    city: "Fayetteville", 
    url: "https://familymedia.com/article/base-guides-fort-liberty", 
    lat: 35.141, 
    lng: -79.006,
    size: "Large",
    featured: true,
    region: "CONUS"
  },
  { 
    id: 'fort-cavazos', 
    title: "Fort Cavazos", 
    branch: "Army", 
    state: "TX", 
    city: "Killeen", 
    url: "https://familymedia.com/article/base-guides-fort-cavazos", 
    lat: 31.134, 
    lng: -97.77,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'fort-moore', 
    title: "Fort Moore", 
    branch: "Army", 
    state: "GA", 
    city: "Columbus", 
    url: "https://familymedia.com/article/base-guides-fort-moore", 
    lat: 32.35, 
    lng: -84.97,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'fort-campbell', 
    title: "Fort Campbell", 
    branch: "Army", 
    state: "KY", 
    city: "Hopkinsville", 
    url: "https://familymedia.com/article/base-guides-fort-campbell", 
    lat: 36.653, 
    lng: -87.46,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'fort-drum', 
    title: "Fort Drum", 
    branch: "Army", 
    state: "NY", 
    city: "Watertown", 
    url: "https://familymedia.com/article/base-guides-fort-drum", 
    lat: 44.05, 
    lng: -75.79,
    size: "Medium",
    region: "CONUS"
  },
  { 
    id: 'fort-eisenhower', 
    title: "Fort Eisenhower", 
    branch: "Army", 
    state: "GA", 
    city: "Augusta", 
    url: "https://familymedia.com/article/base-guides-fort-eisenhower", 
    lat: 33.417, 
    lng: -82.141,
    size: "Medium",
    region: "CONUS"
  },
  { 
    id: 'fort-novosel', 
    title: "Fort Novosel", 
    branch: "Army", 
    state: "AL", 
    city: "Daleville", 
    url: "https://familymedia.com/article/base-guides-fort-novosel", 
    lat: 31.319, 
    lng: -85.713,
    size: "Medium",
    region: "CONUS"
  },
  { 
    id: 'fort-johnson', 
    title: "Fort Johnson", 
    branch: "Army", 
    state: "LA", 
    city: "Leesville", 
    url: "https://familymedia.com/article/base-guides-fort-johnson", 
    lat: 31.044, 
    lng: -93.191,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'fort-gregg-adams', 
    title: "Fort Gregg-Adams", 
    branch: "Army", 
    state: "VA", 
    city: "Petersburg", 
    url: "https://familymedia.com/article/base-guides-fort-gregg-adams", 
    lat: 37.244, 
    lng: -77.335,
    size: "Small",
    region: "CONUS"
  },
  { 
    id: 'fort-walker', 
    title: "Fort Walker", 
    branch: "Army", 
    state: "VA", 
    city: "Caroline County", 
    url: "https://familymedia.com/article/base-guides-fort-walker", 
    lat: 38.07, 
    lng: -77.35,
    size: "Small",
    region: "CONUS"
  },
  { 
    id: 'fort-bliss', 
    title: "Fort Bliss", 
    branch: "Army", 
    state: "TX", 
    city: "El Paso", 
    url: "https://familymedia.com/article/base-guides-fort-bliss", 
    lat: 31.813, 
    lng: -106.42,
    size: "Large",
    region: "CONUS"
  },

  // AIR FORCE INSTALLATIONS
  { 
    id: 'eglin-afb', 
    title: "Eglin AFB", 
    branch: "Air Force", 
    state: "FL", 
    city: "Valparaiso", 
    url: "https://familymedia.com/article/base-guides-eglin-air-force-base", 
    lat: 30.46, 
    lng: -86.55,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'nellis-afb', 
    title: "Nellis AFB", 
    branch: "Air Force", 
    state: "NV", 
    city: "Las Vegas", 
    url: "https://familymedia.com/article/base-guides-nellis-air-force-base", 
    lat: 36.246, 
    lng: -115.033,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'edwards-afb', 
    title: "Edwards AFB", 
    branch: "Air Force", 
    state: "CA", 
    city: "Lancaster", 
    url: "https://familymedia.com/article/base-guides-edwards-air-force-base", 
    lat: 34.913, 
    lng: -117.936,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'hill-afb', 
    title: "Hill AFB", 
    branch: "Air Force", 
    state: "UT", 
    city: "Ogden", 
    url: "https://familymedia.com/article/base-guides-hill-air-force-base", 
    lat: 41.125, 
    lng: -111.973,
    size: "Medium",
    region: "CONUS"
  },
  { 
    id: 'travis-afb', 
    title: "Travis AFB", 
    branch: "Air Force", 
    state: "CA", 
    city: "Fairfield", 
    url: "https://familymedia.com/article/base-guides-travis-air-force-base", 
    lat: 38.272, 
    lng: -121.93,
    size: "Large",
    region: "CONUS"
  },

  // MARINE CORPS INSTALLATIONS
  { 
    id: 'camp-pendleton', 
    title: "MCB Camp Pendleton", 
    branch: "Marine Corps", 
    state: "CA", 
    city: "Oceanside", 
    url: "https://familymedia.com/article/base-guides-marine-corps-base-camp-pendleton", 
    lat: 33.304, 
    lng: -117.304,
    size: "Large",
    featured: true,
    region: "CONUS"
  },
  { 
    id: 'camp-lejeune', 
    title: "MCB Camp Lejeune", 
    branch: "Marine Corps", 
    state: "NC", 
    city: "Jacksonville", 
    url: "https://familymedia.com/article/base-guides-marine-corps-base-camp-lejeune", 
    lat: 34.639, 
    lng: -77.321,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'mcas-miramar', 
    title: "MCAS Miramar", 
    branch: "Marine Corps", 
    state: "CA", 
    city: "San Diego", 
    url: "https://familymedia.com/article/base-guides-marine-corps-air-station-miramar", 
    lat: 32.868, 
    lng: -117.142,
    size: "Medium",
    region: "CONUS"
  },

  // NAVY INSTALLATIONS
  { 
    id: 'ns-norfolk', 
    title: "Naval Station Norfolk", 
    branch: "Navy", 
    state: "VA", 
    city: "Norfolk", 
    url: "https://familymedia.com/article/base-guides-naval-station-norfolk", 
    lat: 36.943, 
    lng: -76.305,
    size: "Large",
    featured: true,
    region: "CONUS"
  },
  { 
    id: 'nb-san-diego', 
    title: "Naval Base San Diego", 
    branch: "Navy", 
    state: "CA", 
    city: "San Diego", 
    url: "https://familymedia.com/article/base-guides-naval-base-san-diego", 
    lat: 32.676, 
    lng: -117.141,
    size: "Large",
    featured: true,
    region: "CONUS"
  },

  // JOINT BASES
  { 
    id: 'jber', 
    title: "Joint Base Elmendorf-Richardson", 
    branch: "Joint", 
    state: "AK", 
    city: "Anchorage", 
    url: "https://familymedia.com/article/base-guides-joint-base-elmendorf-richardson", 
    lat: 61.253, 
    lng: -149.807,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'jb-andrews', 
    title: "Joint Base Andrews", 
    branch: "Joint", 
    state: "MD", 
    city: "Camp Springs", 
    url: "https://familymedia.com/article/base-guides-joint-base-andrews", 
    lat: 38.811, 
    lng: -76.867,
    size: "Medium",
    region: "CONUS"
  },
  { 
    id: 'jb-charleston', 
    title: "Joint Base Charleston", 
    branch: "Joint", 
    state: "SC", 
    city: "Charleston", 
    url: "https://familymedia.com/article/base-guides-joint-base-charleston", 
    lat: 32.899, 
    lng: -80.041,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'jb-langley-eustis', 
    title: "Joint Base Langley-Eustis", 
    branch: "Joint", 
    state: "VA", 
    city: "Hampton", 
    url: "https://familymedia.com/article/base-guides-joint-base-langley-eustis", 
    lat: 37.082, 
    lng: -76.361,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'jb-mdl', 
    title: "Joint Base McGuire-Dix-Lakehurst", 
    branch: "Joint", 
    state: "NJ", 
    city: "Wrightstown", 
    url: "https://familymedia.com/article/base-guides-joint-base-mcguire-dix-lakehurst", 
    lat: 40.024, 
    lng: -74.592,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'jb-pearl-hickam', 
    title: "Joint Base Pearl Harbor-Hickam", 
    branch: "Joint", 
    state: "HI", 
    city: "Honolulu", 
    url: "https://familymedia.com/article/base-guides-joint-base-pearl-harbor-hickam", 
    lat: 21.343, 
    lng: -157.950,
    size: "Large",
    region: "CONUS"
  },
  { 
    id: 'jb-anacostia-bolling', 
    title: "Joint Base Anacostia-Bolling", 
    branch: "Joint", 
    state: "DC", 
    city: "Washington", 
    url: "https://familymedia.com/article/base-guides-joint-base-anacostia-bolling", 
    lat: 38.848, 
    lng: -77.010,
    size: "Small",
    region: "CONUS"
  }
];

// OCONUS BASES (Outside Continental United States)
export const oconusBases: BaseData[] = [
  {
    id: 'ramstein-ab',
    title: "Ramstein Air Base",
    branch: "Air Force",
    state: "Germany",
    city: "Kaiserslautern",
    url: "https://familymedia.com/article/base-guides-ramstein-air-base",
    lat: 49.437,
    lng: 7.600,
    size: "Large",
    region: "OCONUS",
    country: "Germany"
  },
  {
    id: 'camp-humphreys',
    title: "Camp Humphreys",
    branch: "Army",
    state: "South Korea",
    city: "Pyeongtaek",
    url: "https://familymedia.com/article/base-guides-camp-humphreys",
    lat: 36.968,
    lng: 127.036,
    size: "Large",
    region: "OCONUS",
    country: "South Korea"
  },
  {
    id: 'mcas-iwakuni',
    title: "MCAS Iwakuni",
    branch: "Marine Corps",
    state: "Japan",
    city: "Iwakuni",
    url: "https://familymedia.com/article/base-guides-mcas-iwakuni",
    lat: 34.144,
    lng: 132.236,
    size: "Large",
    region: "OCONUS",
    country: "Japan"
  },
  {
    id: 'naval-station-rota',
    title: "Naval Station Rota",
    branch: "Navy",
    state: "Spain",
    city: "Rota",
    url: "https://familymedia.com/article/base-guides-naval-station-rota",
    lat: 36.645,
    lng: -6.349,
    size: "Medium",
    region: "OCONUS",
    country: "Spain"
  },
  {
    id: 'grafenwoehr',
    title: "Grafenwoehr Training Area",
    branch: "Army",
    state: "Germany",
    city: "Grafenwoehr",
    url: "https://familymedia.com/article/base-guides-grafenwoehr-training-area",
    lat: 49.702,
    lng: 11.936,
    size: "Large",
    region: "OCONUS",
    country: "Germany"
  },
  {
    id: 'vilseck',
    title: "Rose Barracks (Vilseck)",
    branch: "Army",
    state: "Germany",
    city: "Vilseck",
    url: "https://familymedia.com/article/base-guides-rose-barracks-vilseck",
    lat: 49.626,
    lng: 11.766,
    size: "Medium",
    region: "OCONUS",
    country: "Germany"
  },
  {
    id: 'wiesbaden',
    title: "Wiesbaden Army Airfield",
    branch: "Army",
    state: "Germany",
    city: "Wiesbaden",
    url: "https://familymedia.com/article/base-guides-wiesbaden-army-airfield",
    lat: 50.050,
    lng: 8.325,
    size: "Medium",
    region: "OCONUS",
    country: "Germany"
  },
  {
    id: 'spangdahlem-ab',
    title: "Spangdahlem AB",
    branch: "Air Force",
    state: "Germany",
    city: "Spangdahlem",
    url: "https://familymedia.com/article/base-guides-spangdahlem-ab",
    lat: 49.973,
    lng: 6.692,
    size: "Medium",
    region: "OCONUS",
    country: "Germany"
  },
  {
    id: 'kaiserslautern',
    title: "Kaiserslautern Military Community",
    branch: "Army",
    state: "Germany",
    city: "Kaiserslautern",
    url: "https://familymedia.com/article/base-guides-kaiserslautern-military-community",
    lat: 49.444,
    lng: 7.770,
    size: "Large",
    region: "OCONUS",
    country: "Germany"
  },
  {
    id: 'yokota-ab',
    title: "Yokota AB",
    branch: "Air Force",
    state: "Japan",
    city: "Fussa",
    url: "https://familymedia.com/article/base-guides-yokota-ab",
    lat: 35.748,
    lng: 139.348,
    size: "Large",
    region: "OCONUS",
    country: "Japan"
  },
  {
    id: 'kadena-ab',
    title: "Kadena AB",
    branch: "Air Force",
    state: "Japan",
    city: "Okinawa",
    url: "https://familymedia.com/article/base-guides-kadena-ab",
    lat: 26.351,
    lng: 127.768,
    size: "Large",
    region: "OCONUS",
    country: "Japan"
  },
  {
    id: 'misawa-ab',
    title: "Misawa AB",
    branch: "Air Force",
    state: "Japan",
    city: "Misawa",
    url: "https://familymedia.com/article/base-guides-misawa-ab",
    lat: 40.703,
    lng: 141.368,
    size: "Medium",
    region: "OCONUS",
    country: "Japan"
  },
  {
    id: 'camp-zama',
    title: "Camp Zama",
    branch: "Army",
    state: "Japan",
    city: "Zama",
    url: "https://familymedia.com/article/base-guides-camp-zama",
    lat: 35.517,
    lng: 139.398,
    size: "Medium",
    region: "OCONUS",
    country: "Japan"
  },
  {
    id: 'camp-foster',
    title: "Camp Foster",
    branch: "Marine Corps",
    state: "Japan",
    city: "Okinawa",
    url: "https://familymedia.com/article/base-guides-camp-foster",
    lat: 26.299,
    lng: 127.756,
    size: "Large",
    region: "OCONUS",
    country: "Japan"
  },
  {
    id: 'camp-hansen',
    title: "Camp Hansen",
    branch: "Marine Corps",
    state: "Japan",
    city: "Okinawa",
    url: "https://familymedia.com/article/base-guides-camp-hansen",
    lat: 26.433,
    lng: 127.921,
    size: "Medium",
    region: "OCONUS",
    country: "Japan"
  },
  {
    id: 'osan-ab',
    title: "Osan AB",
    branch: "Air Force",
    state: "South Korea",
    city: "Pyeongtaek",
    url: "https://familymedia.com/article/base-guides-osan-ab",
    lat: 37.090,
    lng: 127.030,
    size: "Large",
    region: "OCONUS",
    country: "South Korea"
  },
  {
    id: 'camp-casey',
    title: "Camp Casey",
    branch: "Army",
    state: "South Korea",
    city: "Dongducheon",
    url: "https://familymedia.com/article/base-guides-camp-casey",
    lat: 37.899,
    lng: 127.052,
    size: "Medium",
    region: "OCONUS",
    country: "South Korea"
  },
  {
    id: 'camp-red-cloud',
    title: "Camp Red Cloud",
    branch: "Army",
    state: "South Korea",
    city: "Uijeongbu",
    url: "https://familymedia.com/article/base-guides-camp-red-cloud",
    lat: 37.742,
    lng: 127.042,
    size: "Small",
    region: "OCONUS",
    country: "South Korea"
  },
  {
    id: 'aviano-ab',
    title: "Aviano AB",
    branch: "Air Force",
    state: "Italy",
    city: "Aviano",
    url: "https://familymedia.com/article/base-guides-aviano-ab",
    lat: 46.032,
    lng: 12.596,
    size: "Medium",
    region: "OCONUS",
    country: "Italy"
  },
  {
    id: 'nas-sigonella',
    title: "NAS Sigonella",
    branch: "Navy",
    state: "Italy",
    city: "Sicily",
    url: "https://familymedia.com/article/base-guides-nas-sigonella",
    lat: 37.402,
    lng: 14.922,
    size: "Medium",
    region: "OCONUS",
    country: "Italy"
  },
  {
    id: 'caserma-ederle',
    title: "Caserma Ederle (Vicenza)",
    branch: "Army",
    state: "Italy",
    city: "Vicenza",
    url: "https://familymedia.com/article/base-guides-caserma-ederle-vicenza",
    lat: 45.548,
    lng: 11.552,
    size: "Medium",
    region: "OCONUS",
    country: "Italy"
  },
  {
    id: 'raf-lakenheath',
    title: "RAF Lakenheath",
    branch: "Air Force",
    state: "United Kingdom",
    city: "Suffolk",
    url: "https://familymedia.com/article/base-guides-raf-lakenheath",
    lat: 52.409,
    lng: 0.561,
    size: "Large",
    region: "OCONUS",
    country: "United Kingdom"
  },
  {
    id: 'raf-mildenhall',
    title: "RAF Mildenhall",
    branch: "Air Force",
    state: "United Kingdom",
    city: "Suffolk",
    url: "https://familymedia.com/article/base-guides-raf-mildenhall",
    lat: 52.361,
    lng: 0.486,
    size: "Medium",
    region: "OCONUS",
    country: "United Kingdom"
  },
  {
    id: 'raf-croughton',
    title: "RAF Croughton",
    branch: "Air Force",
    state: "United Kingdom",
    city: "Northamptonshire",
    url: "https://familymedia.com/article/base-guides-raf-croughton",
    lat: 51.995,
    lng: -1.187,
    size: "Small",
    region: "OCONUS",
    country: "United Kingdom"
  },
  {
    id: 'andersen-afb',
    title: "Andersen AFB",
    branch: "Air Force",
    state: "Guam",
    city: "Yigo",
    url: "https://familymedia.com/article/base-guides-andersen-afb",
    lat: 13.584,
    lng: 144.930,
    size: "Large",
    region: "OCONUS",
    country: "Guam"
  },
  {
    id: 'naval-base-guam',
    title: "Naval Base Guam",
    branch: "Navy",
    state: "Guam",
    city: "Apra Harbor",
    url: "https://familymedia.com/article/base-guides-naval-base-guam",
    lat: 13.447,
    lng: 144.656,
    size: "Large",
    region: "OCONUS",
    country: "Guam"
  },
  {
    id: 'incirlik-ab',
    title: "Incirlik AB",
    branch: "Air Force",
    state: "Turkey",
    city: "Adana",
    url: "https://familymedia.com/article/base-guides-incirlik-ab",
    lat: 37.000,
    lng: 35.426,
    size: "Medium",
    region: "OCONUS",
    country: "Turkey"
  },
  {
    id: 'thule-ab',
    title: "Thule AB",
    branch: "Air Force",
    state: "Greenland",
    city: "Pituffik",
    url: "https://familymedia.com/article/base-guides-thule-ab",
    lat: 76.531,
    lng: -68.703,
    size: "Small",
    region: "OCONUS",
    country: "Greenland"
  },
  {
    id: 'diego-garcia',
    title: "Naval Support Facility Diego Garcia",
    branch: "Navy",
    state: "British Indian Ocean Territory",
    city: "Diego Garcia",
    url: "https://familymedia.com/article/base-guides-naval-support-facility-diego-garcia",
    lat: -7.312,
    lng: 72.411,
    size: "Small",
    region: "OCONUS",
    country: "British Indian Ocean Territory"
  }
];

// Combined data with validation
export const allBases: BaseData[] = [...conusBases, ...oconusBases];

// Validation function
export function validateBaseData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ids = new Set<string>();
  
  allBases.forEach((base, index) => {
    // Check for duplicate IDs
    if (ids.has(base.id)) {
      errors.push(`Duplicate ID: ${base.id} at index ${index}`);
    }
    ids.add(base.id);
    
    // Check required fields
    if (!base.id) errors.push(`Missing ID at index ${index}`);
    if (!base.title) errors.push(`Missing title for ${base.id}`);
    if (!base.region) errors.push(`Missing region for ${base.id}`);
    if (!base.lat || !base.lng) errors.push(`Missing coordinates for ${base.id}`);
    
    // Check region consistency
    if (base.region === 'OCONUS' && !base.country) {
      errors.push(`OCONUS base ${base.id} missing country`);
    }
    if (base.region === 'CONUS' && base.country) {
      errors.push(`CONUS base ${base.id} has country set`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper functions
export const getBasesByRegion = (region: 'CONUS' | 'OCONUS' | 'All' = 'All'): BaseData[] => {
  if (region === 'All') return allBases;
  return allBases.filter(base => base.region === region);
};

export const getBasesByBranch = (branch: string): BaseData[] => {
  if (branch === 'All') return allBases;
  return allBases.filter(base => base.branch === branch);
};

export const searchBases = (query: string): BaseData[] => {
  const lowerQuery = query.toLowerCase();
  return allBases.filter(base =>
    base.title.toLowerCase().includes(lowerQuery) ||
    base.state.toLowerCase().includes(lowerQuery) ||
    base.city.toLowerCase().includes(lowerQuery) ||
    base.branch.toLowerCase().includes(lowerQuery) ||
    (base.country && base.country.toLowerCase().includes(lowerQuery))
  );
};

export const getBaseById = (id: string): BaseData | undefined => {
  return allBases.find(base => base.id === id);
};

export const getFeaturedBases = (): BaseData[] => {
  return allBases.filter(base => base.featured);
};

// Export for backward compatibility
export const basesData = conusBases;
export const getAllBases = () => allBases;

// Branch styling constants
export const branchColors = {
  'Army': '#1e293b',
  'Air Force': '#2563eb',
  'Navy': '#1e3a8a',
  'Marine Corps': '#dc2626',
  'Joint': '#059669'
};

export const badgeColors = {
  'Army': 'bg-slate-900',
  'Air Force': 'bg-blue-600',
  'Navy': 'bg-blue-800',
  'Marine Corps': 'bg-red-600',
  'Joint': 'bg-emerald-600'
};
