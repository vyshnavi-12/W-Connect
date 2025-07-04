const express = require("express");
const router = express.Router();
require("dotenv").config();
// Define the POST /register route
router.post("/register", async (req, res) => {
  const {
    shopName,
    location,
    email,
    secretCode,
    productDetails,
    needsStorage,
    connectedProvider,
  } = req.body;

  console.log("Received registration data:", req.body);

  try {
    // Check if consumer already exists
    const existing = await Consumer.findOne({ email, shopName });
    if (existing) {
      return res.status(400).json({ message: "Consumer already registered" });
    }

    // Hash the secretCode before saving
    const hashedCode = await bcrypt.hash(secretCode, 10);

    const newConsumer = new Consumer({
      shopName,
      location,
      email,
      secretCode: hashedCode,
      productDetails,
      needsStorage,
      connectedProvider,
    });

    await newConsumer.save();

    return res
      .status(201)
      .json({ message: "Consumer registered successfully" });
  } catch (err) {
    console.error("Registration error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
});
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Consumer = require("../models/Consumer"); // Adjust path as needed

const JWT_SECRET = process.env.JWT_SECRET;

// Consumer Login Route
router.post("/login", async (req, res) => {
  const { shopName, email, secretCode } = req.body;
  console.log("Login request received with:", req.body);

  try {
    const consumer = await Consumer.findOne({ email, shopName });
    if (!consumer) {
      console.log("Consumer not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(secretCode, consumer.secretCode);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: "consumer", consumerId: consumer._id, email: consumer.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful");
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err.message, err.stack);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
