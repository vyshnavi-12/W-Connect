const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const connectDB = require("./config/database");
const { protect } = require("./middleware/authMiddleware");
const { getConsumer } = require("./controllers/consumerAuthController");

const providerAuthRoutes = require("./routes/providerAuthRoutes");
const providerRoutes = require("./routes/providerRoutes");
const consumerAuthRoutes = require("./routes/consumerAuthRoutes");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Route configurations
app.use("/api/provider", providerAuthRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/consumer", consumerAuthRoutes);

// Add getConsumer endpoint directly
app.get("/api/consumer/me", protect, getConsumer);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));