import { getDB } from "./db";

// CREATE
export async function addHistory(row) {
  const db = await getDB();

  const result = await db.runAsync(
    `INSERT INTO history 
      (Engine, fromLang, toLang, originalT, translationT, Tag, Favorites)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    row.Engine,
    row.fromLang,
    row.toLang,
    row.originalT,
    row.translationT,
    row.Tag ?? null,
    row.Favorites ?? 0
  );

  return result.lastInsertRowId;
}

// READ (전체)
export async function getHistory() {
  const db = await getDB();
  const rows = await db.getAllAsync("SELECT * FROM history ORDER BY Favorites DESC, ID DESC;");
  return rows;
}

// READ (단일) ← ⭐ 추가됨!
export async function getHistoryById(id) {
  const db = await getDB();
  const row = await db.getFirstAsync(
    "SELECT * FROM history WHERE ID = ?;",
    id
  );
  return row;
}

// DELETE ALL
export async function clearHistory() {
  const db = await getDB();
  await db.execAsync("DELETE FROM history;");
}

// UPDATE Favorites
export async function setFavorite(id, value) {
  const db = await getDB();
  await db.runAsync(
    "UPDATE history SET Favorites = ? WHERE ID = ?;",
    value,
    id
  );
}

// DELETE ONE
export async function deleteHistory(id) {
  const db = await getDB();
  await db.runAsync("DELETE FROM history WHERE ID = ?;", id);
}

// UPDATE Tag
export async function updateTag(id, tag) {
  const db = await getDB();
  const value = tag && tag.trim().length > 0 ? tag.trim() : null;
  await db.runAsync("UPDATE history SET Tag = ? WHERE ID = ?;", value, id);
}