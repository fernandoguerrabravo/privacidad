import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Base de datos SQLite para el plan de acción de implementación.
// El archivo se guarda en /data (ignorado por git) en la raíz del proyecto.

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "privacidad.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Tabla de actividades del plan de acción.
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      dimension_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'media',
      status TEXT NOT NULL DEFAULT 'pendiente',
      owner TEXT NOT NULL DEFAULT '',
      due_date TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  return db;
}

export type ActivityStatus =
  | "pendiente"
  | "en_progreso"
  | "completada"
  | "bloqueada";

export type ActivityPriority = "alta" | "media" | "baja";

export interface Activity {
  id: string;
  dimension_id: string;
  title: string;
  description: string;
  priority: ActivityPriority;
  status: ActivityStatus;
  owner: string;
  due_date: string;
  notes: string;
  source: "manual" | "claude";
  created_at: string;
  updated_at: string;
}
