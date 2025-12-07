// src/api/translate.js
import { Platform } from "react-native";

/**
 * 플랫폼별 서버 주소
 * - 실제 기기에서 테스트할 때는 PC의 LAN IP로 직접 바꿔 써야 함
 */
function getBaseUrl() {
  if (Platform.OS === "android") {
    return "http://server_ip:3000"; // server가 열려있는 ip
  }
  // iOS 시뮬레이터, Web 등
  return "http://server_ip:3000"; // server가 열려있는 ip
}

/**
 * 클라이언트 → 서버로 번역 요청
 * engine: "gemini" | "deepl"
 * params: { text, sourceLang, targetLang, tag? }
 */
export async function translateWithEngine(engine, params) {
  const { text, sourceLang = "auto", targetLang, tag = null } = params || {};

  if (!text) throw new Error("번역할 텍스트가 없습니다.");
  if (!targetLang) throw new Error("대상 언어를 선택해주세요.");
  if (text.length > 1000) throw new Error("텍스트 길이 초과 (1000자 제한)");

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/translate`;

  const payload = {
    engine: (engine || "gemini").toLowerCase(), // 기본 엔진: gemini
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

  // 🔹 서버에서 ok:false + message 형태로 내려보내는 경우 우선 처리
  if (data && data.ok === false) {
    const msg =
      data.message ||
      "번역 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    // 개발자용 상세 내용은 콘솔로만
    if (data.debug) {
      console.log("[translateWithEngine] debug:", data.debug);
    }
    throw new Error(msg);
  }

  // 🔹 HTTP 상태 코드별로 사용자 친화적인 메시지 매핑
  if (!res.ok) {
    let userMessage = "번역 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    switch (res.status) {
      case 400:
        userMessage =
          "요청 형식이 올바르지 않습니다. 번역할 문장과 언어 설정을 다시 확인해주세요. (400)";
        break;
      case 404:
        userMessage =
          "번역 서버 주소를 찾을 수 없습니다. 서버가 켜져 있는지 또는 앱 설정의 서버 주소가 올바른지 확인해주세요. (404)";
        break;
      case 429:
        userMessage =
          "번역 요청이 너무 자주 발생했습니다. 잠시 기다린 후 다시 시도해주세요. (429: 호출 한도 초과)";
        break;
      case 503:
        userMessage =
          "번역 서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요. (503)";
        break;
      default:
        userMessage =
          "번역 중 알 수 없는 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        break;
    }

    // 서버에서 내려준 상세 에러는 콘솔에만 남김
    const serverDetail =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : JSON.stringify(data));
    console.error(
      `[translateWithEngine] server error ${res.status}:`,
      serverDetail
    );

    throw new Error(userMessage);
  }

  // 🔹 응답은 성공인데 result가 이상한 경우
  if (!data || typeof data.result !== "string") {
    console.error("[translateWithEngine] invalid response:", data);
    throw new Error(
      "서버에서 올바른 번역 결과를 받지 못했습니다. 잠시 후 다시 시도해주세요."
    );
  }

  // 🔹 정상 케이스
  return data.result;
}
