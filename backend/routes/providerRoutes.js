const express = require("express");
const router = express.Router();
const { PendingRequest, Consumer } = require("../models/Consumer");
const { protect } = require("../middleware/authMiddleware");

// Get pending requests for a specific provider by provider ID
router.get("/pending-requests/:providerId", protect, async (req, res) => {
  const { providerId } = req.params;
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Not authorized as a provider" });
    }
    if (req.user.id !== providerId) {
      return res.status(403).json({ message: "Not authorized to view requests for this provider" });
    }

    console.log("Fetching requests for provider ID:", providerId);

    // Validate providerId
    if (!providerId || providerId === "undefined") {
      return res.status(400).json({ message: "Invalid provider ID" });
    }

    const requests = await PendingRequest.find({
      connectedProvider: providerId,
      status: "pending",
    }).lean();

    console.log("Found requests:", requests.length);
    res.json(requests);
  } catch (err) {
    console.error("Error fetching pending requests:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Accept a consumer request
router.post("/accept-request/:requestId", protect, async (req, res) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ message: "Not authorized as a provider" });
  }

  const { requestId } = req.params;

  try {
    console.log("Accepting request with ID:", requestId);

    // Fetch pending request with secretCode
    const pendingRequest = await PendingRequest.findById(requestId).select('+secretCode');
    if (!pendingRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    console.log("Pending request data:", {
      _id: pendingRequest._id,
      shopName: pendingRequest.shopName,
      location: pendingRequest.location,
      coordinates: pendingRequest.coordinates,
      latitude: pendingRequest.latitude,
      longitude: pendingRequest.longitude,
      email: pendingRequest.email,
      secretCode: !!pendingRequest.secretCode, // Log presence of secretCode
    });

    // Verify the provider is authorized for this request
    if (pendingRequest.connectedProvider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    // Strict validation of required fields
    if (
      !pendingRequest.location ||
      typeof pendingRequest.location !== "string" ||
      !pendingRequest.coordinates ||
      pendingRequest.coordinates.type !== "Point" ||
      !Array.isArray(pendingRequest.coordinates.coordinates) ||
      pendingRequest.coordinates.coordinates.length !== 2 ||
      typeof pendingRequest.latitude !== "number" ||
      typeof pendingRequest.longitude !== "number" ||
      !pendingRequest.secretCode
    ) {
      console.error("Invalid request data:", {
        location: pendingRequest.location,
        coordinates: pendingRequest.coordinates,
        latitude: pendingRequest.latitude,
        longitude: pendingRequest.longitude,
        secretCode: !!pendingRequest.secretCode,
      });
      return res.status(400).json({ 
        message: "Invalid request data",
        details: "Missing or invalid location, coordinates, or secret code"
      });
    }

    // Create new consumer with original location and coordinates from pending request
    const newConsumer = new Consumer({
      shopName: pendingRequest.shopName,
      location: pendingRequest.location, // Keep original user-entered location
      coordinates: {
        type: "Point",
        coordinates: [pendingRequest.longitude, pendingRequest.latitude], // [longitude, latitude]
      },
      latitude: pendingRequest.latitude,
      longitude: pendingRequest.longitude,
      email: pendingRequest.email,
      secretCode: pendingRequest.secretCode, // Include secretCode
      productDetails: pendingRequest.productDetails || [],
      needsStorage: pendingRequest.needsStorage || false,
      connectedProvider: pendingRequest.connectedProvider,
      status: "accepted",
      acceptedAt: new Date(),
    });

    console.log("New consumer data before save:", newConsumer.toObject());
    await newConsumer.save();
    await PendingRequest.findByIdAndDelete(requestId);

    res.status(200).json({
      message: "Request accepted successfully",
      consumer: {
        id: newConsumer._id,
        shopName: newConsumer.shopName,
      },
    });
  } catch (err) {
    console.error("Error accepting request:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Consumer with this email already exists",
        error: err.message,
      });
    }

    res.status(500).json({
      message: "Error accepting request",
      error: err.message,
    });
  }
});

// Reject a consumer request
router.patch("/pending-requests/reject/:id", protect, async (req, res) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ message: "Not authorized as a provider" });
  }

  try {
    console.log("Rejecting request with ID:", req.params.id);

    const pendingRequest = await PendingRequest.findById(req.params.id);
    if (!pendingRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Verify the provider is authorized for this request
    if (pendingRequest.connectedProvider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    const updated = await PendingRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Request rejected successfully",
      request: updated,
    });
  } catch (err) {
    console.error("Error rejecting request:", err);
    res.status(500).json({
      message: "Error rejecting request",
      error: err.message,
    });
  }
});

// Get connected consumers for a specific provider
router.get("/connected-consumers/:providerId", protect, async (req, res) => {
  const { providerId } = req.params;
  try {
    if (req.user.role !== "provider") {
      return res.status(403).json({ message: "Not authorized as a provider" });
    }
    if (req.user.id !== providerId) {
      return res.status(403).json({ message: "Not authorized to view consumers for this provider" });
    }

    // Validate providerId
    if (!providerId || providerId === "undefined") {
      return res.status(400).json({ message: "Invalid provider ID" });
    }

    const consumers = await Consumer.find({
      connectedProvider: providerId,
      status: "accepted",
    }).lean();

    res.json(consumers);
  } catch (err) {
    console.error("Error fetching connected consumers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Find providers functionality
const { findProviders } = require("../controllers/providerController");
router.get("/", findProviders);

module.exports = router;