import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'daily-affirm.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      selected_categories TEXT NOT NULL DEFAULT '["finance","love","career","health","mindset"]',
      notification_frequency INTEGER NOT NULL DEFAULT 3,
      streak_count INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS affirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL CHECK(category IN ('finance','love','career','health','mindset')),
      text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_affirmations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      categories TEXT NOT NULL DEFAULT '[]',
      include_in_notifications INTEGER NOT NULL DEFAULT 1,
      priority TEXT NOT NULL DEFAULT 'normal' CHECK(priority IN ('normal','high')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      affirmation_id TEXT NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('system','user')),
      shown_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_affirmations_category ON affirmations(category);
    CREATE INDEX IF NOT EXISTS idx_user_affirmations_user ON user_affirmations(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_logs_user ON user_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_logs_shown ON user_logs(shown_at);
  `);
}