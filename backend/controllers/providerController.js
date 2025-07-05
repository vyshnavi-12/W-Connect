const Provider = require("../models/Provider");
const geocodeAddress = require("../utils/geocode");

const findProviders = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }

    // Geocode the consumer's location
    let consumerCoords;
    try {
      consumerCoords = await geocodeAddress(location);
      if (!consumerCoords.latitude || !consumerCoords.longitude) {
        throw new Error("Invalid coordinates from geocoding");
      }
    } catch (error) {
      console.error("Geocoding error:", error.message);
      return res.status(400).json({
        message: "Could not determine location coordinates",
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

    if (providers.length === 0) {
      return res.status(200).json({
        providers: [],
        consumerLocation: consumerCoords.location
      });
    }

    // Format providers with distance
    const formattedProviders = providers.map((provider) => {
      // Calculate approximate distance in km for display (optional, since $nearSphere sorts by distance)
      const distance = (
        Math.acos(
          Math.sin(consumerCoords.latitude * Math.PI / 180) * Math.sin(provider.latitude * Math.PI / 180) +
          Math.cos(consumerCoords.latitude * Math.PI / 180) * Math.cos(provider.latitude * Math.PI / 180) *
          Math.cos((provider.longitude - consumerCoords.longitude) * Math.PI / 180)
        ) * 6371
      ).toFixed(1); // Earth radius in km, rounded to 1 decimal place

      return {
        id: provider._id,
        shopName: provider.shopName,
        location: provider.location,
        distance: parseFloat(distance),
        formattedDistance: `${distance} km`
      };
    });

    res.json({
      providers: formattedProviders,
      consumerLocation: consumerCoords.location
    });
  } catch (error) {
    console.error("Error finding providers:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = { findProviders };