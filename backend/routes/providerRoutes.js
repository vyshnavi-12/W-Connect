const express = require("express");
const router = express.Router();
const { PendingRequest, Consumer } = require("../models/Consumer");
const mongoose = require("mongoose");

// Get pending requests for a specific provider
router.get("/pending-requests/:providerName", async (req, res) => {
  const { providerName } = req.params;
  try {
    const requests = await PendingRequest.find({
      connectedProvider: { $regex: new RegExp(`^${providerName}`, "i") },
      status: 'pending' // Only fetch pending requests
    });

    res.json(requests);
  } catch (err) {
    console.error("Error fetching pending requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept a consumer request
router.post("/accept-request/:requestId", async (req, res) => {
  const { requestId } = req.params;
  
  try {
    // Find the pending request
    const pendingRequest = await PendingRequest.findById(requestId);
    if (!pendingRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Create new consumer with accepted status
    const newConsumer = new Consumer({
      shopName: pendingRequest.shopName,
      location: pendingRequest.location,
      email: pendingRequest.email,
      secretCode: pendingRequest.secretCode,
      productDetails: pendingRequest.productDetails,
      needsStorage: pendingRequest.needsStorage,
      connectedProvider: pendingRequest.connectedProvider,
      status: 'accepted'
    });

    // Save to consumers collection
    await newConsumer.save();

    // Remove from pending requests
    await PendingRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Request accepted successfully" });
  } catch (err) {
    console.error("Error accepting request:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a consumer request
router.patch("/pending-requests/reject/:id", async (req, res) => {
  try {
    const updated = await PendingRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    res.json({ message: "Request rejected successfully" });
  } catch (err) {
    console.error("Error rejecting request:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Find providers functionality
const { findProviders } = require("../controllers/providerController");
router.get("/", findProviders);

module.exports = router;