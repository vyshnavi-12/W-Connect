const mongoose = require("mongoose");

const ConsumerSchema = new mongoose.Schema({
  shopName: String,
  location: String,
  email: String,
  secretCode: String, // will be hashed
  productDetails: [String],
  needsStorage: Boolean,
  connectedProvider: String,
});

module.exports = mongoose.model("Consumer", ConsumerSchema);
