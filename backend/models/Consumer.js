const mongoose = require("mongoose");

const ConsumerSchema = new mongoose.Schema({
  shopName: String,
  location: String,
  email: String,
  secretCode: String, // will be hashed
  productDetails: [String],
  needsStorage: Boolean,
  connectedProvider: { type: String, required: true },
});

module.exports = mongoose.model("pendingRequests", ConsumerSchema);
