const Provider = require('../models/Provider');
const geocodeAddress = require('../utils/geocode');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerProvider = async (req, res) => {
  try {
    const { shopName, location, email, secretCode } = req.body;

    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const { latitude, longitude } = await geocodeAddress(location);

    const newProvider = new Provider({
      shopName,
      location,
      email,
      secretCode,
      latitude,
      longitude,
    });

    await newProvider.save();

    const token = generateToken(newProvider._id);

    res.status(201).json({
      message: 'Provider registered successfully',
      token,
      providerId: newProvider._id,
    });
  } catch (error) {
    console.error('Error registering provider:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginProvider = async (req, res) => {
  try {
    const { email, secretCode } = req.body;

    const provider = await Provider.findOne({ email });

    if (!provider || provider.secretCode !== secretCode) {
      return res.status(401).json({ message: 'Invalid email or secret code' });
    }

    const token = generateToken(provider._id);

    res.status(200).json({
      message: 'Provider logged in successfully',
      token,
      providerId: provider._id,
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { registerProvider, loginProvider };