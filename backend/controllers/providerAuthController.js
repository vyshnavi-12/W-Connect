const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Provider = require("../models/Provider");
const { geocodeAddress } = require("../utils/geocode");

const JWT_SECRET = process.env.JWT_SECRET;

// Generate token with role
const generateToken = (id, role) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "30d" });
};

const registerProvider = async (req, res) => {
  try {
    const { shopName, location, email, secretCode } = req.body;

    // Validate required fields
    if (!shopName || !location || !email || !secretCode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if provider already exists
    const existingProvider = await Provider.findOne({ $or: [{ email }, { shopName }] });
    if (existingProvider) {
      const field = existingProvider.email === email ? "email" : "shop name";
      return res.status(400).json({ message: `Provider with this ${field} already exists` });
    }

    // Geocode location ONLY for coordinates - keep original location text
    let coordinates, latitude, longitude;
    try {
      const geoData = await geocodeAddress(location);
      if (!geoData.latitude || !geoData.longitude) {
        throw new Error("Geocoding returned incomplete data");
      }
      
      coordinates = geoData.coordinates;
      latitude = geoData.latitude;
      longitude = geoData.longitude;
      
    } catch (geoError) {
      console.error("Geocoding error:", geoError.message);
      return res.status(400).json({ 
        message: "Could not validate location",
        details: geoError.message 
      });
    }

    // Hash the secretCode
    const hashedCode = await bcrypt.hash(secretCode, 10);

    // Create new provider with original location text and geocoded coordinates
    const newProvider = new Provider({
      shopName,
      location: location, // Store original user-entered location
      coordinates: coordinates,
      latitude: latitude,
      longitude: longitude,
      email,
      secretCode: hashedCode
    });

    await newProvider.save();

    // Generate token
    const token = generateToken(newProvider._id, "provider");

    res.status(201).json({
      success: true,
      message: "Provider registered successfully",
      token,
      provider: {
        id: newProvider._id,
        shopName: newProvider.shopName,
        location: newProvider.location,
        email: newProvider.email
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate key error",
        error: error.message
      });
    }
    
    if (error.message === "JWT_SECRET is not defined in environment variables") {
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support.",
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};

const loginProvider = async (req, res) => {
  try {
    const { email, secretCode } = req.body;

    // Validate input
    if (!email || !secretCode) {
      return res.status(400).json({ 
        success: false,
        message: "Email and secret code are required" 
      });
    }

    // Find provider with secretCode
    const provider = await Provider.findOne({ email }).select('+secretCode');
    if (!provider) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(secretCode, provider.secretCode);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate token
    const token = generateToken(provider._id, "provider");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      provider: {
        id: provider._id,
        shopName: provider.shopName,
        location: provider.location,
        email: provider.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

module.exports = { registerProvider, loginProvider };