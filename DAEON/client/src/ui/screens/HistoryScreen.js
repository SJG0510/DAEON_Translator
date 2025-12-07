// src/ui/screens/HistoryScreen.js
import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from "react-native";

import { getHistory, clearHistory, setFavorite  } from "../../db/sqlite/historyRepo";

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const isFocused = useIsFocused();
  // ⭐ 정렬 모드: favorite만 있음
  const [sortMode, setSortMode] = useState(null); // null = 최신순 기본

  useEffect(() => {
  load();
}, []);

// ⭐ focus될 때 다시 새로고침
useEffect(() => {
  if (isFocused) {
    load();
  }
}, [isFocused]);


  async function load() {
    const rows = await getHistory();
    setItems(rows);
  }

  async function handleFavorite(item) {
  const newValue = item.Favorites ? 0 : 1;

  await setFavorite(item.ID, newValue);

  setItems(prev =>
    prev.map(row =>
      row.ID === item.ID
        ? { ...row, Favorites: newValue }
        : row
    )
  );
}

  /* -------------------------------------------
   * 🔎 검색
   * ------------------------------------------- */
  function applySearch(list) {
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();

    return list.filter((item) => {
      const original = (item.originalT || "").toLowerCase();
      const translated = (item.translationT || "").toLowerCase();
      const tag = (item.Tag || "").toLowerCase();

      return (
        original.includes(q) ||
        translated.includes(q) ||
        tag.includes(q)
      );
    });
  }

  /* -------------------------------------------
   * ⭐ 정렬 방식
   * ------------------------------------------- */
  function applySort(list) {
    let arr = [...list];

    // ⭐ 기본은 최신순(ID DESC)
    if (sortMode === null) {
      return arr.sort((a, b) => b.ID - a.ID);
    }

    // ⭐ 즐겨찾기 우선 정렬
    if (sortMode === "favorite") {
      return arr.sort((a, b) => {
        if (a.Favorites !== b.Favorites) {
          return b.Favorites - a.Favorites;
        }
        return b.ID - a.ID;
      });
    }

    return arr;
  }

  const processedItems = applySort(applySearch(items));

  /* -------------------------------------------
   * 전체 삭제
   * ------------------------------------------- */
  async function clearAll() {
    if (items.length === 0) {
      Alert.alert("안내", "삭제할 기록이 없습니다.");
      return;
    }

    Alert.alert("확인", "정말 전체 기록을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          await clearHistory();
          setItems([]);
        },
      },
    ]);
  }

  /* -------------------------------------------
   * 리스트 아이템 UI
   * ------------------------------------------- */
  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.itemBox}
        onPress={() => navigation.navigate("HistoryDetail", { id: item.ID })}
        
      >
        <View style={styles.itemHeader}>
          <Text style={styles.lang}>
            [{item.Engine}] {item.fromLang} → {item.toLang}
          </Text>

            <TouchableOpacity
            onPress={(e) => {
             e.stopPropagation?.(); // 부모 터치 중단
             handleFavorite(item);  // 즐겨찾기 토글 함수
    }}
  >
    <Text style={styles.favoriteIcon}>
      {item.Favorites ? "★" : "☆"}
    </Text>
  </TouchableOpacity>
        </View>

        <Text 
        style={styles.src}
        numberOfLines={2}
        ellipsizeMode="tail"
        >{item.originalT}
        </Text>

        <Text 
        style={styles.dst}
        numberOfLines={2}
         ellipsizeMode="tail"
        >
          {item.translationT}
        </Text>

        {item.Tag ? (
          <Text style={styles.tag}># {item.Tag}</Text>
        ) : (
          <Text style={styles.tagEmpty}>태그 없음</Text>
        )}
      </TouchableOpacity>
    );
  }

  /* -------------------------------------------
   * UI 렌더링
   * ------------------------------------------- */
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>번역 기록</Text>

        <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
          <Text style={styles.clearTxt}>전체 삭제</Text>
        </TouchableOpacity>
      </View>

      {/* ⭐ 정렬: ★ 우선만 */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, sortMode === "favorite" && styles.tabActive]}
          onPress={() =>
            setSortMode(sortMode === "favorite" ? null : "favorite")
          }
        >
          <Text
            style={[
              styles.tabText,
              sortMode === "favorite" && styles.tabTextActive,
            ]}
          >
            ★ 우선
          </Text>
        </TouchableOpacity>
      </View>

      {/* 검색창 */}
      <TextInput
        style={styles.searchInput}
        placeholder="원문 / 번역문 / 태그 검색"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 번역 기록 리스트 */}
      <FlatList
        data={processedItems}
        keyExtractor={(item) => String(item.ID)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>저장된 번역 기록이 없습니다.</Text>
        }
      />
    </View>
  );
}

/* -------------------------------------------
 * 스타일
 * ------------------------------------------- */
const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: "#fff" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: { fontSize: 20, fontWeight: "700" },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#ffe0e0",
    borderRadius: 8,
  },
  clearTxt: { color: "#c74343", fontWeight: "700", fontSize: 12 },

  /* 정렬 탭 */
  tabRow: {
    flexDirection: "row",
    marginVertical: 14,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },
  tabActive: {
    backgroundColor: "#2563eb",
  },
  tabText: {
    fontSize: 13,
    color: "#374151",
  },
  tabTextActive: {
    color: "white",
    fontWeight: "700",
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  /* 리스트 아이템 */
  itemBox: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lang: { fontSize: 12, color: "#666" },
  favoriteIcon: { fontSize: 18, color: "#facc15" },

  src: { marginTop: 4 },
  dst: { marginTop: 4, fontWeight: "700" },

  tag: { marginTop: 6, fontSize: 12, color: "#555" },
  tagEmpty: { marginTop: 6, fontSize: 12, color: "#aaa" },

  emptyText: { textAlign: "center", marginTop: 20, color: "#777" },
});