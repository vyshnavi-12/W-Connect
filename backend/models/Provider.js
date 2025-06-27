const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  shopName: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  secretCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Provider', providerSchema);