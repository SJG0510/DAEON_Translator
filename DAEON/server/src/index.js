// src/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const translateRoutes = require("./routes/translateRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// JSON 요청 파싱
app.use(express.json());

// CORS 허용 (필요하면 나중에 origin 제한)
app.use(
  cors({
    origin: "*",
  })
);

// 헬스 체크
app.get("/", (req, res) => {
  res.send("DAEON Translation API is running.");
});

// /api/translate 라우트
app.use("/api/translate", translateRoutes);

app.listen(PORT, () => {
  console.log(`🚀 DA EON server listening on port ${PORT}`);
});
