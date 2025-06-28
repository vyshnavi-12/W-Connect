const express = require('express');
const { findProviders } = require('../controllers/providerController');

const router = express.Router();

router.get('/', findProviders);

module.exports = router;