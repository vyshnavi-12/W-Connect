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
const { findProviders } = require("../controllers/providerController");

router.get("/", findProviders);

module.exports = router;
