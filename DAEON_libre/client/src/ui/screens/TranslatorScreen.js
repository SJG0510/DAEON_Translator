// src/ui/screens/TranslatorScreen.js
import { Picker } from "@react-native-picker/picker";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DeepLTab, GeminiTab, LibreTab } from "../components/EngineTabs";

const Tab = createBottomTabNavigator();

const LANG_OPTIONS = [
  { label: "한국어", code: "ko" },
  { label: "영어", code: "en" },
  { label: "일본어", code: "ja" },
  { label: "중국어", code: "zh" },
];

export default function TranslatorScreen() {
  const [fromLang, setFromLang] = useState("ko");
  const [toLang, setToLang] = useState("en");
  const [text, setText] = useState("");

  const swapLang = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const engineProps = { fromLang, toLang, text };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* 언어 선택 영역 */}
        <View style={styles.langRow}>
          <View style={styles.langBox}>
            <Text style={styles.label}>원문 언어</Text>
            <Picker
              selectedValue={fromLang}
              onValueChange={(v) => setFromLang(v)}
              style={styles.picker}
            >
              {LANG_OPTIONS.map((opt) => (
                <Picker.Item
                  key={opt.code}
                  label={opt.label}
                  value={opt.code}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.swapBox}>
            <TouchableOpacity onPress={swapLang}>
              <Text style={styles.swapTxt}>⇄</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.langBox}>
            <Text style={styles.label}>번역 언어</Text>
            <Picker
              selectedValue={toLang}
              onValueChange={(v) => setToLang(v)}
              style={styles.picker}
            >
              {LANG_OPTIONS.map((opt) => (
                <Picker.Item
                  key={opt.code}
                  label={opt.label}
                  value={opt.code}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* 입력 박스 */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>번역할 텍스트</Text>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="번역할 문장을 입력하세요."
            value={text}
            onChangeText={setText}
          />
          <Text style={styles.helper}>
            * 엔진 탭을 눌러 각각 번역 결과를 확인할 수 있습니다.
          </Text>
        </View>

        {/* 엔진 탭 */}
        <View style={{ flex: 1 }}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarLabelStyle: { fontSize: 12 },
            }}
          >
            <Tab.Screen name="Libre">
              {() => <LibreTab {...engineProps} />}
            </Tab.Screen>
            <Tab.Screen name="Gemini">
              {() => <GeminiTab {...engineProps} />}
            </Tab.Screen>
            <Tab.Screen name="DeepL">
              {() => <DeepLTab {...engineProps} />}
            </Tab.Screen>
          </Tab.Navigator>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 12, backgroundColor: "#f5f7fb" },
  langRow: { flexDirection: "row", alignItems: "center", gap: 10, },
  langBox: { flex: 4, backgroundColor: "white", borderRadius: 12, padding: 10 },
  picker: { height: 55 },
  swapBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  swapTxt: { fontSize: 18, fontWeight: "700" },
  inputBox: { backgroundColor: "white", borderRadius: 12, padding: 10 },
  label: { fontSize: 12, color: "#666", marginBottom: 4 },
  textArea: {
    minHeight: 100,
    fontSize: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f7fb",
    textAlignVertical: "top",
  },
  helper: { fontSize: 11, color: "#888", marginTop: 6 },
});
