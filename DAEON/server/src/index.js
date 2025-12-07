// src/index.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const translateRoutes = require("./routes/translateRoutes");
const statusRoutes = require("./routes/statusRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: "*", // 개발 동안은 전체 허용
  })
);

// 헬스 체크
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "DAEON Translation API is running.",
  });
});

// 주요 라우트
app.use("/api/translate", translateRoutes);
app.use("/api/status", statusRoutes);

app.listen(PORT, () => {
  console.log(`🚀 DAEON server listening on port ${PORT}`);
});

module.exports = app;
