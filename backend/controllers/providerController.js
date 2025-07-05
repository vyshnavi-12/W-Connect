const Provider = require("../models/Provider");
const { geocodeAddress } = require("../utils/geocode"); // Updated import - destructured

const findProviders = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    console.log("Finding providers for location:", location);

    // Geocode the consumer's location with enhanced error handling
    let consumerCoords;
    try {
      consumerCoords = await geocodeAddress(location);
      if (!consumerCoords.latitude || !consumerCoords.longitude) {
        throw new Error("Invalid coordinates from geocoding");
      }
      
      console.log("Consumer coordinates:", {
        latitude: consumerCoords.latitude,
        longitude: consumerCoords.longitude,
        geocoding_level: consumerCoords.geocoding_level || 'unknown'
      });
      
    } catch (error) {
      console.error("Geocoding error:", error.message);
      
      // Provide more specific error messages
      let errorMessage = "Could not determine location coordinates";
      if (error.message.includes("No results found")) {
        errorMessage = "Location not found. Please provide a more specific address.";
      } else if (error.message.includes("All geocoding strategies failed")) {
        errorMessage = "Unable to locate the provided address. Please provide a more complete address.";
      }
      
      return res.status(400).json({
        message: errorMessage,
        details: error.message
      });
    }

    // Find providers within 50km using MongoDB geospatial query
    const providers = await Provider.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [consumerCoords.longitude, consumerCoords.latitude]
          },
          $maxDistance: 50 * 1000 // 50km in meters
        }
      }
    })
      .limit(5)
      .lean();

    console.log(`Found ${providers.length} providers within 50km`);

    if (providers.length === 0) {
      return res.status(200).json({
        providers: [],
        consumerLocation: consumerCoords.location,
        geocodingLevel: consumerCoords.geocoding_level || 'unknown'
      });
    }

    // Format providers with distance
    const formattedProviders = providers.map((provider) => {
      // Calculate approximate distance in km for display using Haversine formula
      const lat1 = consumerCoords.latitude * Math.PI / 180;
      const lat2 = provider.latitude * Math.PI / 180;
      const deltaLat = (provider.latitude - consumerCoords.latitude) * Math.PI / 180;
      const deltaLon = (provider.longitude - consumerCoords.longitude) * Math.PI / 180;

      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = (6371 * c).toFixed(1); // Earth radius in km

      return {
        id: provider._id,
        shopName: provider.shopName,
        location: provider.location,
        distance: parseFloat(distance),
        formattedDistance: `${distance} km`
      };
    });

    // Sort by distance (although $nearSphere should already sort)
    formattedProviders.sort((a, b) => a.distance - b.distance);

    const response = {
      providers: formattedProviders,
      consumerLocation: consumerCoords.location,
      geocodingLevel: consumerCoords.geocoding_level || 'unknown'
    };

    // Add warning if geocoding precision is low
    if (consumerCoords.geocoding_level === 'approximate' || consumerCoords.geocoding_level === 'city_level') {
      response.locationWarning = "Location precision is low. Results may not be accurate.";
    }

    res.json(response);
    
  } catch (error) {
    console.error("Error finding providers:", error.message);
    res.status(500).json({
      message: "Server error while finding providers",
      error: error.message
    });
  }
};

module.exports = { findProviders };