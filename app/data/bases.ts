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
];

// Helper functions
export const getFeaturedBases = () => basesData.filter(base => base.featured);

export const getBasesByBranch = (branch: string) => 
  branch === 'All' ? basesData : basesData.filter(base => base.branch === branch);

export const getBaseById = (id: string) => 
  basesData.find(base => base.id === id);

export const searchBases = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return basesData.filter(base =>
    base.title.toLowerCase().includes(lowerQuery) ||
    base.state.toLowerCase().includes(lowerQuery) ||
    base.city.toLowerCase().includes(lowerQuery) ||
    base.branch.toLowerCase().includes(lowerQuery)
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

