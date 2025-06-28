const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  secretCode: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
});

module.exports = mongoose.model('Provider', providerSchema);