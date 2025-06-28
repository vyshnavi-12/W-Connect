// backend/models/Consumer.js
const mongoose = require('mongoose');

const ConsumerSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  secretCode: {
    type: String,
    required: true,
  },
  productDetails: [
    {
      type: String,
      required: true,
    }
  ],
  selectedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  needsStorage: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false, // Consumer needs to wait for provider's approval
  }
}, { timestamps: true });

module.exports = mongoose.model('Consumer', ConsumerSchema);
