// src/controllers/statusController.js

require("dotenv").config();

// 서버 기본 상태 확인
exports.checkServer = (req, res) => {
  return res.json({
    ok: true,
    message: "서버 정상 작동 중",
  });
};

// Gemini API 상태 확인 — 실제 API 호출 없음 (쿼터 보호)
exports.checkGemini = (req, res) => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return res.json({
      ok: false,
      message: "Gemini API Key가 설정되어 있지 않습니다.",
    });
  }

  return res.json({
    ok: true,
    message: "Gemini API Key 정상",
  });
};

// DeepL API 상태 확인 — 실제 API 호출 없음
exports.checkDeepl = (req, res) => {
  const key = process.env.DEEPL_API_KEY;

  if (!key) {
    return res.json({
      ok: false,
      message: "DeepL API Key가 설정되어 있지 않습니다.",
    });
  }

  return res.json({
    ok: true,
    message: "DeepL API Key 정상",
  });
};
