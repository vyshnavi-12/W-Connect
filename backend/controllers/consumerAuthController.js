const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PendingRequest, Consumer } = require("../models/Consumer");
const Provider = require("../models/Provider");
const geocodeAddress = require("../utils/geocode");

const JWT_SECRET = process.env.JWT_SECRET;

// Generate token with role (reused from providerAuthController.js for consistency)
const generateToken = (id, role) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "30d" });
};

// Register Consumer
const registerConsumer = async (req, res) => {
  try {
    const {
      shopName,
      location,
      email,
      secretCode,
      productDetails,
      needsStorage,
      connectedProvider
    } = req.body;

    console.log("Received registration data:", req.body);

    // Validate required fields
    if (!shopName || !location || !email || !secretCode || !productDetails || !productDetails.length || !connectedProvider) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, including at least one product and a provider"
      });
    }

    // Check if consumer already exists in pending requests or accepted consumers
    const existingPending = await PendingRequest.findOne({ email });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "Consumer with this email already has a pending registration"
      });
    }

    const existingConsumer = await Consumer.findOne({ email });
    if (existingConsumer) {
      return res.status(400).json({
        success: false,
        message: "Consumer with this email is already registered and accepted"
      });
    }

    // Validate provider exists
    const provider = await Provider.findById(connectedProvider);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Selected provider not found"
      });
    }

    // Geocode consumer location
    let geoData;
    try {
      geoData = await geocodeAddress(location);
      if (!geoData.latitude || !geoData.longitude) {
        throw new Error("Invalid coordinates from geocoding");
      }
    } catch (geoError) {
      console.error("Geocoding error:", geoError.message);
      return res.status(400).json({
        success: false,
        message: "Could not validate location",
        details: geoError.message
      });
    }

    // Hash the secretCode
    const hashedCode = await bcrypt.hash(secretCode, 10);

    // Create new pending request
    const newPendingRequest = new PendingRequest({
      shopName,
      location: geoData.location,
      coordinates: geoData.coordinates,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      email,
      secretCode: hashedCode,
      productDetails,
      needsStorage,
      connectedProvider: provider._id,
      status: "pending"
    });

    await newPendingRequest.save();

    return res.status(201).json({
      success: true,
      message: "Consumer registration request submitted successfully"
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate key error",
        error: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: "Consumer registration failed",
      error: error.message
    });
  }
};

// Login Consumer
const loginConsumer = async (req, res) => {
  try {
    const { email, secretCode } = req.body;
    console.log("Login request received with:", { email, secretCode });

    // Validate input
    if (!email || !secretCode) {
      return res.status(400).json({
        success: false,
        message: "Email and secret code are required"
      });
    }

    // Check if consumer is already accepted
    const acceptedConsumer = await Consumer.findOne({ email }).select("+secretCode");
    if (acceptedConsumer) {
      const isMatch = await bcrypt.compare(secretCode, acceptedConsumer.secretCode);
      if (!isMatch) {
        console.log("Password mismatch for accepted consumer");
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      // Generate token for accepted consumer
      const token = generateToken(acceptedConsumer._id, "consumer");

      console.log("Login successful for accepted consumer");
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        status: "accepted",
        consumer: {
          id: acceptedConsumer._id,
          shopName: acceptedConsumer.shopName,
          location: acceptedConsumer.location,
          email: acceptedConsumer.email
        }
      });
    }

    // Check pending requests
    const pendingRequest = await PendingRequest.findOne({ email }).select("+secretCode");
    if (pendingRequest) {
      const isMatch = await bcrypt.compare(secretCode, pendingRequest.secretCode);
      if (!isMatch) {
        console.log("Password mismatch for pending request");
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Request status",
        status: pendingRequest.status,
        details:
          pendingRequest.status === "pending"
            ? "The provider has not yet accepted your request. Please wait for approval."
            : "Your request has been rejected by the provider. Please try registering with a different provider."
      });
    }

    console.log("Consumer not found in any collection");
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

// Get logged-in consumer's data
const getConsumer = async (req, res) => {
  try {
    if (req.user.role !== "consumer") {
      return res.status(403).json({ message: "Not authorized as a consumer" });
    }
    const consumer = await Consumer.findById(req.user.id).lean();
    if (!consumer) {
      return res.status(404).json({ message: "Consumer not found" });
    }
    res.json(consumer);
  } catch (err) {
    console.error("Error fetching consumer data:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { registerConsumer, loginConsumer, getConsumer };