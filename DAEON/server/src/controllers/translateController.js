// src/controllers/translateController.js
const { translateWithEngine } = require("../services/translateService");

exports.translateHandler = async (req, res) => {
  try {
    const { engine, text, sourceLang, targetLang, tag } = req.body;

    if (!text || !targetLang) {
      return res
        .status(400)
        .json({ error: "text와 targetLang는 필수입니다." });
    }

    // 🔁 기본 엔진을 libre → gemini 로 변경
    const normalizedEngine = (engine || "gemini").toLowerCase();

    const result = await translateWithEngine(normalizedEngine, {
      text,
      sourceLang: sourceLang || "auto",
      targetLang,
      tag: tag || null,
    });

    res.json({ result });
  } catch (err) {
    console.error("[translateHandler] error:", err);
    res
      .status(500)
      .json({ error: err.message || "서버 내부 오류가 발생했습니다." });
  }
};
