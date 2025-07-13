const express = require("express");
const {
  registerConsumer,
  loginConsumer,
} = require("../controllers/consumerAuthController");
const { Consumer } = require("../models/Consumer");
const Provider = require("../models/Provider");
const ChatMessage = require("../models/ChatMessage");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const bcrypt = require("bcrypt"); // Assuming you use bcrypt for hashing

router.get("/connected-providers", protect, async (req, res) => {
  try {
    console.log("Decoded JWT user:", req.user);
    const consumerId = req.user.id;
    const consumer = await Consumer.findById(consumerId);
    if (!consumer) {
      console.log("Consumer not found for ID:", consumerId);
      return res.status(404).json({ message: "Consumer not found" });
    }
    console.log("Consumer found:", consumer);

    const providers = await Provider.find({ _id: consumer.connectedProvider });

    console.log("Providers found:", providers);

    const response = providers.map((provider) => ({
      id: provider._id,
      name: provider.shopName,
      location: provider.location,
      email: provider.email,
      avatar: provider.shopName[0]?.toUpperCase() || "P",
      category: "General",
      online: false,
    }));

    res.json(response);
  } catch (err) {
    console.error("Error in /connected-providers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const {
  getChatMessagesWithProvider,
} = require("../controllers/consumerChatController");

router.get("/chat-messages/:providerId", protect, getChatMessagesWithProvider);
// Consumer Registration Route
router.post("/register", registerConsumer);

// Consumer Login Route
router.post("/login", loginConsumer);

// GET chat messages with a provider
router.get("/chat-messages/:providerId", async (req, res) => {
  try {
    const consumerId = req.user.id; // always a string, matches frontend
    const providerId = req.params.providerId;
    const roomId = `${providerId}_${consumerId}`;
    
    const messages = await ChatMessage.find({ roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching consumer chat messages:", error);
    res.status(500).json({ message: "Failed to fetch chat messages" });
  }
});

module.exports = router;
