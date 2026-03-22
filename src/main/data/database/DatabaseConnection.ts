import { DatabaseSync } from "node:sqlite";
import path from "path";
import { app } from "electron";
import fs from "fs";

// Determine the database path (in userData folder for production, local data folder for dev)
const isDev = process.env.NODE_ENV === "development";
const dataDir = isDev
  ? path.join(process.cwd(), "data")
  : path.join(app.getPath("userData"), "database");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "kanban.sqlite");

const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency and performance
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

export function initDatabase() {
  console.log("Initializing Database at:", dbPath);

  // Read current user_version
  const versionRow = db.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  let currentVersion = versionRow.user_version || 0;

  // Run migrations
  try {
    if (currentVersion < 1) {
      console.log("Running Migration 1: Initial Schema");
      db.exec(`
        BEGIN TRANSACTION;

        CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'Planning',
          due_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS columns (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          title TEXT NOT NULL,
          color TEXT,
          "order" INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          column_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          due_date DATETIME,
          "order" INTEGER NOT NULL,
          time_spent_minutes INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(column_id) REFERENCES columns(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS tags (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          color TEXT
        );

        CREATE TABLE IF NOT EXISTS task_tags (
          task_id TEXT NOT NULL,
          tag_id TEXT NOT NULL,
          PRIMARY KEY (task_id, tag_id),
          FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );

        PRAGMA user_version = 1;
        
        COMMIT;
      `);
      currentVersion = 1;
    }

    // Migration 2: Activity Logs
    if (currentVersion < 2) {
      console.log("Running Migration 2: Activity Logs");
      db.exec(`
        BEGIN TRANSACTION;

        CREATE TABLE IF NOT EXISTS activity_logs (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        PRAGMA user_version = 2;
        
        COMMIT;
      `);
      currentVersion = 2;
    }
  } catch (err) {
    console.error("Migration failed:", err);
    throw err;
  }
}

export default db;
