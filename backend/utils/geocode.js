const axios = require("axios");

const geocodeAddress = async (address) => {
  try {
    // Preprocess address to remove phone numbers and unwanted parts
    let cleanedAddress = address.trim();
    // Remove phone number pattern (e.g., (XXX) XXX-XXXX or XXX-XXX-XXXX)
    cleanedAddress = cleanedAddress.replace(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "").trim();
    // Remove apartment/unit details (e.g., Apt 2125, Unit #12, #APT 2125)
    cleanedAddress = cleanedAddress.replace(/(apt|apartment|unit|suite|#)\s*[\w\d]+/i, "").trim();
    // Remove state abbreviation in parentheses (e.g., (TX))
    cleanedAddress = cleanedAddress.replace(/\s*\([A-Z]{2}\)/, "").trim();
    // Remove multiple spaces and normalize
    cleanedAddress = cleanedAddress.replace(/\s+/g, " ").trim();

    console.log("Cleaned address for geocoding:", cleanedAddress);

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedAddress)}&addressdetails=1&limit=1`
    );

    const data = response.data;
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid coordinates returned from geocoding");
      }

      return {
        location: data[0].display_name,
        coordinates: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        latitude,
        longitude
      };
    } else {
      throw new Error("Geocoding failed: No results found");
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

module.exports = geocodeAddress;