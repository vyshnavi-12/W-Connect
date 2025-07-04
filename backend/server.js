const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/database");

const providerAuthRoutes = require("./routes/providerAuthRoutes");
const providerRoutes = require("./routes/providerRoutes");

const consumerAuthRoutes = require("./routes/consumerAuthRoutes");
// If you have consumer-specific data routes (not auth), import them here
// const consumerRoutes = require("./routes/consumerRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Route configurations
app.use("/api/provider", providerAuthRoutes);
app.use("/api/providers", providerRoutes);

app.use("/api/consumer", consumerAuthRoutes);
// app.use("/api/consumers", consumerRoutes); // Uncomment if applicable

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
