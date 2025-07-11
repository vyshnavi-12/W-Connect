// controllers/providerChatController.js
const ChatMessage = require("../models/ChatMessage");

exports.getChatMessagesWithConsumer = async (req, res) => {
  const providerId = req.user.id; // use .id, not ._id
  const consumerId = req.params.consumerId;
  const roomId = `${providerId}_${consumerId}`;

  try {
    const messages = await ChatMessage.find({ roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch chat messages." });
  }
};
