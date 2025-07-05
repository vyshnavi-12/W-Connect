const mongoose = require("mongoose");

// Schema for pending requests
const PendingRequestSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  email: { type: String, required: true },
  secretCode: { type: String, required: true, select: false },
  productDetails: [String],
  needsStorage: { type: Boolean, default: false },
  connectedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Schema for accepted consumers
const ConsumerSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    secretCode: { type: String, required: true, select: false },
    productDetails: [String],
    needsStorage: { type: Boolean, default: false },
    connectedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    status: { type: String, default: "accepted" },
    acceptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create geospatial indexes only on coordinates field
PendingRequestSchema.index({ coordinates: "2dsphere" });
ConsumerSchema.index({ coordinates: "2dsphere" });

// Create models
const PendingRequest = mongoose.model("PendingRequest", PendingRequestSchema);
const Consumer = mongoose.model("Consumer", ConsumerSchema);

module.exports = { PendingRequest, Consumer };
