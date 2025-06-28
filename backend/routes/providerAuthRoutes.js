const express = require('express');
const router = express.Router();
const providerAuthController = require('../controllers/providerAuthController');

// Provider Register
router.post('/register', providerAuthController.register);

// Provider Login
router.post('/login', providerAuthController.login);

module.exports = router;
