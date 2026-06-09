import { getDb } from "./db";

export interface ProgressItem {
  item_id: string;
  completed: boolean;
  completed_at: string;
  notes: string;
}

interface ProgressRow {
  item_id: string;
  completed: number;
  completed_at: string;
  notes: string;
}

export function getProgress(): Record<string, ProgressItem> {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM implementation_progress")
    .all() as ProgressRow[];
  const map: Record<string, ProgressItem> = {};
  for (const r of rows) {
    map[r.item_id] = {
      item_id: r.item_id,
      completed: r.completed === 1,
      completed_at: r.completed_at,
      notes: r.notes,
    };
  }
  return map;
}

export function toggleItem(
  itemId: string,
  completed: boolean,
  notes?: string
): ProgressItem {
  const db = getDb();
  const now = completed ? new Date().toISOString() : "";
  db.prepare(
    `INSERT INTO implementation_progress (item_id, completed, completed_at, notes)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(item_id) DO UPDATE SET
       completed = excluded.completed,
       completed_at = excluded.completed_at,
       notes = CASE WHEN excluded.notes != '' THEN excluded.notes ELSE implementation_progress.notes END`
  ).run(itemId, completed ? 1 : 0, now, notes ?? "");

  return {
    item_id: itemId,
    completed,
    completed_at: now,
    notes: notes ?? "",
  };
}

export function updateItemNotes(itemId: string, notes: string): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO implementation_progress (item_id, completed, completed_at, notes)
     VALUES (?, 0, '', ?)
     ON CONFLICT(item_id) DO UPDATE SET notes = excluded.notes`
  ).run(itemId, notes);
}

export function resetAllProgress(): void {
  const db = getDb();
  db.prepare("DELETE FROM implementation_progress").run();
}
