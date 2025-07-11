// controllers/consumerChatController.js
const ChatMessage = require("../models/ChatMessage");

exports.getChatMessagesWithProvider = async (req, res) => {
  const consumerId = req.user._id; // user from JWT
  const providerId = req.params.providerId;
  const roomId = `${providerId}_${consumerId}`;

  try {
    const messages = await ChatMessage.find({ roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch chat messages." });
  }
};
