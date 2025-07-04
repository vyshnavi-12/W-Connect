const express = require("express");
const router = express.Router();
const Consumer = require("../models/Consumer");
router.get("/pending-requests/:providerName", async (req, res) => {
  const { providerName } = req.params;
  try {
    const requests = await Consumer.find({
      connectedProvider: { $regex: new RegExp(`^${providerName}`, "i") },
    });

    res.json(requests);
  } catch (err) {
    console.error("Error fetching pending requests:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/accept-request/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const mongoose = require("mongoose");
  try {
    const pendingRequest = await mongoose.connection
      .collection("pendingrequests")
      .findOne({ _id: new mongoose.Types.ObjectId(requestId) });
    if (!pendingRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    await mongoose.connection.collection("consumers").insertOne(pendingRequest);
    await mongoose.connection
      .collection("pendingrequests")
      .deleteOne({ _id: new mongoose.Types.ObjectId(requestId) });
    res.status(200).json({ message: "Request accepted successfully" });
  } catch (err) {
    console.error("Error accepting request:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.patch("/pending-requests/reject/:id", async (req, res) => {
  try {
    const updated = await Consumer.findByIdAndUpdate(
      req.params.id,
      { connectedProvider: "None" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json({ message: "Request rejected and unassigned" });
  } catch (err) {
    console.error("Error rejecting request:", err);
    res.status(500).json({ message: "Server error" });
  }
});
const { findProviders } = require("../controllers/providerController");

router.get("/", findProviders);

module.exports = router;
