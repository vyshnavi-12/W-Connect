const express = require("express");
const { registerConsumer, loginConsumer } = require("../controllers/consumerAuthController");

const router = express.Router();

// Consumer Registration Route
router.post("/register", registerConsumer);

// Consumer Login Route
router.post("/login", loginConsumer);

module.exports = router;