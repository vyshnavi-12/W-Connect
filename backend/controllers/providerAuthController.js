const Provider = require('../models/Provider');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Register a new provider
exports.register = async (req, res) => {
  const { shopName, location, email, secretCode } = req.body;

  try {
    const existingProvider = await Provider.findOne({ email });
    if (existingProvider) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedSecretCode = await bcrypt.hash(secretCode, 10);

    const newProvider = new Provider({
      shopName,
      location,
      email,
      secretCode: hashedSecretCode,
    });

    await newProvider.save();

    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a provider
exports.login = async (req, res) => {
  const { email, secretCode } = req.body;

  try {
    const provider = await Provider.findOne({ email });
    if (!provider) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(secretCode, provider.secretCode);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: provider._id,
        email: provider.email,
        shopName: provider.shopName,
        role: 'provider',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
