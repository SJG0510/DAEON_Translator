// App.js
import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, TouchableOpacity, View } from "react-native";

import TranslatorScreen from "./src/ui/screens/TranslatorScreen";
import HistoryScreen from "./src/ui/screens/HistoryScreen";
import HistoryDetailScreen from "./src/ui/screens/HistoryDetailScreen";
import SettingsScreen from "./src/ui/screens/SettingsScreen";
import { initDB } from "./src/db/sqlite/db";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await initDB();
        console.log("SQLite Initialized");
      } catch (e) {
        console.error("DB Init Error:", e);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>

        {/* 번역 화면 */}
        <Stack.Screen
          name="Translator"
          component={TranslatorScreen}
          options={({ navigation }) => ({
            title: "다언",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("History")}
                style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              >
                <Text style={{ fontSize: 16 }}>기록</Text>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                  style={{ paddingHorizontal: 8, paddingVertical: 4 }}
                >
                  <Text style={{ fontSize: 16 }}>상태</Text>
                </TouchableOpacity>
              </View>
            ),
          })}
        />

        {/* 기록 목록 */}
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: "번역 기록" }}
        />

        {/* 상세 보기 */}
        <Stack.Screen
          name="HistoryDetail"
          component={HistoryDetailScreen}
          options={{ title: "번역 상세" }}
        />

        {/* 설정 */}
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "상태" }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}