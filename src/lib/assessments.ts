import { randomUUID } from "crypto";
import {
  getDb,
  Assessment,
  AssessmentRow,
  AssessmentDimension,
} from "./db";

export interface NewAssessment {
  overallAverage: number;
  levelLabel: string;
  totalAnswered: number;
  totalQuestions: number;
  dimensions: AssessmentDimension[];
  answers?: Record<string, number>;
}

function rowToAssessment(row: AssessmentRow): Assessment {
  return {
    id: row.id,
    overallAverage: row.overall_average,
    levelLabel: row.level_label,
    totalAnswered: row.total_answered,
    totalQuestions: row.total_questions,
    dimensions: safeParse<AssessmentDimension[]>(row.dimensions_json, []),
    answers: safeParse<Record<string, number>>(row.answers_json, {}),
    createdAt: row.created_at,
  };
}

function safeParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function createAssessment(input: NewAssessment): Assessment {
  const db = getDb();
  const row: AssessmentRow = {
    id: randomUUID(),
    overall_average: input.overallAverage,
    level_label: input.levelLabel,
    total_answered: input.totalAnswered,
    total_questions: input.totalQuestions,
    dimensions_json: JSON.stringify(input.dimensions ?? []),
    answers_json: JSON.stringify(input.answers ?? {}),
    created_at: new Date().toISOString(),
  };

  db.prepare(
    `INSERT INTO assessments
      (id, overall_average, level_label, total_answered, total_questions, dimensions_json, answers_json, created_at)
     VALUES
      (@id, @overall_average, @level_label, @total_answered, @total_questions, @dimensions_json, @answers_json, @created_at)`
  ).run(row);

  return rowToAssessment(row);
}

export function getLatestAssessment(): Assessment | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM assessments ORDER BY created_at DESC LIMIT 1")
    .get() as AssessmentRow | undefined;
  return row ? rowToAssessment(row) : null;
}

export function listAssessments(limit = 20): Assessment[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM assessments ORDER BY created_at DESC LIMIT ?")
    .all(limit) as AssessmentRow[];
  return rows.map(rowToAssessment);
}
