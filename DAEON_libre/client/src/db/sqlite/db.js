// src/db/sqlite/db.js
import * as SQLite from "expo-sqlite";

let dbPromise = null;

// SQLite 싱글톤 (한 번만 열어서 재사용)
export function getDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("daeon.db");
  }
  return dbPromise;
}

// 앱 시작 시 테이블 생성
export async function initDB() {
  const db = await getDB();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS history (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Engine TEXT NOT NULL,
      fromLang TEXT NOT NULL,
      toLang TEXT NOT NULL,
      originalT TEXT NOT NULL,
      translationT TEXT NOT NULL,
      Tag TEXT,
      Favorites INTEGER DEFAULT 0
    );
  `);

  console.log("[DB] history 테이블 준비 완료 (openDatabaseAsync)");
}
