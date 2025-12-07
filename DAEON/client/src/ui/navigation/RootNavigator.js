// src/ui/navigation/RootNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TranslatorScreen from "../screens/TranslatorScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";

// ❗ 경로 수정
import HistoryDetailScreen from "../screens/HistoryDetailScreen";


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Translator"
        component={TranslatorScreen}
        options={{ title: "다언" }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "번역 기록" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "설정" }}
      />

      {/* ✔ HistoryDetail 등록 완료 */}
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: "번역 상세" }}
      />
    </Stack.Navigator>
  );
}