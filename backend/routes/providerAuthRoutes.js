const express = require('express');
const { registerProvider, loginProvider } = require('../controllers/providerAuthController');

const router = express.Router();

router.post('/register', registerProvider);
router.post('/login', loginProvider);

module.exports = router;