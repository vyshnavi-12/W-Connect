const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // Use `${providerId}_${consumerId}`
  sender: { type: String, required: true }, // 'provider' or 'consumer'
  content: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: "sent" },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
