// src/ui/screens/SettingsScreen.js
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ⚠ translate.js 의 SERVER_BASE_URL 과 동일하게 맞춰야 함
// 예: "http://192.168.1.9:3000"
const SERVER_BASE_URL = "http://server_ip:3000";  // server가 열려있는 ip

function StatusBadge({ status }) {
  let label = "알 수 없음";
  let color = "#9ca3af"; // gray

  if (status === "checking") {
    label = "확인 중";
    color = "#38bdf8"; // sky
  } else if (status === "ok") {
    label = "정상";
    color = "#22c55e"; // green
  } else if (status === "error") {
    label = "오류";
    color = "#ef4444"; // red
  }

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  // 서버 상태
  const [serverStatus, setServerStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");

  // 엔진별 상태
  const [geminiStatus, setGeminiStatus] = useState("idle");
  const [geminiMessage, setGeminiMessage] = useState("");

  const [deeplStatus, setDeeplStatus] = useState("idle");
  const [deeplMessage, setDeeplMessage] = useState("");

  const [lastChecked, setLastChecked] = useState(null);

  /* ───────────── 서버 상태 체크 (/api/status/server) ───────────── */

  async function checkServer() {
    try {
      setServerStatus("checking");
      setServerMessage("");

      const res = await fetch(`${SERVER_BASE_URL}/api/status/server`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setServerStatus("error");
        setServerMessage(
          data?.message ||
            `HTTP ${res.status}: 서버 상태를 확인할 수 없습니다.`
        );
      } else {
        setServerStatus("ok");
        setServerMessage(data.message || "서버 응답 OK");
      }
    } catch (e) {
      setServerStatus("error");
      setServerMessage(e.message || String(e));
    }
  }

  /* ───────────── 엔진별 상태 체크 (쿼터 안 쓰는 /api/status/*) ───────────── */

  async function checkGemini() {
    try {
      setGeminiStatus("checking");
      setGeminiMessage("");

      const res = await fetch(`${SERVER_BASE_URL}/api/status/gemini`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setGeminiStatus("error");
        setGeminiMessage(
          data?.message ||
            `HTTP ${res.status}: Gemini 상태를 확인할 수 없습니다.`
        );
      } else {
        setGeminiStatus("ok");
        setGeminiMessage(data.message || "Gemini 사용 가능");
      }
    } catch (e) {
      setGeminiStatus("error");
      setGeminiMessage(e.message || String(e));
    }
  }

  async function checkDeepL() {
    try {
      setDeeplStatus("checking");
      setDeeplMessage("");

      const res = await fetch(`${SERVER_BASE_URL}/api/status/deepl`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setDeeplStatus("error");
        setDeeplMessage(
          data?.message ||
            `HTTP ${res.status}: DeepL 상태를 확인할 수 없습니다.`
        );
      } else {
        setDeeplStatus("ok");
        setDeeplMessage(data.message || "DeepL 사용 가능");
      }
    } catch (e) {
      setDeeplStatus("error");
      setDeeplMessage(e.message || String(e));
    }
  }

  /* ───────────── 전체 한번에 체크 ───────────── */

  async function checkAll() {
    setLastChecked(null);
    // 순차 실행 (에러 나도 뒤에 것까지 가게 하고 싶으면 try/catch 쪼개도 됨)
    await checkServer();
    await checkGemini();
    await checkDeepL();
    setLastChecked(new Date());
  }

  useEffect(() => {
    // 설정 탭 들어오면 자동으로 한 번 체크
    checkAll();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>연결 상태</Text>
      <Text style={styles.subtitle}>
        현재 다언 클라이언트가 번역 서버 및 각 번역 엔진과 정상적으로 통신할 수
        있는지 확인합니다.
      </Text>

      {/* 서버 연결 상태 */}
      <View style={styles.section}>
        <View className="sectionHeader" style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>서버 연결 상태</Text>
          <StatusBadge status={serverStatus} />
        </View>

        {serverStatus === "checking" ? (
          <View style={styles.rowCenter}>
            <ActivityIndicator />
            <Text style={{ marginLeft: 8 }}>서버에 접속 중입니다...</Text>
          </View>
        ) : (
          <Text style={styles.message}>
            {serverMessage || "아직 상태를 확인하지 않았습니다."}
          </Text>
        )}

        <Text style={styles.helperText}>
          • 이 항목은 PC에서 Node 서버가 켜져 있는지, 네트워크로 접근 가능한지
          확인합니다.{"\n"}
          • 브라우저에서 {SERVER_BASE_URL}/api/status/server 에 접속했을 때와
          같은 결과입니다.
        </Text>
      </View>

      {/* Gemini 상태 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gemini 번역 서비스</Text>
          <StatusBadge status={geminiStatus} />
        </View>

        {geminiStatus === "checking" ? (
          <View style={styles.rowCenter}>
            <ActivityIndicator />
            <Text style={{ marginLeft: 8 }}>Gemini 테스트 중입니다...</Text>
          </View>
        ) : (
          <Text style={styles.message}>
            {geminiMessage || "아직 Gemini 상태를 확인하지 않았습니다."}
          </Text>
        )}

        <Text style={styles.helperText}>
          • Gemini 무료 등급 API 키 설정 여부를 확인합니다.{"\n"}
          • 실제 번역 호출을 하지 않으므로 쿼터를 소모하지 않습니다.
        </Text>

        <TouchableOpacity style={styles.engineBtn} onPress={checkGemini}>
          <Text style={styles.engineBtnText}>Gemini만 다시 확인</Text>
        </TouchableOpacity>
      </View>

      {/* DeepL 상태 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DeepL 번역 서비스</Text>
          <StatusBadge status={deeplStatus} />
        </View>

        {deeplStatus === "checking" ? (
          <View style={styles.rowCenter}>
            <ActivityIndicator />
            <Text style={{ marginLeft: 8 }}>DeepL 테스트 중입니다...</Text>
          </View>
        ) : (
          <Text style={styles.message}>
            {deeplMessage || "아직 DeepL 상태를 확인하지 않았습니다."}
          </Text>
        )}

        <Text style={styles.helperText}>
          • DeepL API 키(무료/유료)가 설정되어 있는지 확인합니다.{"\n"}
          • 실제 번역 호출을 하지 않으므로 사용량은 증가하지 않습니다.
        </Text>

        <TouchableOpacity style={styles.engineBtn} onPress={checkDeepL}>
          <Text style={styles.engineBtnText}>DeepL만 다시 확인</Text>
        </TouchableOpacity>
      </View>

      {/* 마지막 확인 시간 & 전체 다시 확인 */}
      <View style={styles.footer}>
        <Text style={styles.lastChecked}>
          마지막 전체 확인:{" "}
          {lastChecked
            ? lastChecked.toLocaleString()
            : "아직 확인 내역 없음"}
        </Text>

        <TouchableOpacity style={styles.refreshBtn} onPress={checkAll}>
          <Text style={styles.refreshText}>전체 다시 확인</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
  },
  section: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#f9fafb",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  message: {
    fontSize: 13,
    marginTop: 4,
    color: "#111827",
  },
  helperText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 8,
    lineHeight: 16,
  },
  footer: {
    marginTop: 8,
    alignItems: "flex-start",
    gap: 8,
  },
  lastChecked: {
    fontSize: 12,
    color: "#6b7280",
  },
  refreshBtn: {
    marginTop: 4,
    backgroundColor: "#4b5563",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  refreshText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  engineBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  engineBtnText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },
});
