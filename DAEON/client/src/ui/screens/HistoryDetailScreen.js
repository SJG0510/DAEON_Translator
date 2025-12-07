// src/ui/screens/HistoryDetailScreen.js

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import {
  getHistoryById,
  deleteHistory,
  setFavorite,
  updateTag,
} from "../../db/sqlite/historyRepo";

import * as Clipboard from "expo-clipboard";

export default function HistoryDetailScreen({ route, navigation }) {
  const { id } = route.params;

  const [item, setItem] = useState(null);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const row = await getHistoryById(id);
    setItem(row);
    setTagText(row?.Tag || "");
  }

  async function copyTranslation() {
    await Clipboard.setStringAsync(item.translationT);
    Alert.alert("복사됨", "번역문이 복사되었습니다!");
  }

  async function toggleFavorite() {
    const newValue = item.Favorites ? 0 : 1;
    await setFavorite(id, newValue);
    load();
  }

  /* =============================
   * ⭐ 태그 저장 (navigate → goBack)
   * ============================= */
  async function saveTag() {
    await updateTag(id, tagText.trim() === "" ? null : tagText);
    setIsEditingTag(false);
    navigation.goBack(); // ⭐ 변경됨
  }

  /* =============================
   * ⭐ 삭제 기능 (navigate → goBack)
   * ============================= */
  async function onDelete() {
    Alert.alert("삭제", "정말 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await deleteHistory(id);
          navigation.goBack(); // ⭐ 변경됨
        },
      },
    ]);
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>로딩중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ⭐ 즐겨찾기 버튼 */}
      <View style={styles.tagBox}>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteBtn}>
          <Text style={styles.favoriteText}>
            {item.Favorites ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>태그</Text>

        {!isEditingTag ? (
          <>
            <Text style={item.Tag ? styles.tag : styles.tagEmpty}>
              {item.Tag ? `# ${item.Tag}` : "태그 없음"}
            </Text>

            <TouchableOpacity onPress={() => setIsEditingTag(true)}>
              <Text style={styles.tagEdit}>태그 수정</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.tagEditRow}>
            <TextInput
              style={styles.tagInput}
              value={tagText}
              onChangeText={setTagText}
              placeholder="새 태그 입력"
            />

            <TouchableOpacity onPress={saveTag}>
              <Text style={styles.tagSave}>저장</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsEditingTag(false)}>
              <Text style={styles.tagCancel}>취소</Text>
            </TouchableOpacity>

          </View>
        )}
      </View>

      {/* 번역 엔진 정보 */}
      <Text style={styles.lang}>
        [{item.Engine}] {item.fromLang} → {item.toLang}
      </Text>

      {/* 원문 */}
      <Text style={styles.label}>원문</Text>
      <Text style={styles.original}>{item.originalT}</Text>

      {/* 번역문 */}
      <Text style={styles.label}>번역문</Text>
      <Text style={styles.translation}>{item.translationT}</Text>

      {/* 복사 버튼 */}
      <TouchableOpacity onPress={copyTranslation} style={styles.copyBtn}>
        <Text style={styles.copyText}>복사하기</Text>
      </TouchableOpacity>

      {/* 삭제 버튼 */}
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>삭제</Text>
      </TouchableOpacity>
    </View>
  );
}

/* -------------------------------------------
 * 스타일
 * ------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  tagBox: { marginBottom: 20 },
  tag: { marginTop: 4, color: "#4b5563", fontSize: 14 },
  tagEmpty: { marginTop: 4, color: "#9ca3af", fontSize: 14 },
  tagEdit: { color: "#2563eb", marginTop: 6, fontSize: 13 },

  tagEditRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagSave: { marginLeft: 10, color: "#059669", fontWeight: "700" },
  tagCancel: { marginLeft: 10, color: "#6b7280" },

  lang: { fontSize: 12, color: "#666", marginBottom: 10 },

  label: { fontSize: 14, fontWeight: "700", marginTop: 8 },
  original: {
    marginTop: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  translation: {
    marginTop: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fafafa",
    fontWeight: "700",
  },

  copyBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyText: { color: "white", textAlign: "center", fontWeight: "700" },

  favoriteBtn: { marginTop: 14 },
  favoriteText: { fontSize: 16, color: "#facc15" },

  deleteBtn: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ffe0e0",
  },
  deleteText: { color: "#b91c1c", textAlign: "center", fontWeight: "700" },
});
