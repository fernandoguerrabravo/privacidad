"use client";

import { useEffect, useMemo, useState } from "react";
import { dimensions } from "@/data/survey";
import HourglassLoader from "./HourglassLoader";

type Status = "pendiente" | "en_progreso" | "completada" | "bloqueada";
type Priority = "alta" | "media" | "baja";

interface Activity {
  id: string;
  dimension_id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  owner: string;
  due_date: string;
  notes: string;
  source: "manual" | "claude";
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<Status, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  bloqueada: "Bloqueada",
};

const STATUS_ORDER: Status[] = [
  "pendiente",
  "en_progreso",
  "completada",
  "bloqueada",
];

const PRIORITY_LABELS: Record<Priority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  alta: "#ef4444",
  media: "#f59e0b",
  baja: "#9ca3af",
};

const dimName = (id: string) =>
  dimensions.find((d) => d.id === id)?.shortName ?? id;

export default function PlanBoard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Carga inicial
  useEffect(() => {
    fetch("/api/activities")
      .then((r) => r.json())
      .then((d) => setActivities(d.activities ?? []))
      .catch(() => setError("No se pudieron cargar las actividades"))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = useMemo(() => {
    const map: Record<Status, Activity[]> = {
      pendiente: [],
      en_progreso: [],
      completada: [],
      bloqueada: [],
    };
    for (const a of activities) map[a.status]?.push(a);
    return map;
  }, [activities]);

  const progress = useMemo(() => {
    if (activities.length === 0) return 0;
    const done = activities.filter((a) => a.status === "completada").length;
    return Math.round((done / activities.length) * 100);
  }, [activities]);

  // Lee el último resultado de encuesta: primero desde la base de datos
  // (persistente), con respaldo en localStorage del navegador.
  const fetchSurveyScores = async () => {
    try {
      const res = await fetch("/api/assessments");
      if (res.ok) {
        const data = await res.json();
        const a = data.latest;
        if (a) {
          return {
            overallAverage: a.overallAverage,
            levelLabel: a.levelLabel,
            dimensions: a.dimensions.map(
              (d: { id: string; name: string; average: number }) => ({
                id: d.id,
                name: d.name,
                description:
                  dimensions.find((x) => x.id === d.id)?.description ?? "",
                average: d.average,
              })
            ),
          };
        }
      }
    } catch {
      // continúa con el respaldo local
    }
    try {
      const raw = localStorage.getItem("ultimoResultadoEncuesta");
      if (raw) return JSON.parse(raw);
    } catch {
      // sin respaldo disponible
    }
    return null;
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    setError(null);
    try {
      const saved = await fetchSurveyScores();
      const payload = saved ?? {
        overallAverage: 3,
        levelLabel: "Intermedio",
        dimensions: dimensions.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          average: 3,
        })),
      };

      const res = await fetch("/api/activities/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar sugerencias");

      // Persiste las actividades sugeridas en la base de datos.
      const created = await fetch("/api/activities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          activities: data.activities.map(
            (a: { dimension_id: string; title: string; description: string; priority: Priority }) => ({
              ...a,
              source: "claude",
            })
          ),
        }),
      });
      const createdData = await created.json();
      if (!created.ok)
        throw new Error(createdData.error ?? "Error al guardar actividades");
      setActivities((prev) => [...prev, ...(createdData.activities ?? [])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al generar sugerencias");
    } finally {
      setSuggesting(false);
    }
  };

  const updateStatus = async (id: string, status: Status) => {
    // Optimista
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    await fetch(`/api/activities/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  };

  const removeActivity = async (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
  };

  const removeAllActivities = async () => {
    const confirmed = window.confirm(
      `¿Eliminar las ${activities.length} actividades del plan? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;
    const prev = activities;
    setActivities([]); // optimista
    const res = await fetch("/api/activities", { method: "DELETE" });
    if (!res.ok) {
      setActivities(prev); // revertir si falla
      setError("No se pudieron eliminar las actividades");
    }
  };

  const addManual = async (input: {
    dimension_id: string;
    title: string;
    description: string;
    priority: Priority;
    owner: string;
    due_date: string;
  }) => {
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...input, source: "manual" }),
    });
    const data = await res.json();
    if (res.ok && data.activity) {
      setActivities((prev) => [...prev, data.activity]);
      setShowForm(false);
    }
  };

  if (loading) {
    return (
      <div className="px-5 py-10 sm:px-8">
        <HourglassLoader label="Cargando plan de acción…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      {/* Encabezado */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Implementación · Ley N° 21.719
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Plan de acción
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Define y controla las actividades para implementar la Ley N° 21.719.
            Genera sugerencias con IA a partir de tu autoevaluación o agrega
            tareas manualmente.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-accent hover:text-accent"
          >
            + Actividad
          </button>
          <button
            type="button"
            onClick={handleSuggest}
            disabled={suggesting}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {suggesting ? "Generando…" : "Sugerir con IA"}
          </button>
          {activities.length > 0 && (
            <button
              type="button"
              onClick={removeAllActivities}
              className="rounded-lg border border-red-500/40 bg-transparent px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15"
            >
              Borrar todas
            </button>
          )}
        </div>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Progreso global del plan */}
      <div className="card-dark mb-6 rounded-2xl p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-white">Avance del plan</span>
          <span className="text-muted">
            {activities.filter((a) => a.status === "completada").length} de{" "}
            {activities.length} completadas ({progress}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showForm && (
        <ManualForm onAdd={addManual} onCancel={() => setShowForm(false)} />
      )}

      {suggesting && (
        <div className="card-dark mb-6 rounded-2xl p-4">
          <HourglassLoader label="Generando actividades con Claude…" size={28} />
        </div>
      )}

      {activities.length === 0 && !suggesting ? (
        <div className="card-dark rounded-2xl p-10 text-center shadow-sm">
          <p className="text-sm text-muted">
            Aún no hay actividades. Genera sugerencias con IA o agrega una
            manualmente para comenzar tu plan de implementación.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <div key={status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-white">
                  {STATUS_LABELS[status]}
                </h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted">
                  {byStatus[status].length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {byStatus[status].map((a) => (
                  <ActivityCard
                    key={a.id}
                    activity={a}
                    onStatusChange={updateStatus}
                    onDelete={removeActivity}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityCard({
  activity,
  onStatusChange,
  onDelete,
}: {
  activity: Activity;
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card-dark rounded-xl p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
          style={{
            backgroundColor: PRIORITY_COLORS[activity.priority],
            color: activity.priority === "baja" ? "#1a1a1a" : "#ffffff",
          }}
        >
          {PRIORITY_LABELS[activity.priority]}
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted">
          {dimName(activity.dimension_id)}
        </span>
      </div>
      <p className="text-sm font-medium leading-snug text-white">
        {activity.title}
      </p>
      {activity.description && (
        <p className="mt-1 text-xs leading-relaxed text-muted">
          {activity.description}
        </p>
      )}
      {(activity.owner || activity.due_date) && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          {activity.owner && <span>👤 {activity.owner}</span>}
          {activity.due_date && <span>📅 {activity.due_date}</span>}
        </div>
      )}
      {activity.source === "claude" && (
        <span className="mt-2 inline-block rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
          Sugerido por IA
        </span>
      )}

      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
        <select
          value={activity.status}
          onChange={(e) => onStatusChange(activity.id, e.target.value as Status)}
          className="flex-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-accent"
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s} className="bg-midnight text-white">
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onDelete(activity.id)}
          className="rounded-md px-2 py-1 text-xs text-white/50 transition-colors hover:bg-red-500/20 hover:text-red-300"
          aria-label="Eliminar actividad"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function ManualForm({
  onAdd,
  onCancel,
}: {
  onAdd: (input: {
    dimension_id: string;
    title: string;
    description: string;
    priority: Priority;
    owner: string;
    due_date: string;
  }) => void;
  onCancel: () => void;
}) {
  const [dimension_id, setDimensionId] = useState(dimensions[0].id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [owner, setOwner] = useState("");
  const [due_date, setDueDate] = useState("");

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-accent";

  return (
    <div className="card-dark mb-6 rounded-2xl p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-white">Nueva actividad</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted">Dimensión</label>
          <select
            value={dimension_id}
            onChange={(e) => setDimensionId(e.target.value)}
            className={inputCls}
          >
            {dimensions.map((d) => (
              <option key={d.id} value={d.id} className="bg-midnight">
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={inputCls}
          >
            <option value="alta" className="bg-midnight">Alta</option>
            <option value="media" className="bg-midnight">Media</option>
            <option value="baja" className="bg-midnight">Baja</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
            placeholder="Ej: Designar un Delegado de Protección de Datos"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputCls} min-h-[60px]`}
            placeholder="Detalle de la actividad"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Responsable</label>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className={inputCls}
            placeholder="Nombre o área"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Fecha límite</label>
          <input
            type="date"
            value={due_date}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-accent hover:text-accent"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!title.trim()}
          onClick={() =>
            onAdd({ dimension_id, title, description, priority, owner, due_date })
          }
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-dark disabled:opacity-50"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
