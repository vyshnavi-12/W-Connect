const axios = require('axios');

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'W-Connect-App', // Nominatim requires identifying User-Agent
      },
    });

    if (response.data.length === 0) {
      throw new Error('Geocoding failed: No results found');
    }

    const { lat, lon } = response.data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch (error) {
    console.error('Error in geocoding:', error.message);
    throw new Error('Geocoding API error');
  }
};

module.exports = geocodeAddress;
