const Provider = require('../models/Provider');

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const findProviders = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }

    const allProviders = await Provider.find();
    if (allProviders.length === 0) {
      return res.status(404).json({ message: 'No providers found' });
    }

    const geocodeAddress = require('../utils/geocode');
    const { latitude: consumerLat, longitude: consumerLng } = await geocodeAddress(location);

    const providersWithDistance = allProviders.map((provider) => {
      const distance = calculateDistance(
        consumerLat,
        consumerLng,
        provider.latitude,
        provider.longitude
      );
      return {
        id: provider._id,
        shopName: provider.shopName,
        location: provider.location,
        distance,
      };
    });

    providersWithDistance.sort((a, b) => a.distance - b.distance);
    const topFiveProviders = providersWithDistance.slice(0, 5);

    res.json({ providers: topFiveProviders });
  } catch (error) {
    console.error('Error finding providers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { findProviders };