const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  shopName: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  secretCode: { type: String, required: true }
});

// Create geospatial index
providerSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Provider', providerSchema);