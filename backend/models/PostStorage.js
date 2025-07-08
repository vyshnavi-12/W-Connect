const mongoose = require('mongoose');

const PostStorageSchema = new mongoose.Schema({
  providerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Provider', 
    required: true 
  },
  storageImage: {
    type: String, // Base64 encoded image or file path
    required: true
  },
  productTypes: {
    type: String,
    required: true,
    trim: true
  },
  priceOffering: {
    type: String,
    required: true,
    trim: true
  },
  storageCapacity: {
    type: String,
    trim: true
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableTo: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationsSent: [{
    consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer' },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' }
  }],
  interestedConsumers: [{
    consumerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consumer' },
    expressedInterestAt: { type: Date, default: Date.now },
    message: String
  }]
}, { 
  timestamps: true 
});

// Index for better query performance
PostStorageSchema.index({ providerId: 1, isActive: 1 });
PostStorageSchema.index({ createdAt: -1 });

const PostStorage = mongoose.model('PostStorage', PostStorageSchema);

module.exports = PostStorage;