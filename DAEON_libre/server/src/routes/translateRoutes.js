// src/routes/translateRoutes.js
const express = require("express");
const router = express.Router();
const { translateHandler } = require("../controllers/translateController");

// POST /api/translate
router.post("/", translateHandler);

module.exports = router;
