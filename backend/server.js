const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const consumerRoutes = require("./routes/consumerAuthRoutes");
const connectDB = require("./config/database");
const { protect } = require("./middleware/authMiddleware");
const { getConsumer } = require("./controllers/consumerAuthController");

const providerAuthRoutes = require("./routes/providerAuthRoutes");
const providerRoutes = require("./routes/providerRoutes");
const consumerAuthRoutes = require("./routes/consumerAuthRoutes");

connectDB();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const ChatMessage = require("./models/ChatMessage"); // See model below

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`🟢 Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, message }) => {
    console.log(`📤 Message received for room ${roomId}:`, message);

    try {
      await ChatMessage.create({
        roomId,
        sender: message.sender,
        content: message.content,
        time: message.time,
        status: message.status,
      });
      console.log("✅ Message saved to DB");
    } catch (err) {
      console.error("❌ Error saving message to DB:", err);
    }

    io.to(roomId).emit("receiveMessage", message);
    console.log("📡 Emitted message to room:", roomId);
  });

  socket.on("disconnect", () => {
    console.log("❎ User disconnected:", socket.id);
  });
});

app.use(express.json());

// Route configurations
app.use("/api/provider", providerAuthRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/consumer", consumerAuthRoutes);
app.use("/api/consumers", consumerAuthRoutes); // <-- add this line
// Add getConsumer endpoint directly
app.get("/api/consumer/me", protect, getConsumer);

server.listen(5000, () => {
  console.log("Socket.IO server is running on port 5000");
});
