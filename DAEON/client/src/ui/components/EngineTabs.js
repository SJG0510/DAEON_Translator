// src/ui/components/EngineTabs.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import { translateWithEngine } from "../../api/translate";
import { addHistory } from "../../db/sqlite/historyRepo";

function getSpeechLang(code) {
  if (!code) return undefined;
  const c = String(code).toLowerCase();

  if (c.startsWith("ko")) return "ko-KR";
  if (c.startsWith("en")) return "en-US";
  if (c.startsWith("ja")) return "ja-JP";
  if (c.startsWith("zh")) return "zh-CN";

  return undefined;
}

function EngineResultCard({ engineKey, title, text, fromLang, toLang }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");
  const [tag, setTag] = useState("");

  const onTranslate = async () => {
    if (!text) {
      Alert.alert("안내", "번역할 텍스트를 먼저 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      const translated = await translateWithEngine(engineKey, {
        text,
        sourceLang: fromLang,
        targetLang: toLang,
      });

      setResult(translated);

      // 🔹 히스토리 저장 시 태그까지 같이 저장
      await addHistory({
        Engine: title,
        fromLang,
        toLang,
        originalT: text,
        translationT: translated,
        Tag: tag || null,
        Favorites: 0,
      });
    } catch (e) {
      console.error("[EngineTabs] translate error:", e);

      // ❗ 사용자에게는 translate.js에서 정리해 준 한글 메시지만 보여주기
      Alert.alert("번역 실패", e.message || "번역 중 오류가 발생했습니다.");

      // 🔸 더 이상 결과 영역에 개발자용 에러 문자열을 넣지 않는다
      // 필요하면 아래처럼 짧은 안내만 넣을 수도 있음:
      // setResult("번역에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const onCopy = async () => {
    if (!result) {
      Alert.alert("안내", "복사할 번역 결과가 없습니다.");
      return;
    }

    await Clipboard.setStringAsync(result);
    Alert.alert("복사 완료", "번역 결과가 복사되었습니다.");
  };

  const speakResult = () => {
    if (!result) {
      Alert.alert("안내", "읽을 번역 결과가 없습니다.");
      return;
    }

    Speech.speak(result, { language: getSpeechLang(toLang) });
  };

  return (
    <View style={styles.card}>
      {/* 상단: 제목 + 버튼들 */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>

        <View style={styles.cardHeaderButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, isLoading && { opacity: 0.6 }]}
            onPress={onTranslate}
            disabled={isLoading}
          >
            <Text style={styles.actionBtnText}>
              {isLoading ? "번역중..." : "번역하기"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.subBtn} onPress={onCopy}>
            <Text style={styles.subBtnText}>복사</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.subBtn} onPress={speakResult}>
            <Text style={styles.subBtnText}>번역 듣기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🔹 태그 입력 영역 (번역 전에 입력) */}
      <View style={styles.tagRow}>
        <Text style={styles.tagLabel}>태그</Text>
        <TextInput
          style={styles.tagInput}
          placeholder="예: 일상, 과제, 업무, 게임..."
          value={tag}
          onChangeText={setTag}
        />
      </View>

      {/* 번역 결과 (스크롤뷰) */}
      <View style={styles.resultContainer}>
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultContent}
          nestedScrollEnabled
        >
          <Text style={styles.resultText}>
            {result || "이 엔진의 번역 결과가 여기에 표시됩니다."}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

export default function EngineTabs({ text, fromLang, toLang }) {
  const [activeEngine, setActiveEngine] = useState("gemini");

  return (
    <View style={styles.wrap}>
      {/* 위쪽: 선택된 엔진 카드 */}
      <View style={styles.engineContent}>
        {activeEngine === "gemini" ? (
          <EngineResultCard
            engineKey="gemini"
            title="Gemini"
            text={text}
            fromLang={fromLang}
            toLang={toLang}
          />
        ) : (
          <EngineResultCard
            engineKey="deepl"
            title="DeepL"
            text={text}
            fromLang={fromLang}
            toLang={toLang}
          />
        )}
      </View>

      {/* 아래쪽: 엔진 선택 탭 (소프트키와 안 겹치게 띄움) */}
      <View className="footerTabs" style={styles.footerTabs}>
        <TouchableOpacity
          style={[
            styles.footerTabBtn,
            activeEngine === "gemini" && styles.footerTabActive,
          ]}
          onPress={() => setActiveEngine("gemini")}
        >
          <Text
            style={[
              styles.footerTabText,
              activeEngine === "gemini" && styles.footerTabTextActive,
            ]}
          >
            Gemini
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.footerTabBtn,
            activeEngine === "deepl" && styles.footerTabActive,
          ]}
          onPress={() => setActiveEngine("deepl")}
        >
          <Text
            style={[
              styles.footerTabText,
              activeEngine === "deepl" && styles.footerTabTextActive,
            ]}
          >
            DeepL
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 24, // 안드로이드 소프트키와 겹치지 않도록 여유
  },

  engineContent: {
    flex: 1,
  },

  footerTabs: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    padding: 6,
    marginTop: 8,
    marginBottom: 12,
  },

  footerTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  footerTabActive: {
    backgroundColor: "white",
  },

  footerTabText: {
    fontSize: 14,
    color: "#4b5563",
  },

  footerTabTextActive: {
    color: "#111827",
    fontWeight: "700",
  },

  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  cardHeaderButtons: {
    flexDirection: "row",
    gap: 6,
  },

  actionBtn: {
    backgroundColor: "#4a6cf7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  actionBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },

  subBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  subBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  // 🔹 태그 입력 스타일
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 2,
    gap: 6,
  },
  tagLabel: {
    fontSize: 12,
    color: "#4b5563",
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
  },

  resultContainer: {
    flex: 1,
    maxHeight: 260,
    marginTop: 4,
  },

  resultScroll: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },

  resultContent: {
    padding: 10,
  },

  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
