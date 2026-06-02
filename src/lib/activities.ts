import { randomUUID } from "crypto";
import {
  getDb,
  Activity,
  ActivityStatus,
  ActivityPriority,
} from "./db";

const VALID_STATUS: ActivityStatus[] = [
  "pendiente",
  "en_progreso",
  "completada",
  "bloqueada",
];
const VALID_PRIORITY: ActivityPriority[] = ["alta", "media", "baja"];

export interface NewActivity {
  dimension_id: string;
  title: string;
  description?: string;
  priority?: ActivityPriority;
  status?: ActivityStatus;
  owner?: string;
  due_date?: string;
  notes?: string;
  source?: "manual" | "claude";
}

export function listActivities(): Activity[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM activities ORDER BY created_at ASC")
    .all() as Activity[];
}

export function createActivity(input: NewActivity): Activity {
  const db = getDb();
  const now = new Date().toISOString();
  const activity: Activity = {
    id: randomUUID(),
    dimension_id: input.dimension_id,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    priority: VALID_PRIORITY.includes(input.priority as ActivityPriority)
      ? (input.priority as ActivityPriority)
      : "media",
    status: VALID_STATUS.includes(input.status as ActivityStatus)
      ? (input.status as ActivityStatus)
      : "pendiente",
    owner: input.owner?.trim() ?? "",
    due_date: input.due_date?.trim() ?? "",
    notes: input.notes?.trim() ?? "",
    source: input.source === "claude" ? "claude" : "manual",
    created_at: now,
    updated_at: now,
  };

  db.prepare(
    `INSERT INTO activities
      (id, dimension_id, title, description, priority, status, owner, due_date, notes, source, created_at, updated_at)
     VALUES
      (@id, @dimension_id, @title, @description, @priority, @status, @owner, @due_date, @notes, @source, @created_at, @updated_at)`
  ).run(activity);

  return activity;
}

export function createManyActivities(inputs: NewActivity[]): Activity[] {
  const db = getDb();
  const insertMany = db.transaction((items: NewActivity[]) =>
    items.map((i) => createActivity(i))
  );
  return insertMany(inputs);
}

export function updateActivity(
  id: string,
  patch: Partial<NewActivity>
): Activity | null {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM activities WHERE id = ?")
    .get(id) as Activity | undefined;
  if (!existing) return null;

  const updated: Activity = {
    ...existing,
    ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
    ...(patch.description !== undefined
      ? { description: patch.description.trim() }
      : {}),
    ...(patch.priority !== undefined &&
    VALID_PRIORITY.includes(patch.priority)
      ? { priority: patch.priority }
      : {}),
    ...(patch.status !== undefined && VALID_STATUS.includes(patch.status)
      ? { status: patch.status }
      : {}),
    ...(patch.owner !== undefined ? { owner: patch.owner.trim() } : {}),
    ...(patch.due_date !== undefined
      ? { due_date: patch.due_date.trim() }
      : {}),
    ...(patch.notes !== undefined ? { notes: patch.notes.trim() } : {}),
    updated_at: new Date().toISOString(),
  };

  db.prepare(
    `UPDATE activities SET
      title = @title, description = @description, priority = @priority,
      status = @status, owner = @owner, due_date = @due_date,
      notes = @notes, updated_at = @updated_at
     WHERE id = @id`
  ).run(updated);

  return updated;
}

export function deleteActivity(id: string): boolean {
  const db = getDb();
  const res = db.prepare("DELETE FROM activities WHERE id = ?").run(id);
  return res.changes > 0;
}

export function deleteAllActivities(): number {
  const db = getDb();
  const res = db.prepare("DELETE FROM activities").run();
  return res.changes;
}
