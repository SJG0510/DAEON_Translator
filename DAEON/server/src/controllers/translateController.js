// src/controllers/translateController.js
const { translateWithEngine } = require("../services/translateService");

exports.translateHandler = async (req, res) => {
  try {
    const { engine, text, sourceLang, targetLang, tag } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({
        error: "번역할 문장과 대상 언어는 필수입니다.",
      });
    }

    // 기본 엔진: gemini
    const normalizedEngine = (engine || "gemini").toLowerCase();

    const result = await translateWithEngine(normalizedEngine, {
      text,
      sourceLang: sourceLang || "auto",
      targetLang,
      tag: tag || null,
    });

    // ✅ 성공 케이스: 기존 클라 코드와 맞추기 위해 그대로 result만 내려줌
    return res.json({ result });
  } catch (err) {
    console.error("[translateHandler] error:", err);

    const raw = err?.message || String(err || "");
    let userMessage = "번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    // 🔹 Gemini 무료 쿼터 초과 (429 / RESOURCE_EXHAUSTED / Quota exceeded)
    if (
      raw.includes("429") ||
      raw.includes("Quota exceeded") ||
      raw.includes("RESOURCE_EXHAUSTED")
    ) {
      userMessage =
        "Gemini 무료 호출 한도를 초과했습니다. 잠시 후 다시 시도하거나, 내일 다시 시도해주세요.";
    }
    // 🔹 503 / 과부하 느낌
    else if (raw.includes("503") || raw.includes("UNAVAILABLE")) {
      userMessage =
        "번역 서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.";
    }
    // 🔹 400 계열
    else if (raw.includes("400")) {
      userMessage =
        "요청 형식이 올바르지 않습니다. 번역할 문장과 언어 설정을 다시 확인해주세요.";
    }
    // 🔹 딥엘 키 문제 등
    else if (raw.includes("DeepL API Key") || raw.includes("DEEPL")) {
      userMessage =
        "DeepL API Key 설정에 문제가 있습니다. 서버 설정을 다시 확인해주세요.";
    }

    // ⚠ 여기서 더 이상 raw 전체를 내려주지 않고, 사용자용 한 줄만 내려보냄
    return res.status(500).json({
      error: userMessage,
      // 필요하면 개발자 디버깅용으로만 보고 싶을 때:
      // debug: raw,
    });
  }
};
