const axios = require("axios");

// Add rate limiting for Nominatim
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const geocodeAddress = async (address) => {
  try {
    // Enhanced preprocessing for Indian addresses
    let cleanedAddress = address.trim();
    
    console.log("Original address:", cleanedAddress);
    
    // Remove phone number pattern
    cleanedAddress = cleanedAddress.replace(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "").trim();
    
    // Remove apartment/unit details
    cleanedAddress = cleanedAddress.replace(/(apt|apartment|unit|suite|#)\s*[\w\d]+/i, "").trim();
    
    // Remove state abbreviation in parentheses
    cleanedAddress = cleanedAddress.replace(/\s*\([A-Z]{2}\)/, "").trim();
    
    // Indian-specific cleaning - FIXED: More conservative approach
    // Only remove house number patterns if they're at the beginning and followed by comma
    cleanedAddress = cleanedAddress.replace(/^(h\.?no\.?|house\s+no\.?|h\s+no\.?)\s*[\d\-\/]+,?\s*/i, "").trim();
    
    // Only remove plot/door number patterns if they're at the beginning and followed by comma
    cleanedAddress = cleanedAddress.replace(/^(plot\s+no\.?|door\s+no\.?|d\.?no\.?)\s*[\d\-\/]+,?\s*/i, "").trim();
    
    // Remove multiple spaces and normalize
    cleanedAddress = cleanedAddress.replace(/\s+/g, " ").trim();
    
    // Remove leading comma if present
    cleanedAddress = cleanedAddress.replace(/^,\s*/, "").trim();
    
    console.log("Cleaned address for geocoding:", cleanedAddress);

    // Try multiple geocoding strategies with better fallbacks
    const strategies = [
      cleanedAddress, // Full cleaned address
      getAreaBasedAddress(cleanedAddress), // Area + City + State
      getCityBasedAddress(cleanedAddress), // City + State only
      getDistrictBasedAddress(cleanedAddress), // Just city + country
    ];

    // Remove duplicates and empty strategies
    const uniqueStrategies = [...new Set(strategies.filter(s => s && s.trim().length > 0))];
    
    console.log("Geocoding strategies:", uniqueStrategies);

    for (let i = 0; i < uniqueStrategies.length; i++) {
      const addressToTry = uniqueStrategies[i];
      console.log(`Trying geocoding strategy ${i + 1}: ${addressToTry}`);
      
      try {
        // Add delay between requests to respect Nominatim rate limits
        if (i > 0) {
          await delay(1000); // 1 second delay between requests
        }
        
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressToTry)}&addressdetails=1&limit=5&countrycodes=in`,
          {
            headers: {
              'User-Agent': 'YourAppName/1.0 (contact@yourapp.com)' // Better user agent
            },
            timeout: 10000 // 10 second timeout
          }
        );

        const data = response.data;
        console.log(`Strategy ${i + 1} returned ${data.length} results`);
        
        if (data && data.length > 0) {
          // Find the best result
          const bestResult = findBestResult(data, addressToTry);
          
          if (bestResult) {
            const { lat, lon } = bestResult;
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            if (isNaN(latitude) || isNaN(longitude)) {
              console.log(`Strategy ${i + 1} returned invalid coordinates`);
              continue; // Try next strategy
            }

            console.log(`Strategy ${i + 1} succeeded:`, {
              lat: latitude,
              lon: longitude,
              display_name: bestResult.display_name
            });

            return {
              location: bestResult.display_name,
              coordinates: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              latitude,
              longitude,
              geocoding_level: getGeocodingLevel(bestResult, addressToTry),
              strategy_used: i + 1,
              strategy_query: addressToTry
            };
          }
        }
      } catch (strategyError) {
        console.log(`Strategy ${i + 1} failed:`, strategyError.message);
        continue; // Try next strategy
      }
    }

    throw new Error("All geocoding strategies failed");
    
  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw new Error(`Geocoding failed: ${error.message}`);
  }
};

// Helper function to find the best result from multiple results
const findBestResult = (results, query) => {
  if (results.length === 1) return results[0];
  
  // Prefer results with higher importance or better type
  const scored = results.map(result => ({
    result,
    score: calculateResultScore(result, query)
  }));
  
  // Sort by score (higher is better)
  scored.sort((a, b) => b.score - a.score);
  
  return scored[0].result;
};

// Helper function to score results
const calculateResultScore = (result, query) => {
  let score = 0;
  
  // Higher importance is better
  if (result.importance) {
    score += result.importance * 100;
  }
  
  // Prefer more specific types
  const typeScore = {
    'house': 10,
    'building': 9,
    'road': 8,
    'street': 7,
    'neighbourhood': 6,
    'suburb': 5,
    'city': 4,
    'town': 3,
    'village': 2,
    'state': 1
  };
  
  if (result.type && typeScore[result.type]) {
    score += typeScore[result.type];
  }
  
  // Prefer results that contain more of the original query terms
  const queryWords = query.toLowerCase().split(/\s+/);
  const displayWords = result.display_name.toLowerCase().split(/\s+/);
  
  const matchingWords = queryWords.filter(word => 
    displayWords.some(displayWord => displayWord.includes(word))
  );
  
  score += (matchingWords.length / queryWords.length) * 10;
  
  return score;
};

// Helper function to extract area-based address
const getAreaBasedAddress = (address) => {
  // Extract area name, city, state from Indian address
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  if (parts.length >= 3) {
    // Skip the first part (usually street/house details) and take area + city + state
    return parts.slice(1).join(', ');
  } else if (parts.length >= 2) {
    // If only 2 parts, take both
    return parts.join(', ');
  }
  return address;
};

// Helper function to extract city-based address
const getCityBasedAddress = (address) => {
  // Extract only city, state, country from Indian address
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  if (parts.length >= 2) {
    // Take last 2-3 parts (city, state, country)
    const cityParts = parts.slice(-2); // Take last 2 parts
    return cityParts.join(', ');
  }
  return address;
};

// Helper function to extract district-based address
const getDistrictBasedAddress = (address) => {
  // Extract only city and country for very broad search
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  
  // Look for city names (typically the second-to-last or third-to-last part)
  const cityKeywords = ['hyderabad', 'bangalore', 'mumbai', 'delhi', 'chennai', 'kolkata', 'pune', 'ahmedabad'];
  
  for (const part of parts) {
    if (cityKeywords.some(city => part.toLowerCase().includes(city))) {
      return `${part}, India`;
    }
  }
  
  // Fallback: just take the largest part that looks like a city
  if (parts.length >= 1) {
    const lastPart = parts[parts.length - 1];
    if (lastPart.toLowerCase() !== 'india') {
      return `${lastPart}, India`;
    } else if (parts.length >= 2) {
      return `${parts[parts.length - 2]}, India`;
    }
  }
  
  return "India"; // Ultimate fallback
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
      longitude: result.longitude,
      geocoding_level: 'approximate'
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
      longitude: result.geometry.coordinates[0],
      geocoding_level: 'approximate'
    };
  }
  
  throw new Error("No results from Mapbox");
};

module.exports = { 
  geocodeAddress, 
  geocodeAddressWithFallback 
};