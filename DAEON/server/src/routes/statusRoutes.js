// src/routes/statusRoutes.js

const express = require("express");
const router = express.Router();
const statusController = require("../controllers/statusController");

router.get("/server", statusController.checkServer);
router.get("/gemini", statusController.checkGemini);
router.get("/deepl", statusController.checkDeepl);

module.exports = router;
