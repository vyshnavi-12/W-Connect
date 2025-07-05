const axios = require("axios");

const geocodeAddress = async (address) => {
  try {
    // Enhanced preprocessing for Indian addresses
    let cleanedAddress = address.trim();
    
    // Remove phone number pattern
    cleanedAddress = cleanedAddress.replace(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "").trim();
    
    // Remove apartment/unit details
    cleanedAddress = cleanedAddress.replace(/(apt|apartment|unit|suite|#)\s*[\w\d]+/i, "").trim();
    
    // Remove state abbreviation in parentheses
    cleanedAddress = cleanedAddress.replace(/\s*\([A-Z]{2}\)/, "").trim();
    
    // Indian-specific cleaning
    // Remove house number patterns (H.No, HNo, H No, House No, etc.)
    cleanedAddress = cleanedAddress.replace(/\b(h\.?no\.?|house\s+no\.?|h\s+no\.?)\s*[\d\-\/]+/i, "").trim();
    
    // Remove plot/door number patterns
    cleanedAddress = cleanedAddress.replace(/\b(plot\s+no\.?|door\s+no\.?|d\.?no\.?)\s*[\d\-\/]+/i, "").trim();
    
    // Remove multiple spaces and normalize
    cleanedAddress = cleanedAddress.replace(/\s+/g, " ").trim();
    
    console.log("Cleaned address for geocoding:", cleanedAddress);

    // Try multiple geocoding strategies
    const strategies = [
      cleanedAddress, // Full cleaned address
      getAreaBasedAddress(cleanedAddress), // Area + City + State
      getCityBasedAddress(cleanedAddress), // City + State only
    ];

    for (const addressToTry of strategies) {
      console.log(`Trying geocoding strategy: ${addressToTry}`);
      
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressToTry)}&addressdetails=1&limit=1&countrycodes=in`,
          {
            headers: {
              'User-Agent': 'YourAppName/1.0' // Add a proper user agent
            }
          }
        );

        const data = response.data;
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lon);

          if (isNaN(latitude) || isNaN(longitude)) {
            continue; // Try next strategy
          }

          return {
            location: data[0].display_name,
            coordinates: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            latitude,
            longitude,
            geocoding_level: getGeocodingLevel(data[0], addressToTry)
          };
        }
      } catch (strategyError) {
        console.log(`Strategy failed: ${strategyError.message}`);
        continue; // Try next strategy
      }
    }

    throw new Error("All geocoding strategies failed");
    
  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

// Helper function to extract area-based address
const getAreaBasedAddress = (address) => {
  // Extract area name, city, state from Indian address
  const parts = address.split(',').map(part => part.trim());
  if (parts.length >= 3) {
    // Skip the first part (usually street/house details) and take area + city + state
    return parts.slice(1).join(', ');
  }
  return address;
};

// Helper function to extract city-based address
const getCityBasedAddress = (address) => {
  // Extract only city, state, country from Indian address
  const parts = address.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    // Take last 2-3 parts (city, state, country)
    return parts.slice(-3).join(', ');
  }
  return address;
};

// Helper function to determine geocoding accuracy level
const getGeocodingLevel = (result, originalQuery) => {
  const addressType = result.type || result.class;
  
  if (addressType === 'house' || addressType === 'building') {
    return 'house_level';
  } else if (addressType === 'road' || addressType === 'street') {
    return 'street_level';
  } else if (addressType === 'neighbourhood' || addressType === 'suburb') {
    return 'area_level';
  } else if (addressType === 'city' || addressType === 'town' || addressType === 'village') {
    return 'city_level';
  } else {
    return 'approximate';
  }
};

// Alternative geocoding function using multiple providers
const geocodeAddressWithFallback = async (address) => {
  const providers = [
    geocodeWithNominatim,
    geocodeWithPositionstack, // Requires API key
    geocodeWithMapbox, // Requires API key
  ];

  for (const provider of providers) {
    try {
      const result = await provider(address);
      if (result) return result;
    } catch (error) {
      console.log(`Provider failed: ${error.message}`);
      continue;
    }
  }
  
  throw new Error("All geocoding providers failed");
};

const geocodeWithNominatim = async (address) => {
  return await geocodeAddress(address);
};

const geocodeWithPositionstack = async (address) => {
  // Requires API key from https://positionstack.com/
  const API_KEY = process.env.POSITIONSTACK_API_KEY;
  if (!API_KEY) throw new Error("Positionstack API key not provided");
  
  const response = await axios.get(
    `http://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${encodeURIComponent(address)}&country=IN&limit=1`
  );
  
  if (response.data.data && response.data.data.length > 0) {
    const result = response.data.data[0];
    return {
      location: result.label,
      coordinates: {
        type: "Point",
        coordinates: [result.longitude, result.latitude]
      },
      latitude: result.latitude,
      longitude: result.longitude
    };
  }
  
  throw new Error("No results from Positionstack");
};

const geocodeWithMapbox = async (address) => {
  // Requires API key from https://www.mapbox.com/
  const API_KEY = process.env.MAPBOX_API_KEY;
  if (!API_KEY) throw new Error("Mapbox API key not provided");
  
  const response = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${API_KEY}&country=IN&limit=1`
  );
  
  if (response.data.features && response.data.features.length > 0) {
    const result = response.data.features[0];
    return {
      location: result.place_name,
      coordinates: {
        type: "Point",
        coordinates: result.geometry.coordinates
      },
      latitude: result.geometry.coordinates[1],
      longitude: result.geometry.coordinates[0]
    };
  }
  
  throw new Error("No results from Mapbox");
};

module.exports = { 
  geocodeAddress, 
  geocodeAddressWithFallback 
};