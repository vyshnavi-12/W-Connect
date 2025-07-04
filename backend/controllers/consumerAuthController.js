const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PendingRequest, Consumer } = require("../models/Consumer");

const JWT_SECRET = process.env.JWT_SECRET;

// Register Consumer
const registerConsumer = async (req, res) => {
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
    // Check if consumer already exists in pending requests
    const existingPending = await PendingRequest.findOne({ email, shopName });
    if (existingPending) {
      return res.status(400).json({ message: "Consumer registration already exists" });
    }

    // Check if consumer already exists in accepted consumers
    const existingConsumer = await Consumer.findOne({ email, shopName });
    if (existingConsumer) {
      return res.status(400).json({ message: "Consumer already registered and accepted" });
    }

    // Hash the secretCode before saving
    const hashedCode = await bcrypt.hash(secretCode, 10);

    const newPendingRequest = new PendingRequest({
      shopName,
      location,
      email,
      secretCode: hashedCode,
      productDetails,
      needsStorage,
      connectedProvider,
      status: 'pending' // Default status is pending
    });

    await newPendingRequest.save();

    return res
      .status(201)
      .json({ message: "Consumer registration request submitted successfully" });
  } catch (err) {
    console.error("Registration error:", err.message);
    return res
      .status(500)
      .json({ message: "Server error during registration" });
  }
};

// Login Consumer
const loginConsumer = async (req, res) => {
  const { shopName, email, secretCode } = req.body;
  console.log("Login request received with:", req.body);

  try {
    // First check if consumer is already accepted
    const acceptedConsumer = await Consumer.findOne({ email, shopName });
    if (acceptedConsumer) {
      const isMatch = await bcrypt.compare(secretCode, acceptedConsumer.secretCode);
      if (!isMatch) {
        console.log("Password mismatch for accepted consumer");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token for accepted consumer
      const token = jwt.sign(
        { role: "consumer", consumerId: acceptedConsumer._id, email: acceptedConsumer.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      console.log("Login successful for accepted consumer");
      return res.json({ 
        message: "Login successful", 
        token,
        status: "accepted"
      });
    }

    // If not in accepted consumers, check pending requests
    const pendingRequest = await PendingRequest.findOne({ email, shopName });
    if (!pendingRequest) {
      console.log("Consumer not found in any collection");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password for pending request
    const isMatch = await bcrypt.compare(secretCode, pendingRequest.secretCode);
    if (!isMatch) {
      console.log("Password mismatch for pending request");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check status and respond accordingly
    if (pendingRequest.status === 'pending') {
      return res.status(200).json({ 
        message: "Request still pending", 
        status: "pending",
        details: "The provider still didn't accept your request. Please wait for approval."
      });
    } else if (pendingRequest.status === 'rejected') {
      return res.status(200).json({ 
        message: "Request rejected", 
        status: "rejected",
        details: "Your request has been rejected by the provider. Please try registering with a different provider."
      });
    }

    // This shouldn't happen, but just in case
    return res.status(400).json({ message: "Invalid request status" });

  } catch (err) {
    console.error("Login error:", err.message, err.stack);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { registerConsumer, loginConsumer };