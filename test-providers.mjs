// Test providers directly
import { fetchAmenitiesData } from "./lib/navigator/amenities.js";
import { weatherComfortIndex } from "./lib/navigator/weather.js";
import { fetchMilitaryAmenitiesData } from "./lib/navigator/military.js";
import { fetchDemographicsData } from "./lib/navigator/demographics.js";

async function testProviders() {
  const zip = "98498";
  console.log(`Testing providers for ZIP: ${zip}`);

  try {
    console.log("\n=== Testing Amenities ===");
    const amenities = await fetchAmenitiesData(zip);
    console.log("Amenities result:", JSON.stringify(amenities, null, 2));

    console.log("\n=== Testing Weather ===");
    const weather = await weatherComfortIndex(zip);
    console.log("Weather result:", JSON.stringify(weather, null, 2));

    console.log("\n=== Testing Military ===");
    const military = await fetchMilitaryAmenitiesData(zip);
    console.log("Military result:", JSON.stringify(military, null, 2));

    console.log("\n=== Testing Demographics ===");
    const demographics = await fetchDemographicsData(zip);
    console.log("Demographics result:", JSON.stringify(demographics, null, 2));
  } catch (error) {
    console.error("Error testing providers:", error);
  }
}

testProviders();
