/**
 * MILITARY BASE DATA
 * 
 * This file contains all military installation data for the Base Guide Map.
 * 
 * To update base guide URLs:
 * 1. Find the base by ID
 * 2. Update the `url` field with the new link
 * 3. Save and deploy
 * 
 * Branch values: "Army" | "Air Force" | "Navy" | "Marine Corps" | "Joint"
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
  featured?: boolean; // Set to true for featured bases
  size?: 'Small' | 'Medium' | 'Large'; // Installation size
  region?: 'CONUS' | 'OCONUS'; // Continental US or Overseas
  country?: string; // For OCONUS bases
  comingSoon?: boolean; // For bases without guides yet
}

export const basesData: BaseData[] = [
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
    featured: true
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
    state: "KY/TN", 
    city: "Hopkinsville/Clarksville", 
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
    city: "Dale County", 
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
    city: "Prince George", 
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
    city: "Kern County", 
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
    featured: true
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
    featured: true
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

  // ===== ARMY INSTALLATIONS (ADDITIONAL) =====
  { id: 'fort-bliss', title: "Fort Bliss", branch: "Army", state: "TX", city: "El Paso", url: "#", lat: 31.851, lng: -106.426, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'fort-sill', title: "Fort Sill", branch: "Army", state: "OK", city: "Lawton", url: "#", lat: 34.651, lng: -98.403, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-riley', title: "Fort Riley", branch: "Army", state: "KS", city: "Junction City", url: "#", lat: 39.055, lng: -96.795, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'fort-drum', title: "Fort Drum", branch: "Army", state: "NY", city: "Watertown", url: "#", lat: 44.056, lng: -75.772, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'fort-eisenhower', title: "Fort Eisenhower", branch: "Army", state: "GA", city: "Augusta", url: "#", lat: 33.366, lng: -81.992, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-irwin', title: "Fort Irwin", branch: "Army", state: "CA", city: "Barstow", url: "#", lat: 35.264, lng: -116.681, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-polk', title: "Fort Polk", branch: "Army", state: "LA", city: "Leesville", url: "#", lat: 31.051, lng: -93.193, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-leonard-wood', title: "Fort Leonard Wood", branch: "Army", state: "MO", city: "St. Robert", url: "#", lat: 37.715, lng: -92.145, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-knox', title: "Fort Knox", branch: "Army", state: "KY", city: "Radcliff", url: "#", lat: 37.894, lng: -85.965, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-jackson', title: "Fort Jackson", branch: "Army", state: "SC", city: "Columbia", url: "#", lat: 34.050, lng: -80.894, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-novosel', title: "Fort Novosel", branch: "Army", state: "AL", city: "Daleville", url: "#", lat: 31.343, lng: -85.712, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-lee', title: "Fort Lee", branch: "Army", state: "VA", city: "Petersburg", url: "#", lat: 37.244, lng: -77.333, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-sam-houston', title: "Fort Sam Houston", branch: "Army", state: "TX", city: "San Antonio", url: "#", lat: 29.451, lng: -98.432, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-gordon', title: "Fort Gordon", branch: "Army", state: "GA", city: "Augusta", url: "#", lat: 33.435, lng: -82.140, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-huachuca', title: "Fort Huachuca", branch: "Army", state: "AZ", city: "Sierra Vista", url: "#", lat: 31.555, lng: -110.353, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'fort-gregg-adams', title: "Fort Gregg-Adams", branch: "Army", state: "VA", city: "Petersburg", url: "#", lat: 37.237, lng: -77.337, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'redstone-arsenal', title: "Redstone Arsenal", branch: "Army", state: "AL", city: "Huntsville", url: "#", lat: 34.684, lng: -86.651, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'white-sands', title: "White Sands Missile Range", branch: "Army", state: "NM", city: "Las Cruces", url: "#", lat: 32.386, lng: -106.491, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'jber', title: "Joint Base Elmendorf-Richardson", branch: "Joint", state: "AK", city: "Anchorage", url: "#", lat: 61.253, lng: -149.807, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'schofield-barracks', title: "Schofield Barracks", branch: "Army", state: "HI", city: "Wahiawa", url: "#", lat: 21.498, lng: -158.065, size: "Large", region: "CONUS", comingSoon: true },

  // ===== AIR FORCE BASES (ADDITIONAL) =====
  { id: 'travis-afb', title: "Travis AFB", branch: "Air Force", state: "CA", city: "Fairfield", url: "#", lat: 38.263, lng: -121.927, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'beale-afb', title: "Beale AFB", branch: "Air Force", state: "CA", city: "Marysville", url: "#", lat: 39.136, lng: -121.437, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'edwards-afb', title: "Edwards AFB", branch: "Air Force", state: "CA", city: "Lancaster", url: "#", lat: 34.905, lng: -117.884, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'vandenberg-sfb', title: "Vandenberg Space Force Base", branch: "Air Force", state: "CA", city: "Lompoc", url: "#", lat: 34.742, lng: -120.572, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'hill-afb', title: "Hill AFB", branch: "Air Force", state: "UT", city: "Ogden", url: "#", lat: 41.124, lng: -111.973, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'mountain-home-afb', title: "Mountain Home AFB", branch: "Air Force", state: "ID", city: "Mountain Home", url: "#", lat: 43.044, lng: -115.872, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fairchild-afb', title: "Fairchild AFB", branch: "Air Force", state: "WA", city: "Spokane", url: "#", lat: 47.615, lng: -117.655, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'tinker-afb', title: "Tinker AFB", branch: "Air Force", state: "OK", city: "Oklahoma City", url: "#", lat: 35.415, lng: -97.387, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'lackland-afb', title: "Lackland AFB", branch: "Air Force", state: "TX", city: "San Antonio", url: "#", lat: 29.384, lng: -98.618, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'randolph-afb', title: "Randolph AFB", branch: "Air Force", state: "TX", city: "Universal City", url: "#", lat: 29.530, lng: -98.279, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'goodfellow-afb', title: "Goodfellow AFB", branch: "Air Force", state: "TX", city: "San Angelo", url: "#", lat: 31.437, lng: -100.403, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'sheppard-afb', title: "Sheppard AFB", branch: "Air Force", state: "TX", city: "Wichita Falls", url: "#", lat: 33.989, lng: -98.492, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'dyess-afb', title: "Dyess AFB", branch: "Air Force", state: "TX", city: "Abilene", url: "#", lat: 32.421, lng: -99.855, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'laughlin-afb', title: "Laughlin AFB", branch: "Air Force", state: "TX", city: "Del Rio", url: "#", lat: 29.360, lng: -100.778, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'columbus-afb', title: "Columbus AFB", branch: "Air Force", state: "MS", city: "Columbus", url: "#", lat: 33.643, lng: -88.444, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'keesler-afb', title: "Keesler AFB", branch: "Air Force", state: "MS", city: "Biloxi", url: "#", lat: 30.413, lng: -88.924, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'barksdale-afb', title: "Barksdale AFB", branch: "Air Force", state: "LA", city: "Bossier City", url: "#", lat: 32.502, lng: -93.663, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'moody-afb', title: "Moody AFB", branch: "Air Force", state: "GA", city: "Valdosta", url: "#", lat: 30.968, lng: -83.193, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'robins-afb', title: "Robins AFB", branch: "Air Force", state: "GA", city: "Warner Robins", url: "#", lat: 32.640, lng: -83.592, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'charleston-afb', title: "Charleston AFB", branch: "Air Force", state: "SC", city: "North Charleston", url: "#", lat: 32.899, lng: -80.041, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'shaw-afb', title: "Shaw AFB", branch: "Air Force", state: "SC", city: "Sumter", url: "#", lat: 33.973, lng: -80.471, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'seymour-johnson-afb', title: "Seymour Johnson AFB", branch: "Air Force", state: "NC", city: "Goldsboro", url: "#", lat: 35.340, lng: -77.961, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'langley-afb', title: "Langley AFB", branch: "Air Force", state: "VA", city: "Hampton", url: "#", lat: 37.082, lng: -76.361, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'dover-afb', title: "Dover AFB", branch: "Air Force", state: "DE", city: "Dover", url: "#", lat: 39.130, lng: -75.466, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'jb-andrews', title: "Joint Base Andrews", branch: "Joint", state: "MD", city: "Camp Springs", url: "#", lat: 38.811, lng: -76.867, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'scott-afb', title: "Scott AFB", branch: "Air Force", state: "IL", city: "Belleville", url: "#", lat: 38.545, lng: -89.852, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'offutt-afb', title: "Offutt AFB", branch: "Air Force", state: "NE", city: "Omaha", url: "#", lat: 41.118, lng: -95.915, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'minot-afb', title: "Minot AFB", branch: "Air Force", state: "ND", city: "Minot", url: "#", lat: 48.416, lng: -101.358, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'grand-forks-afb', title: "Grand Forks AFB", branch: "Air Force", state: "ND", city: "Grand Forks", url: "#", lat: 47.961, lng: -97.401, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'ellsworth-afb', title: "Ellsworth AFB", branch: "Air Force", state: "SD", city: "Rapid City", url: "#", lat: 44.145, lng: -103.104, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'warren-afb', title: "F.E. Warren AFB", branch: "Air Force", state: "WY", city: "Cheyenne", url: "#", lat: 41.157, lng: -104.867, size: "Medium", region: "CONUS", comingSoon: true },

  // ===== NAVY INSTALLATIONS (ADDITIONAL) =====
  { id: 'nas-pensacola', title: "NAS Pensacola", branch: "Navy", state: "FL", city: "Pensacola", url: "#", lat: 30.353, lng: -87.316, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'nas-jacksonville', title: "NAS Jacksonville", branch: "Navy", state: "FL", city: "Jacksonville", url: "#", lat: 30.236, lng: -81.681, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'nas-key-west', title: "NAS Key West", branch: "Navy", state: "FL", city: "Key West", url: "#", lat: 24.576, lng: -81.689, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'nas-oceana', title: "NAS Oceana", branch: "Navy", state: "VA", city: "Virginia Beach", url: "#", lat: 36.821, lng: -76.033, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'nas-patuxent-river', title: "NAS Patuxent River", branch: "Navy", state: "MD", city: "Lexington Park", url: "#", lat: 38.286, lng: -76.412, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'nas-whidbey-island', title: "NAS Whidbey Island", branch: "Navy", state: "WA", city: "Oak Harbor", url: "#", lat: 48.351, lng: -122.656, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'nas-lemoore', title: "NAS Lemoore", branch: "Navy", state: "CA", city: "Lemoore", url: "#", lat: 36.333, lng: -119.952, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'naval-station-everett', title: "Naval Station Everett", branch: "Navy", state: "WA", city: "Everett", url: "#", lat: 47.980, lng: -122.224, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'naval-station-mayport', title: "Naval Station Mayport", branch: "Navy", state: "FL", city: "Jacksonville", url: "#", lat: 30.393, lng: -81.425, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'nsb-kings-bay', title: "Naval Submarine Base Kings Bay", branch: "Navy", state: "GA", city: "St. Marys", url: "#", lat: 30.799, lng: -81.555, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'ns-great-lakes', title: "Naval Station Great Lakes", branch: "Navy", state: "IL", city: "North Chicago", url: "#", lat: 42.313, lng: -87.847, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'nas-corpus-christi', title: "NAS Corpus Christi", branch: "Navy", state: "TX", city: "Corpus Christi", url: "#", lat: 27.693, lng: -97.289, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'ns-newport', title: "Naval Station Newport", branch: "Navy", state: "RI", city: "Newport", url: "#", lat: 41.525, lng: -71.327, size: "Medium", region: "CONUS", comingSoon: true },

  // ===== MARINE CORPS BASES (ADDITIONAL) =====
  { id: 'camp-pendleton', title: "Camp Pendleton", branch: "Marine Corps", state: "CA", city: "Oceanside", url: "#", lat: 33.301, lng: -117.307, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'mcas-miramar', title: "MCAS Miramar", branch: "Marine Corps", state: "CA", city: "San Diego", url: "#", lat: 32.868, lng: -117.143, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'mcas-yuma', title: "MCAS Yuma", branch: "Marine Corps", state: "AZ", city: "Yuma", url: "#", lat: 32.633, lng: -114.603, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'mcas-cherry-point', title: "MCAS Cherry Point", branch: "Marine Corps", state: "NC", city: "Havelock", url: "#", lat: 34.901, lng: -76.881, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'mcas-new-river', title: "MCAS New River", branch: "Marine Corps", state: "NC", city: "Jacksonville", url: "#", lat: 34.708, lng: -77.440, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'mcas-beaufort', title: "MCAS Beaufort", branch: "Marine Corps", state: "SC", city: "Beaufort", url: "#", lat: 32.477, lng: -80.723, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'mcb-quantico', title: "MCB Quantico", branch: "Marine Corps", state: "VA", city: "Quantico", url: "#", lat: 38.522, lng: -77.304, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'mcb-hawaii', title: "MCB Hawaii (Kaneohe Bay)", branch: "Marine Corps", state: "HI", city: "Kaneohe", url: "#", lat: 21.443, lng: -157.750, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'mclb-albany', title: "MCLB Albany", branch: "Marine Corps", state: "GA", city: "Albany", url: "#", lat: 31.510, lng: -84.213, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'mcrd-san-diego', title: "MCRD San Diego", branch: "Marine Corps", state: "CA", city: "San Diego", url: "#", lat: 32.752, lng: -117.195, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'mcrd-parris-island', title: "MCRD Parris Island", branch: "Marine Corps", state: "SC", city: "Beaufort", url: "#", lat: 32.344, lng: -80.677, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'mctb-twentynine-palms', title: "MCTB Twentynine Palms", branch: "Marine Corps", state: "CA", city: "Twentynine Palms", url: "#", lat: 34.295, lng: -116.164, size: "Large", region: "CONUS", comingSoon: true },

  // ===== ADDITIONAL MEDIUM BASES (EXPANDING COVERAGE) =====
  
  // Additional Army Installations
  { id: 'fort-campbell', title: "Fort Campbell", branch: "Army", state: "KY", city: "Hopkinsville", url: "#", lat: 36.658, lng: -87.458, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'fort-benning-maneuver', title: "Fort Benning Maneuver Center", branch: "Army", state: "GA", city: "Columbus", url: "#", lat: 32.341, lng: -84.867, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-eustis', title: "Fort Eustis", branch: "Army", state: "VA", city: "Newport News", url: "#", lat: 37.134, lng: -76.608, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-dix', title: "Fort Dix (JB MDL)", branch: "Army", state: "NJ", city: "Wrightstown", url: "#", lat: 40.032, lng: -74.592, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-hamilton', title: "Fort Hamilton", branch: "Army", state: "NY", city: "Brooklyn", url: "#", lat: 40.607, lng: -74.030, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'fort-myer', title: "Fort Myer", branch: "Army", state: "VA", city: "Arlington", url: "#", lat: 38.882, lng: -77.071, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'fort-mccoy', title: "Fort McCoy", branch: "Army", state: "WI", city: "Sparta", url: "#", lat: 44.026, lng: -90.700, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-pickett', title: "Fort Pickett", branch: "Army", state: "VA", city: "Blackstone", url: "#", lat: 37.058, lng: -77.730, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'fort-indiantown-gap', title: "Fort Indiantown Gap", branch: "Army", state: "PA", city: "Annville", url: "#", lat: 40.433, lng: -76.575, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-mcclellan', title: "Fort McClellan (Anniston AD)", branch: "Army", state: "AL", city: "Anniston", url: "#", lat: 33.657, lng: -85.831, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'presidio-monterey', title: "Presidio of Monterey", branch: "Army", state: "CA", city: "Monterey", url: "#", lat: 36.601, lng: -121.885, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'fort-wainwright', title: "Fort Wainwright", branch: "Army", state: "AK", city: "Fairbanks", url: "#", lat: 64.837, lng: -147.640, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-greely', title: "Fort Greely", branch: "Army", state: "AK", city: "Delta Junction", url: "#", lat: 63.992, lng: -145.724, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'fort-richardson', title: "Fort Richardson (JBER)", branch: "Army", state: "AK", city: "Anchorage", url: "#", lat: 61.265, lng: -149.663, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'fort-shafter', title: "Fort Shafter", branch: "Army", state: "HI", city: "Honolulu", url: "#", lat: 21.341, lng: -157.900, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'wheeler-aaf', title: "Wheeler Army Airfield", branch: "Army", state: "HI", city: "Wahiawa", url: "#", lat: 21.483, lng: -158.040, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'tripler-amc', title: "Tripler Army Medical Center", branch: "Army", state: "HI", city: "Honolulu", url: "#", lat: 21.366, lng: -157.884, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'dugway-proving', title: "Dugway Proving Ground", branch: "Army", state: "UT", city: "Dugway", url: "#", lat: 40.193, lng: -113.005, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'yuma-proving', title: "Yuma Proving Ground", branch: "Army", state: "AZ", city: "Yuma", url: "#", lat: 32.864, lng: -114.397, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'aberdeen-proving', title: "Aberdeen Proving Ground", branch: "Army", state: "MD", city: "Aberdeen", url: "#", lat: 39.466, lng: -76.122, size: "Medium", region: "CONUS", comingSoon: true },

  // Additional Air Force Bases
  { id: 'peterson-sfb', title: "Peterson Space Force Base", branch: "Air Force", state: "CO", city: "Colorado Springs", url: "#", lat: 38.813, lng: -104.700, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'schriever-sfb', title: "Schriever Space Force Base", branch: "Air Force", state: "CO", city: "Colorado Springs", url: "#", lat: 38.795, lng: -104.530, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'buckley-sfb', title: "Buckley Space Force Base", branch: "Air Force", state: "CO", city: "Aurora", url: "#", lat: 39.717, lng: -104.752, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'los-angeles-afb', title: "Los Angeles AFB", branch: "Air Force", state: "CA", city: "El Segundo", url: "#", lat: 33.919, lng: -118.382, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'march-arb', title: "March ARB", branch: "Air Force", state: "CA", city: "Riverside", url: "#", lat: 33.897, lng: -117.259, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'mcguire-afb', title: "McGuire AFB (JB MDL)", branch: "Air Force", state: "NJ", city: "Wrightstown", url: "#", lat: 40.015, lng: -74.592, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'hanscom-afb', title: "Hanscom AFB", branch: "Air Force", state: "MA", city: "Bedford", url: "#", lat: 42.461, lng: -71.289, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'westover-arb', title: "Westover ARB", branch: "Air Force", state: "MA", city: "Chicopee", url: "#", lat: 42.196, lng: -72.535, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'wright-patterson-afb', title: "Wright-Patterson AFB", branch: "Air Force", state: "OH", city: "Dayton", url: "#", lat: 39.826, lng: -84.048, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'luke-afb', title: "Luke AFB", branch: "Air Force", state: "AZ", city: "Glendale", url: "#", lat: 33.535, lng: -112.383, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'davis-monthan-afb', title: "Davis-Monthan AFB", branch: "Air Force", state: "AZ", city: "Tucson", url: "#", lat: 32.167, lng: -110.883, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'holloman-afb', title: "Holloman AFB", branch: "Air Force", state: "NM", city: "Alamogordo", url: "#", lat: 32.853, lng: -106.107, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'kirtland-afb', title: "Kirtland AFB", branch: "Air Force", state: "NM", city: "Albuquerque", url: "#", lat: 35.040, lng: -106.610, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'cannon-afb', title: "Cannon AFB", branch: "Air Force", state: "NM", city: "Clovis", url: "#", lat: 34.383, lng: -103.322, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'altus-afb', title: "Altus AFB", branch: "Air Force", state: "OK", city: "Altus", url: "#", lat: 34.667, lng: -99.267, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'vance-afb', title: "Vance AFB", branch: "Air Force", state: "OK", city: "Enid", url: "#", lat: 36.343, lng: -97.917, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'mcconnell-afb', title: "McConnell AFB", branch: "Air Force", state: "KS", city: "Wichita", url: "#", lat: 37.622, lng: -97.268, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'whiteman-afb', title: "Whiteman AFB", branch: "Air Force", state: "MO", city: "Knob Noster", url: "#", lat: 38.730, lng: -93.548, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'little-rock-afb', title: "Little Rock AFB", branch: "Air Force", state: "AR", city: "Jacksonville", url: "#", lat: 34.917, lng: -92.150, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'maxwell-afb', title: "Maxwell AFB", branch: "Air Force", state: "AL", city: "Montgomery", url: "#", lat: 32.383, lng: -86.350, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'eglin-afb', title: "Eglin AFB", branch: "Air Force", state: "FL", city: "Valparaiso", url: "#", lat: 30.483, lng: -86.525, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'tyndall-afb', title: "Tyndall AFB", branch: "Air Force", state: "FL", city: "Panama City", url: "#", lat: 30.070, lng: -85.575, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'hurlburt-field', title: "Hurlburt Field", branch: "Air Force", state: "FL", city: "Mary Esther", url: "#", lat: 30.428, lng: -86.689, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'macdill-afb', title: "MacDill AFB", branch: "Air Force", state: "FL", city: "Tampa", url: "#", lat: 27.849, lng: -82.503, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'patrick-sfb', title: "Patrick Space Force Base", branch: "Air Force", state: "FL", city: "Cocoa Beach", url: "#", lat: 28.235, lng: -80.610, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'cape-canaveral-sfs', title: "Cape Canaveral SFS", branch: "Air Force", state: "FL", city: "Cape Canaveral", url: "#", lat: 28.489, lng: -80.577, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'homestead-arb', title: "Homestead ARB", branch: "Air Force", state: "FL", city: "Homestead", url: "#", lat: 25.489, lng: -80.383, size: "Medium", region: "CONUS", comingSoon: true },

  // Additional Navy Installations
  { id: 'nas-fallon', title: "NAS Fallon", branch: "Navy", state: "NV", city: "Fallon", url: "#", lat: 39.417, lng: -118.701, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'nas-north-island', title: "NAS North Island", branch: "Navy", state: "CA", city: "Coronado", url: "#", lat: 32.699, lng: -117.215, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'nas-point-mugu', title: "NAS Point Mugu", branch: "Navy", state: "CA", city: "Point Mugu", url: "#", lat: 34.120, lng: -119.121, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'naval-base-ventura', title: "Naval Base Ventura County", branch: "Navy", state: "CA", city: "Port Hueneme", url: "#", lat: 34.153, lng: -119.195, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'naval-base-kitsap', title: "Naval Base Kitsap", branch: "Navy", state: "WA", city: "Bremerton", url: "#", lat: 47.556, lng: -122.626, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'naval-station-bremerton', title: "Naval Station Bremerton", branch: "Navy", state: "WA", city: "Bremerton", url: "#", lat: 47.563, lng: -122.633, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'naval-air-station-meridian', title: "NAS Meridian", branch: "Navy", state: "MS", city: "Meridian", url: "#", lat: 32.552, lng: -88.556, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'nas-kingsville', title: "NAS Kingsville", branch: "Navy", state: "TX", city: "Kingsville", url: "#", lat: 27.507, lng: -97.810, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'nas-fort-worth-jrb', title: "NAS Fort Worth JRB", branch: "Navy", state: "TX", city: "Fort Worth", url: "#", lat: 32.770, lng: -97.442, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'naval-submarine-base-new-london', title: "Naval Submarine Base New London", branch: "Navy", state: "CT", city: "Groton", url: "#", lat: 41.384, lng: -72.080, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'naval-air-station-brunswick', title: "NAS Brunswick (Former)", branch: "Navy", state: "ME", city: "Brunswick", url: "#", lat: 43.893, lng: -69.939, size: "Small", region: "CONUS", comingSoon: true },
  { id: 'naval-support-activity-mid-south', title: "NSA Mid-South (Millington)", branch: "Navy", state: "TN", city: "Millington", url: "#", lat: 35.356, lng: -89.870, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'naval-base-coronado', title: "Naval Base Coronado", branch: "Navy", state: "CA", city: "Coronado", url: "#", lat: 32.681, lng: -117.157, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'naval-base-pearl-harbor', title: "Naval Base Pearl Harbor", branch: "Navy", state: "HI", city: "Pearl Harbor", url: "#", lat: 21.343, lng: -157.950, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'naval-station-pearl-harbor', title: "Naval Station Pearl Harbor", branch: "Navy", state: "HI", city: "Pearl Harbor", url: "#", lat: 21.364, lng: -157.963, size: "Large", region: "CONUS", comingSoon: true },

  // Additional Marine Corps Bases
  { id: 'mcagcc-twentynine-palms', title: "MCAGCC Twentynine Palms", branch: "Marine Corps", state: "CA", city: "Twentynine Palms", url: "#", lat: 34.305, lng: -116.250, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'camp-lejeune', title: "Camp Lejeune", branch: "Marine Corps", state: "NC", city: "Jacksonville", url: "#", lat: 34.673, lng: -77.350, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'mclb-barstow', title: "MCLB Barstow", branch: "Marine Corps", state: "CA", city: "Barstow", url: "#", lat: 34.856, lng: -116.896, size: "Medium", region: "CONUS", comingSoon: true },
  { id: 'marine-corps-mountain-warfare', title: "MCMWTC Bridgeport", branch: "Marine Corps", state: "CA", city: "Bridgeport", url: "#", lat: 38.256, lng: -119.230, size: "Small", region: "CONUS", comingSoon: true },

  // Additional Joint Bases
  { id: 'jb-charleston', title: "Joint Base Charleston", branch: "Joint", state: "SC", city: "Charleston", url: "#", lat: 32.899, lng: -80.041, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'jb-langley-eustis', title: "Joint Base Langley-Eustis", branch: "Joint", state: "VA", city: "Hampton", url: "#", lat: 37.082, lng: -76.361, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'jb-mdl', title: "Joint Base McGuire-Dix-Lakehurst", branch: "Joint", state: "NJ", city: "Wrightstown", url: "#", lat: 40.024, lng: -74.592, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'jb-pearl-hickam', title: "Joint Base Pearl Harbor-Hickam", branch: "Joint", state: "HI", city: "Honolulu", url: "#", lat: 21.343, lng: -157.950, size: "Large", region: "CONUS", comingSoon: true },
  { id: 'jb-anacostia-bolling', title: "Joint Base Anacostia-Bolling", branch: "Joint", state: "DC", city: "Washington", url: "#", lat: 38.848, lng: -77.010, size: "Small", region: "CONUS", comingSoon: true },
];

// OCONUS BASES (Coming Soon - Not displayed on CONUS map)
export const oconusBases: BaseData[] = [
  {
    id: 'ramstein-ab',
    title: "Ramstein Air Base",
    branch: "Air Force",
    state: "Germany",
    city: "Kaiserslautern",
    url: "#",
    lat: 49.437,
    lng: 7.600,
    size: "Large",
    region: "OCONUS",
    country: "Germany",
    comingSoon: true
  },
  {
    id: 'camp-humphreys',
    title: "Camp Humphreys",
    branch: "Army",
    state: "South Korea",
    city: "Pyeongtaek",
    url: "#",
    lat: 36.968,
    lng: 127.036,
    size: "Large",
    region: "OCONUS",
    country: "South Korea",
    comingSoon: true
  },
  {
    id: 'mcas-iwakuni',
    title: "MCAS Iwakuni",
    branch: "Marine Corps",
    state: "Japan",
    city: "Iwakuni",
    url: "#",
    lat: 34.144,
    lng: 132.236,
    size: "Large",
    region: "OCONUS",
    country: "Japan",
    comingSoon: true
  },
  {
    id: 'naval-station-rota',
    title: "Naval Station Rota",
    branch: "Navy",
    state: "Spain",
    city: "Rota",
    url: "#",
    lat: 36.645,
    lng: -6.349,
    size: "Medium",
    region: "OCONUS",
    country: "Spain",
    comingSoon: true
  },

  // ===== GERMANY =====
  { id: 'grafenwoehr', title: "Grafenwoehr Training Area", branch: "Army", state: "Germany", city: "Grafenwoehr", url: "#", lat: 49.702, lng: 11.936, size: "Large", region: "OCONUS", country: "Germany", comingSoon: true },
  { id: 'vilseck', title: "Rose Barracks (Vilseck)", branch: "Army", state: "Germany", city: "Vilseck", url: "#", lat: 49.626, lng: 11.766, size: "Medium", region: "OCONUS", country: "Germany", comingSoon: true },
  { id: 'wiesbaden', title: "Wiesbaden Army Airfield", branch: "Army", state: "Germany", city: "Wiesbaden", url: "#", lat: 50.050, lng: 8.325, size: "Medium", region: "OCONUS", country: "Germany", comingSoon: true },
  { id: 'spangdahlem-ab', title: "Spangdahlem AB", branch: "Air Force", state: "Germany", city: "Spangdahlem", url: "#", lat: 49.973, lng: 6.692, size: "Medium", region: "OCONUS", country: "Germany", comingSoon: true },
  { id: 'kaiserslautern', title: "Kaiserslautern Military Community", branch: "Army", state: "Germany", city: "Kaiserslautern", url: "#", lat: 49.444, lng: 7.770, size: "Large", region: "OCONUS", country: "Germany", comingSoon: true },

  // ===== JAPAN =====
  { id: 'yokota-ab', title: "Yokota AB", branch: "Air Force", state: "Japan", city: "Fussa", url: "#", lat: 35.748, lng: 139.348, size: "Large", region: "OCONUS", country: "Japan", comingSoon: true },
  { id: 'kadena-ab', title: "Kadena AB", branch: "Air Force", state: "Japan", city: "Okinawa", url: "#", lat: 26.351, lng: 127.768, size: "Large", region: "OCONUS", country: "Japan", comingSoon: true },
  { id: 'misawa-ab', title: "Misawa AB", branch: "Air Force", state: "Japan", city: "Misawa", url: "#", lat: 40.703, lng: 141.368, size: "Medium", region: "OCONUS", country: "Japan", comingSoon: true },
  { id: 'camp-zama', title: "Camp Zama", branch: "Army", state: "Japan", city: "Zama", url: "#", lat: 35.517, lng: 139.398, size: "Medium", region: "OCONUS", country: "Japan", comingSoon: true },
  { id: 'camp-foster', title: "Camp Foster", branch: "Marine Corps", state: "Japan", city: "Okinawa", url: "#", lat: 26.299, lng: 127.756, size: "Large", region: "OCONUS", country: "Japan", comingSoon: true },
  { id: 'camp-hansen', title: "Camp Hansen", branch: "Marine Corps", state: "Japan", city: "Okinawa", url: "#", lat: 26.433, lng: 127.921, size: "Medium", region: "OCONUS", country: "Japan", comingSoon: true },

  // ===== SOUTH KOREA =====
  { id: 'osan-ab', title: "Osan AB", branch: "Air Force", state: "South Korea", city: "Pyeongtaek", url: "#", lat: 37.090, lng: 127.030, size: "Large", region: "OCONUS", country: "South Korea", comingSoon: true },
  { id: 'camp-casey', title: "Camp Casey", branch: "Army", state: "South Korea", city: "Dongducheon", url: "#", lat: 37.899, lng: 127.052, size: "Medium", region: "OCONUS", country: "South Korea", comingSoon: true },
  { id: 'camp-red-cloud', title: "Camp Red Cloud", branch: "Army", state: "South Korea", city: "Uijeongbu", url: "#", lat: 37.742, lng: 127.042, size: "Small", region: "OCONUS", country: "South Korea", comingSoon: true },
  { id: 'yongsan', title: "Camp Humphreys (Yongsan Relocation)", branch: "Army", state: "South Korea", city: "Pyeongtaek", url: "#", lat: 36.968, lng: 127.036, size: "Large", region: "OCONUS", country: "South Korea", comingSoon: true },

  // ===== ITALY =====
  { id: 'aviano-ab', title: "Aviano AB", branch: "Air Force", state: "Italy", city: "Aviano", url: "#", lat: 46.032, lng: 12.596, size: "Medium", region: "OCONUS", country: "Italy", comingSoon: true },
  { id: 'nas-sigonella', title: "NAS Sigonella", branch: "Navy", state: "Italy", city: "Sicily", url: "#", lat: 37.402, lng: 14.922, size: "Medium", region: "OCONUS", country: "Italy", comingSoon: true },
  { id: 'caserma-ederle', title: "Caserma Ederle (Vicenza)", branch: "Army", state: "Italy", city: "Vicenza", url: "#", lat: 45.548, lng: 11.552, size: "Medium", region: "OCONUS", country: "Italy", comingSoon: true },

  // ===== UNITED KINGDOM =====
  { id: 'raf-lakenheath', title: "RAF Lakenheath", branch: "Air Force", state: "United Kingdom", city: "Suffolk", url: "#", lat: 52.409, lng: 0.561, size: "Large", region: "OCONUS", country: "United Kingdom", comingSoon: true },
  { id: 'raf-mildenhall', title: "RAF Mildenhall", branch: "Air Force", state: "United Kingdom", city: "Suffolk", url: "#", lat: 52.361, lng: 0.486, size: "Medium", region: "OCONUS", country: "United Kingdom", comingSoon: true },
  { id: 'raf-croughton', title: "RAF Croughton", branch: "Air Force", state: "United Kingdom", city: "Northamptonshire", url: "#", lat: 51.995, lng: -1.187, size: "Small", region: "OCONUS", country: "United Kingdom", comingSoon: true },

  // ===== OTHER OCONUS =====
  { id: 'andersen-afb', title: "Andersen AFB", branch: "Air Force", state: "Guam", city: "Yigo", url: "#", lat: 13.584, lng: 144.930, size: "Large", region: "OCONUS", country: "Guam", comingSoon: true },
  { id: 'naval-base-guam', title: "Naval Base Guam", branch: "Navy", state: "Guam", city: "Apra Harbor", url: "#", lat: 13.447, lng: 144.656, size: "Large", region: "OCONUS", country: "Guam", comingSoon: true },
  { id: 'incirlik-ab', title: "Incirlik AB", branch: "Air Force", state: "Turkey", city: "Adana", url: "#", lat: 37.000, lng: 35.426, size: "Medium", region: "OCONUS", country: "Turkey", comingSoon: true },
  { id: 'thule-ab', title: "Thule AB", branch: "Air Force", state: "Greenland", city: "Pituffik", url: "#", lat: 76.531, lng: -68.703, size: "Small", region: "OCONUS", country: "Greenland", comingSoon: true },
  { id: 'diego-garcia', title: "Naval Support Facility Diego Garcia", branch: "Navy", state: "British Indian Ocean Territory", city: "Diego Garcia", url: "#", lat: -7.312, lng: 72.411, size: "Small", region: "OCONUS", country: "British Indian Ocean Territory", comingSoon: true },
];

//===== TOTAL BASES: 156 CONUS + 27 OCONUS = 183 bases =====/

// Helper functions
export const getAllBases = () => [...basesData, ...oconusBases];

export const getFeaturedBases = () => basesData.filter(base => base.featured);

export const getBasesByBranch = (branch: string) => 
  branch === 'All' ? basesData : basesData.filter(base => base.branch === branch);

export const getBasesByRegion = (region: 'CONUS' | 'OCONUS' | 'All' = 'All') => {
  const allBases = getAllBases();
  return region === 'All' ? allBases : allBases.filter(base => base.region === region);
};

export const getBaseById = (id: string) => {
  const allBases = getAllBases();
  return allBases.find(base => base.id === id);
};

export const searchBases = (query: string) => {
  const lowerQuery = query.toLowerCase();
  const allBases = getAllBases();
  return allBases.filter(base =>
    base.title.toLowerCase().includes(lowerQuery) ||
    base.state.toLowerCase().includes(lowerQuery) ||
    base.city.toLowerCase().includes(lowerQuery) ||
    base.branch.toLowerCase().includes(lowerQuery) ||
    (base.country && base.country.toLowerCase().includes(lowerQuery))
  );
};

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

