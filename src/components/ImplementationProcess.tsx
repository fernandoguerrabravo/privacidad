"use client";

import { useEffect, useMemo, useState } from "react";
import { phases, totalItems } from "@/data/implementation";
import HourglassLoader from "./HourglassLoader";

interface ProgressItem {
  item_id: string;
  completed: boolean;
  completed_at: string;
  notes: string;
}

export default function ImplementationProcess() {
  const [progress, setProgress] = useState<Record<string, ProgressItem>>({});
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(
    phases[0].id
  );

  useEffect(() => {
    fetch("/api/implementation")
      .then((r) => r.json())
      .then((d) => setProgress(d.progress ?? {}))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = useMemo(
    () =>
      Object.values(progress).filter((p) => p.completed).length,
    [progress]
  );
  const globalPercent = Math.round((completedCount / totalItems) * 100);

  const phaseCompleted = (phaseId: string) => {
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return 0;
    return phase.items.filter((i) => progress[i.id]?.completed).length;
  };

  const toggleCheck = async (itemId: string) => {
    const current = progress[itemId]?.completed ?? false;
    const newVal = !current;
    // Optimista
    setProgress((prev) => ({
      ...prev,
      [itemId]: {
        item_id: itemId,
        completed: newVal,
        completed_at: newVal ? new Date().toISOString() : "",
        notes: prev[itemId]?.notes ?? "",
      },
    }));
    await fetch("/api/implementation", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, completed: newVal }),
    });
  };

  if (loading) {
    return (
      <div className="px-5 py-10 sm:px-8">
        <HourglassLoader label="Cargando proceso de implementación…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      {/* Encabezado */}
      <header className="mb-6">
        <p className="mb-2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          Implementación · Ley N° 21.719
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-white">
          Proceso de implementación
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Sigue las 7 fases recomendadas por la guía oficial de la Secretaría de
          Gobierno Digital para implementar la nueva ley antes del 1 de diciembre
          de 2026.
        </p>
      </header>

      {/* Progreso global */}
      <div className="card-dark mb-6 rounded-2xl p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-white">Avance global</span>
          <span className="text-muted">
            {completedCount} de {totalItems} acciones ({globalPercent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${globalPercent}%` }}
          />
        </div>
      </div>

      {/* Cronograma visual de fases */}
      <div className="mb-6 grid grid-cols-7 gap-1">
        {phases.map((phase) => {
          const done = phaseCompleted(phase.id);
          const total = phase.items.length;
          const pct = Math.round((done / total) * 100);
          return (
            <button
              key={phase.id}
              type="button"
              onClick={() =>
                setExpandedPhase(
                  expandedPhase === phase.id ? null : phase.id
                )
              }
              className={`flex flex-col items-center rounded-lg p-2 text-center transition-colors ${
                expandedPhase === phase.id
                  ? "bg-accent text-accent-foreground"
                  : pct === 100
                  ? "bg-accent/20 text-accent"
                  : "bg-white/5 text-muted hover:bg-white/10"
              }`}
            >
              <span className="text-lg font-bold">{phase.number}</span>
              <span className="mt-0.5 text-[10px] leading-tight">
                {phase.shortName}
              </span>
              <span className="mt-1 text-[10px] font-semibold">
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Detalle de la fase expandida */}
      {expandedPhase && (
        <PhaseDetail
          phase={phases.find((p) => p.id === expandedPhase)!}
          progress={progress}
          onToggle={toggleCheck}
        />
      )}

      <footer className="mt-8 text-center text-xs text-muted/70">
        Basado en la Guía Práctica de la Secretaría de Gobierno Digital de Chile
        (wikiguias.digital.gob.cl). Fecha límite: 1 diciembre 2026.
      </footer>
    </div>
  );
}

function PhaseDetail({
  phase,
  progress,
  onToggle,
}: {
  phase: (typeof phases)[0];
  progress: Record<string, ProgressItem>;
  onToggle: (id: string) => void;
}) {
  const done = phase.items.filter((i) => progress[i.id]?.completed).length;
  const pct = Math.round((done / phase.items.length) * 100);

  return (
    <div className="card-dark rounded-2xl p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              {phase.number}
            </span>
            {phase.name}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {phase.description}
          </p>
          <p className="mt-1 text-xs text-accent">{phase.timeline}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{pct}%</span>
          <p className="text-[11px] text-muted">
            {done}/{phase.items.length}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {phase.items.map((item) => {
          const checked = progress[item.id]?.completed ?? false;
          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors ${
                checked
                  ? "bg-accent/10"
                  : "bg-white/5 hover:bg-white/8"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(item.id)}
                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-white/30 accent-accent"
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`text-sm leading-relaxed ${
                    checked
                      ? "text-white/60 line-through"
                      : "text-white"
                  }`}
                >
                  {item.text}
                </span>
                {item.help && (
                  <p className="mt-0.5 text-xs text-muted">{item.help}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
