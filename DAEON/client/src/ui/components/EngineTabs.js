// src/ui/components/EngineTabs.js
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { translateWithEngine } from "../../api/translate";
import { addHistory } from "../../db/sqlite/historyRepo";

function ResultCard({ title, fromLang, toLang, text }) {
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

      const translated = await translateWithEngine(title.toLowerCase(), {
        text,
        sourceLang: fromLang,
        targetLang: toLang,
      });

      setResult(translated);

      // ✅ 번역 내역 DB 저장 (태그 포함)
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
      console.error(e);
      Alert.alert("에러", e.message || "번역 중 오류가 발생했습니다.");
      setResult(`에러: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onCopy = async () => {
    if (!result) {
      Alert.alert("안내", "복사할 번역 결과가 없습니다.");
      return;
    }
    try {
      await Clipboard.setStringAsync(result);
      Alert.alert("복사 완료", "번역 결과가 클립보드에 복사되었습니다.");
    } catch (e) {
      console.error("[Clipboard] error:", e);
      Alert.alert("에러", "클립보드 복사 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.card}>
      {/* 상단: 엔진 이름 + 번역 버튼 + 복사 버튼 */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>{title}</Text>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.btn, isLoading && { opacity: 0.6 }]}
            onPress={onTranslate}
            disabled={isLoading}
          >
            <Text style={styles.btnText}>
              {isLoading ? "번역중..." : "번역하기"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.copyBtn} onPress={onCopy}>
            <Text style={styles.copyBtnText}>복사</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 태그 입력 */}
      <View style={styles.tagRow}>
        <Text style={styles.tagLabel}>태그</Text>
        <TextInput
          style={styles.tagInput}
          placeholder="예: 일상, 업무, 게임, 자주 쓰는 문장..."
          value={tag}
          onChangeText={setTag}
        />
      </View>

      {/* 번역 결과 영역 */}
      <ScrollView style={styles.resultArea}>
        <Text style={styles.resultText}>
          {result || "번역 결과가 여기에 표시됩니다."}
        </Text>
      </ScrollView>
    </View>
  );
}

export function GeminiTab(props) {
  return <ResultCard title="Gemini" {...props} />;
}
export function DeepLTab(props) {
  return <ResultCard title="DeepL" {...props} />;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btn: {
    backgroundColor: "#4a6cf7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  btnText: { color: "white", fontSize: 14, fontWeight: "600" },
  copyBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  copyBtnText: { fontSize: 13, fontWeight: "600", color: "#111827" },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  tagLabel: { fontSize: 12, color: "#555" },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
  },
  resultArea: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    borderRadius: 8,
    padding: 10,
  },
  resultText: { fontSize: 14, lineHeight: 20 },
});
