// src/services/translateService.js

const LIBRE_ENDPOINT =
  process.env.LIBRE_ENDPOINT || "https://libretranslate.com/translate";
const LIBRE_API_KEY = process.env.LIBRE_API_KEY || "";
const DEEPL_API_KEY = process.env.DEEPL_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Node 18+ 에서는 fetch가 global로 있음 (Node 22라서 OK)

/* ───────────── Libre ───────────── */

function sanitizeLibreEndpoint(raw) {
  if (!raw) return "https://libretranslate.com/translate";
  try {
    const u = new URL(raw);
    if (!u.pathname || u.pathname === "/" || !u.pathname.endsWith("/translate")) {
      u.pathname = (u.pathname?.replace(/\/+$/, "") || "") + "/translate";
    }
    return u.toString();
  } catch {
    return "https://libretranslate.com/translate";
  }
}

async function callLibre({ text, sourceLang, targetLang }) {
  const endpoint = sanitizeLibreEndpoint(LIBRE_ENDPOINT);

  const headers = {
    "Content-Type": "application/json",
  };
  if (LIBRE_API_KEY) {
    headers["Authorization"] = `Bearer ${LIBRE_API_KEY}`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      q: text,
      source: sourceLang || "auto",
      target: targetLang,
      format: "text",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LibreTranslate ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.translatedText ?? data?.translated_text ?? "";
}

/* ───────────── DeepL ───────────── */

const DEEPL_MAP = {
  ko: "KO",
  en: "EN",
  ja: "JA",
  zh: "ZH",
  de: "DE",
  fr: "FR",
  es: "ES",
};

function mapDeepLLang(code, { target = false } = {}) {
  if (!code) return null;
  const c = String(code).toLowerCase();
  if (target && (c === "en" || c === "en-us" || c === "en-gb")) return "EN-US";
  return DEEPL_MAP[c] || c.toUpperCase();
}

async function callDeepL({ text, sourceLang, targetLang }) {
  if (!DEEPL_API_KEY) {
    throw new Error("DeepL: 서버에 DEEPL_API_KEY가 설정되어 있지 않습니다.");
  }

  const endpoint = DEEPL_API_KEY.includes(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const formBody = [
    ["text", text],
    ["target_lang", mapDeepLLang(targetLang, { target: true })],
    ...(sourceLang && sourceLang !== "auto"
      ? [["source_lang", mapDeepLLang(sourceLang)]]
      : []),
  ]
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
    },
    body: formBody,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`DeepL ${res.status}: ${JSON.stringify(data)}`);
  }

  const out = data?.translations?.[0]?.text;
  if (!out) throw new Error("DeepL 결과가 비어 있습니다.");
  return out;
}

/* ───────────── Gemini ───────────── */

async function callGemini({ text, targetLang }) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini: 서버에 GEMINI_API_KEY가 설정되어 있지 않습니다.");
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = `Translate the following text to ${targetLang}. Only return the translation.\n---\n${text}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${JSON.stringify(data)}`);
  }

  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out) throw new Error("Gemini 결과가 비어 있습니다.");
  return out;
}

/* ───────────── Dispatcher ───────────── */

exports.translateWithEngine = async function translateWithEngine(engine, params) {
  const { text, sourceLang = "auto", targetLang } = params || {};

  if (!text) throw new Error("번역할 text가 없습니다.");
  if (!targetLang) throw new Error("targetLang가 필요합니다.");
  if (text.length > 2000) throw new Error("텍스트 길이 초과 (2000자 제한)");

  if (engine === "deepl") {
    return callDeepL({ text, sourceLang, targetLang });
  }
  if (engine === "gemini") {
    return callGemini({ text, targetLang });
  }

  // 기본: Libre
  return callLibre({ text, sourceLang, targetLang });
};
