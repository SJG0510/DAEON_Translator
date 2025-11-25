// src/api/translate.js
import { Platform } from "react-native";

/**
 * 플랫폼별 서버 주소
 * - Android 에뮬레이터: 10.0.2.2 (PC의 localhost)
 * - iOS 시뮬레이터 / Web: localhost
 * - 실제 기기에서 테스트할 때는 PC의 LAN IP로 직접 바꿔 써야 함
 */
function getBaseUrl() {
  if (Platform.OS === "android") {
    // Android 에뮬레이터에서 PC의 127.0.0.1을 가리키는 주소
    return "http://192.168.0.13:3000";
  }
  // iOS 시뮬레이터, Web 등
  return "http://192.168.0.13:3000";
}

/**
 * 클라이언트 → 서버로 번역 요청
 * engine: "libre" | "gemini" | "deepl"
 * params: { text, sourceLang, targetLang, tag? }
 */
export async function translateWithEngine(engine, params) {
  const { text, sourceLang = "auto", targetLang, tag = null } = params || {};

  if (!text) throw new Error("번역할 텍스트가 없습니다.");
  if (!targetLang) throw new Error("targetLang가 필요합니다.");
  if (text.length > 1000) throw new Error("텍스트 길이 초과 (1000자 제한)");

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/translate`;

  const payload = {
    engine: engine || "libre",
    text,
    sourceLang,
    targetLang,
    tag,
  };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    console.error("[translateWithEngine] network error:", networkError);
    throw new Error("서버에 연결할 수 없습니다. (네트워크 오류)");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      `서버 오류 (${res.status}) – ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`;
    throw new Error(msg);
  }

  if (!data || typeof data.result !== "string") {
    throw new Error("서버에서 번역 결과를 받지 못했습니다.");
  }

  return data.result;
}
