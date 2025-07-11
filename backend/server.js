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
const { GeminiService } = require("./utils/geminiService");

const providerAuthRoutes = require("./routes/providerAuthRoutes");
const providerRoutes = require("./routes/providerRoutes");
const consumerAuthRoutes = require("./routes/consumerAuthRoutes");
const consumerRoutes = require("./routes/consumerRoutes");

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

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Test Gemini connection on startup
const testGeminiConnection = async () => {
  try {
    console.log("Testing Gemini AI connection...");
    const isConnected = await GeminiService.testConnection();
    if (isConnected) {
      console.log("✓ Gemini AI service connected successfully");
    } else {
      console.log("⚠ Gemini AI service test failed - using fallback matching");
    }
  } catch (error) {
    console.error("✗ Gemini AI service error:", error.message);
    console.log("Using traditional matching as fallback");
  }
};

// Route configurations
app.use("/api/provider", providerAuthRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/consumer", consumerAuthRoutes);
app.use("/api/consumers", consumerAuthRoutes); // <-- add this line
app.use("/api/consumers", consumerRoutes);

// Add getConsumer endpoint directly
app.get("/api/consumer/me", protect, getConsumer);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      gemini: "available",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

server.listen(5000, () => {
  console.log("Socket.IO server is running on port 5000");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testGeminiConnection();
});
