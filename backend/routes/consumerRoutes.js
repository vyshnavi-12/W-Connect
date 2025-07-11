const express = require('express');
const router = express.Router();
const { getConsumersForProvider } = require('../controllers/consumerController');

// Route to get consumers for a specific provider who need storage (with AI-enhanced product matching)
router.post('/provider/:providerId', getConsumersForProvider);

module.exports = router;