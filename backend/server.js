const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const providerAuthRoutes = require("./routes/providerAuthRoutes");
const providerRoutes = require("./routes/providerRoutes");

dotenv.config();
const connectDB = require("./config/database");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/provider", providerAuthRoutes);
app.use("/api/providers", providerRoutes);
const consumerRoutes = require("./routes/consumer");
app.use("/api/consumers", consumerRoutes); // Makes /api/consumer/register work
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
