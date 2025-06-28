const express = require('express');
const router = express.Router();
const consumerAuthController = require('../controllers/consumerAuthController');

// Consumer Registration
router.post('/register', consumerAuthController.register);

// Consumer Login
router.post('/login', consumerAuthController.login);

module.exports = router;
