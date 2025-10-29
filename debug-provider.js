// Debug individual provider
const { fetchAmenitiesData } = require("./lib/navigator/amenities.js");

async function testProvider() {
  console.log("Testing amenities provider...");

  try {
    const result = await fetchAmenitiesData("98498");
    console.log("Amenities result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Amenities error:", error);
  }
}

testProvider();
