const mongoose = require("mongoose");

// Schema for pending requests
const PendingRequestSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  secretCode: { type: String, required: true }, // will be hashed
  productDetails: [String],
  needsStorage: { type: Boolean, default: false },
  connectedProvider: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Schema for accepted consumers
const ConsumerSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  secretCode: { type: String, required: true }, // will be hashed
  productDetails: [String],
  needsStorage: { type: Boolean, default: false },
  connectedProvider: { type: String, required: true },
  status: { type: String, default: 'accepted' },
  acceptedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const PendingRequest = mongoose.model("pendingRequests", PendingRequestSchema);
const Consumer = mongoose.model("consumers", ConsumerSchema);

module.exports = { PendingRequest, Consumer };