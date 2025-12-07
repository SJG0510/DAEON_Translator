// src/services/translateService.js

require("dotenv").config();

/* ------------------- Gemini ------------------- */

async function callGemini({ text, targetLang }) {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error("Gemini API Key가 설정되지 않았습니다.");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  const prompt = `Translate to ${targetLang}. Only return the translation:\n${text}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 429) {
    throw new Error("Gemini 429: 무료 호출 한도를 초과했습니다. 잠시 후 다시 시도하세요.");
  }

  if (!res.ok) {
    throw new Error(`Gemini 오류: ${JSON.stringify(data)}`);
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/* ------------------- DeepL ------------------- */

async function callDeepL({ text, targetLang, sourceLang }) {
  const API_KEY = process.env.DEEPL_API_KEY;
  if (!API_KEY) {
    throw new Error("DeepL API Key가 설정되지 않았습니다.");
  }

  const endpoint = API_KEY.includes(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const params = new URLSearchParams();
  params.append("text", text);
  params.append("target_lang", targetLang.toUpperCase());

  if (sourceLang && sourceLang !== "auto") {
    params.append("source_lang", sourceLang.toUpperCase());
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`DeepL 오류: ${JSON.stringify(data)}`);
  }

  return data?.translations?.[0]?.text || "";
}

/* ------------------- Dispatcher ------------------- */

exports.translateWithEngine = async (engine, params) => {
  const { text, sourceLang = "auto", targetLang } = params;

  if (!text) throw new Error("번역할 내용(text)이 비어 있습니다.");
  if (!targetLang) throw new Error("targetLang가 필요합니다.");
  if (text.length > 2000) throw new Error("텍스트 길이 초과 (2000자 제한)");

  if (engine === "deepl") return callDeepL({ text, sourceLang, targetLang });
  if (engine === "gemini") return callGemini({ text, targetLang });

  throw new Error("지원하지 않는 엔진입니다.");
};
