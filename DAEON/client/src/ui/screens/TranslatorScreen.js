// src/ui/screens/TranslatorScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Speech from "expo-speech";
import EngineTabs from "../components/EngineTabs";

export default function TranslatorScreen() {
  const [fromLang, setFromLang] = useState("ko");
  const [toLang, setToLang] = useState("en");
  const [text, setText] = useState("");

  const swapLanguages = () => {
    setFromLang((prevFrom) => {
      const newFrom = toLang;
      setToLang(prevFrom);
      return newFrom;
    });
  };

  const getLangLabel = (code) => {
    const c = String(code).toLowerCase();
    if (c === "ko") return "한국어 (ko)";
    if (c === "en") return "영어 (en)";
    if (c === "ja") return "일본어 (ja)";
    if (c === "zh") return "중국어 (zh)";
    return code.toUpperCase();
  };

  const getSpeechLang = (code) => {
    if (!code) return undefined;
    const c = String(code).toLowerCase();
    if (c.startsWith("ko")) return "ko-KR";
    if (c.startsWith("en")) return "en-US";
    if (c.startsWith("ja")) return "ja-JP";
    if (c.startsWith("zh")) return "zh-CN";
    return undefined;
  };

  const speakOriginal = () => {
    if (!text) return;
    Speech.speak(text, { language: getSpeechLang(fromLang) });
  };

  return (
    <View style={styles.container}>
      {/* 🔵 언어 선택 + 스왑 */}
      <View style={styles.langRow}>
        {/* 원문 언어 */}
        <View style={styles.langBox}>
          <Text style={styles.langLabel}>원문</Text>
          <View style={styles.langPickerBox}>
            <Text style={styles.langValue}>{getLangLabel(fromLang)}</Text>

            {/* 투명 Picker: 실제 선택은 얘가 담당 */}
            <Picker
              selectedValue={fromLang}
              onValueChange={(v) => setFromLang(v)}
              style={styles.hiddenPicker}
              mode="dropdown"
            >
              <Picker.Item label="한국어 (ko)" value="ko" />
              <Picker.Item label="영어 (en)" value="en" />
              <Picker.Item label="일본어 (ja)" value="ja" />
              <Picker.Item label="중국어 (zh)" value="zh" />
            </Picker>
          </View>
        </View>

        {/* 스왑 버튼 */}
        <TouchableOpacity style={styles.swapBtn} onPress={swapLanguages}>
          <Text style={styles.swapText}>↔</Text>
        </TouchableOpacity>

        {/* 번역 언어 */}
        <View style={styles.langBox}>
          <Text style={styles.langLabel}>번역</Text>
          <View style={styles.langPickerBox}>
            <Text style={styles.langValue}>{getLangLabel(toLang)}</Text>

            <Picker
              selectedValue={toLang}
              onValueChange={(v) => setToLang(v)}
              style={styles.hiddenPicker}
              mode="dropdown"
            >
              <Picker.Item label="한국어 (ko)" value="ko" />
              <Picker.Item label="영어 (en)" value="en" />
              <Picker.Item label="일본어 (ja)" value="ja" />
              <Picker.Item label="중국어 (zh)" value="zh" />
            </Picker>
          </View>
        </View>
      </View>

      {/* 🔵 원문 입력 영역 (약 35%) */}
      <View style={styles.inputHalf}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.inputTitle}>원문 입력</Text>

          <TouchableOpacity style={styles.ttsBtn} onPress={speakOriginal}>
            <Text style={styles.ttsText}>원문 듣기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.inputScroll}
          contentContainerStyle={styles.inputScrollContent}
          nestedScrollEnabled
        >
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            multiline
            placeholder="번역할 문장을 입력하세요"
            textAlignVertical="top"
          />
        </ScrollView>
      </View>

      {/* 🔵 번역 엔진 영역 (약 65%) */}
      <View style={styles.engineHalf}>
        <EngineTabs text={text} fromLang={fromLang} toLang={toLang} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },

  /* 언어 선택 영역 */
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  langBox: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },
  langLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  langPickerBox: {
    position: "relative",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
  },
  langValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  hiddenPicker: {
    ...RNStyleSheet.absoluteFillObject,
    opacity: 0, // 보이지 않게, 하지만 터치는 가능
  },
  swapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  swapText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4b5563",
  },

  /* 🔵 원문 입력 35% */
  inputHalf: {
    flex: 0.35,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  inputTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  ttsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  ttsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  inputScroll: {
    flex: 1,
  },
  inputScrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
  },

  /* 🔵 번역 영역 65% */
  engineHalf: {
    flex: 0.65,
    marginTop: 4,
  },
});
