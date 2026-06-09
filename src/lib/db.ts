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

  // Tabla de evaluaciones (resultados de la encuesta).
  // overall_average: puntaje global. level_label: nivel de cumplimiento.
  // dimensions_json y answers_json guardan el detalle serializado.
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      overall_average REAL NOT NULL,
      level_label TEXT NOT NULL,
      total_answered INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      dimensions_json TEXT NOT NULL,
      answers_json TEXT NOT NULL DEFAULT '{}',
      conclusions_json TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);

  // Migración: agrega conclusions_json si la tabla ya existía sin la columna.
  const cols = db
    .prepare("PRAGMA table_info(assessments)")
    .all() as { name: string }[];
  if (!cols.some((c) => c.name === "conclusions_json")) {
    db.exec(
      "ALTER TABLE assessments ADD COLUMN conclusions_json TEXT NOT NULL DEFAULT ''"
    );
  }

  // Tabla de progreso del proceso de implementación (checklist por fase).
  db.exec(`
    CREATE TABLE IF NOT EXISTS implementation_progress (
      item_id TEXT PRIMARY KEY,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT ''
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

// Detalle de una dimensión dentro de una evaluación guardada.
export interface AssessmentDimension {
  id: string;
  name: string;
  average: number;
  answered: number;
  total: number;
}

// Conclusiones generadas por Claude (o respaldo) para una evaluación.
export interface AssessmentConclusions {
  overall: string;
  dimensions: { id: string; conclusion: string }[];
  source: "claude" | "fallback";
}

// Fila de la tabla assessments tal como se guarda en SQLite.
export interface AssessmentRow {
  id: string;
  overall_average: number;
  level_label: string;
  total_answered: number;
  total_questions: number;
  dimensions_json: string;
  answers_json: string;
  conclusions_json: string;
  created_at: string;
}

// Evaluación ya deserializada para usar en la app.
export interface Assessment {
  id: string;
  overallAverage: number;
  levelLabel: string;
  totalAnswered: number;
  totalQuestions: number;
  dimensions: AssessmentDimension[];
  answers: Record<string, number>;
  conclusions: AssessmentConclusions | null;
  createdAt: string;
}
