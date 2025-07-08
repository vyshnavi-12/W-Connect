const Provider = require("../models/Provider");
const { Consumer } = require("../models/Consumer");
const { GeminiService } = require("../utils/geminiService");
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
        geocoding_level: consumerCoords.geocoding_level || "unknown",
      });
    } catch (error) {
      console.error("Geocoding error:", error.message);

      // Provide more specific error messages
      let errorMessage = "Could not determine location coordinates";
      if (error.message.includes("No results found")) {
        errorMessage =
          "Location not found. Please provide a more specific address.";
      } else if (error.message.includes("All geocoding strategies failed")) {
        errorMessage =
          "Unable to locate the provided address. Please provide a more complete address.";
      }

      return res.status(400).json({
        message: errorMessage,
        details: error.message,
      });
    }

    // Find providers within 50km using MongoDB geospatial query
    const providers = await Provider.find({
      coordinates: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [consumerCoords.longitude, consumerCoords.latitude],
          },
          $maxDistance: 50 * 1000, // 50km in meters
        },
      },
    })
      .limit(5)
      .lean();

    console.log(`Found ${providers.length} providers within 50km`);

    if (providers.length === 0) {
      return res.status(200).json({
        providers: [],
        consumerLocation: consumerCoords.location,
        geocodingLevel: consumerCoords.geocoding_level || "unknown",
      });
    }

    // Format providers with distance
    const formattedProviders = providers.map((provider) => {
      // Calculate approximate distance in km for display using Haversine formula
      const lat1 = (consumerCoords.latitude * Math.PI) / 180;
      const lat2 = (provider.latitude * Math.PI) / 180;
      const deltaLat =
        ((provider.latitude - consumerCoords.latitude) * Math.PI) / 180;
      const deltaLon =
        ((provider.longitude - consumerCoords.longitude) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
          Math.cos(lat2) *
          Math.sin(deltaLon / 2) *
          Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = (6371 * c).toFixed(1); // Earth radius in km

      return {
        id: provider._id,
        shopName: provider.shopName,
        location: provider.location,
        distance: parseFloat(distance),
        formattedDistance: `${distance} km`,
      };
    });

    // Sort by distance (although $nearSphere should already sort)
    formattedProviders.sort((a, b) => a.distance - b.distance);

    const response = {
      providers: formattedProviders,
      consumerLocation: consumerCoords.location,
      geocodingLevel: consumerCoords.geocoding_level || "unknown",
    };

    // Add warning if geocoding precision is low
    if (
      consumerCoords.geocoding_level === "approximate" ||
      consumerCoords.geocoding_level === "city_level"
    ) {
      response.locationWarning =
        "Location precision is low. Results may not be accurate.";
    }

    res.json(response);
  } catch (error) {
    console.error("Error finding providers:", error.message);
    res.status(500).json({
      message: "Server error while finding providers",
      error: error.message,
    });
  }
};

// Post stock and find matching consumers
const postStockAndFindConsumers = async (req, res) => {
  try {
    const { productName, originalPrice, discountOffering, category, quantity } = req.body;
    const providerId = req.user.id; // Get provider ID from authenticated user

    if (!productName || !originalPrice || !category || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product name, original price, category, and quantity are required'
      });
    }

    // Find the provider to get their location
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Find consumers connected to this provider (regardless of needsStorage status)
    const allConsumers = await Consumer.find({
      connectedProvider: providerId,
      status: 'accepted'
    })
    .select('shopName location email productDetails needsStorage')
    .sort({ acceptedAt: -1 });

    console.log(`Found ${allConsumers.length} consumers connected to provider ${providerId}`);
    console.log('Consumers:', allConsumers.map(c => ({ id: c._id, shopName: c.shopName, productDetails: c.productDetails })));

    if (allConsumers.length === 0) {
      return res.status(200).json({
        success: true,
        consumers: [],
        count: 0,
        message: 'No consumers found connected to this provider'
      });
    }

    // Use AI to find matching consumers based on product name, with fallback to all consumers
    try {
      const matchingConsumersWithScores = [];
      
      for (const consumer of allConsumers) {
        if (!consumer.productDetails || consumer.productDetails.length === 0) {
          continue;
        }

        // Use AI to compare the posted product with consumer's product interests
        const aiMatchingResult = await GeminiService.compareProductsIntelligently(
          consumer.productDetails,
          [productName.toLowerCase()]
        );

        if (aiMatchingResult && aiMatchingResult.hasAnyMatch) {
          matchingConsumersWithScores.push({
            ...consumer.toObject(),
            matchingScore: aiMatchingResult.totalScore,
            aiEnhanced: true
          });
        }
      }

      // Sort by matching score in descending order and limit to top 10
      const topMatchingConsumers = matchingConsumersWithScores
        .sort((a, b) => b.matchingScore - a.matchingScore)
        .slice(0, 10)
        .map(consumer => {
          // Remove temporary fields from final response
          const { matchingScore, aiEnhanced, ...consumerData } = consumer;
          return {
            ...consumerData,
            id: consumerData._id.toString() // Add id field for frontend compatibility
          };
        });

      return res.status(200).json({
        success: true,
        consumers: topMatchingConsumers,
        count: topMatchingConsumers.length,
        aiEnhanced: true,
        stockPosted: {
          productName,
          originalPrice,
          discountOffering,
          category,
          quantity
        }
      });

    } catch (aiError) {
      console.error('Error in AI matching, falling back to all consumers:', aiError.message);
      console.log('Falling back to returning all connected consumers without AI matching');
      
      // Fallback: Return all connected consumers without product matching
      const fallbackConsumers = allConsumers.map(consumer => ({
        ...consumer.toObject(),
        id: consumer._id.toString()
      }));
      
      console.log(`Returning ${fallbackConsumers.length} fallback consumers`);
      
      return res.status(200).json({
        success: true,
        consumers: fallbackConsumers,
        count: fallbackConsumers.length,
        message: 'AI service unavailable - returning all connected consumers',
        aiEnhanced: false,
        stockPosted: {
          productName,
          originalPrice,
          discountOffering,
          category,
          quantity
        }
      });
    }

  } catch (error) {
    console.error('Error posting stock and finding consumers:', error);
    res.status(500).json({
      success: false,
      message: 'Error posting stock and finding consumers',
      error: error.message
    });
  }
};

module.exports = { findProviders, postStockAndFindConsumers };
