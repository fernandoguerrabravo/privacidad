"use client";

import { useEffect, useMemo, useState } from "react";
import { phases, totalItems, Resource } from "@/data/implementation";
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

      <div className="space-y-3">
        {phase.items.map((item) => {
          const checked = progress[item.id]?.completed ?? false;
          return (
            <div
              key={item.id}
              className={`rounded-lg p-3 transition-colors ${
                checked ? "bg-accent/10" : "bg-white/5"
              }`}
            >
              <label className="flex cursor-pointer items-start gap-3">
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

              {/* Recursos prácticos */}
              {item.resources && item.resources.length > 0 && (
                <div className="ml-8 mt-2 flex flex-wrap gap-2">
                  {item.resources.map((res, idx) => (
                    <ResourceButton key={idx} resource={res} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourceButton({ resource }: { resource: Resource }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors";

  if (resource.type === "link") {
    return (
      <a
        href={resource.value}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-white/10 text-white/80 hover:bg-white/15 hover:text-white`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6" />
          <path d="M10 14 21 3" />
        </svg>
        {resource.label}
      </a>
    );
  }

  if (resource.type === "ia") {
    return (
      <button
        type="button"
        className={`${base} bg-accent/15 text-accent hover:bg-accent/25`}
        title={`Generar con IA: ${resource.label}`}
        onClick={() => {
          // TODO: Implementar generación con Claude.
          alert(
            `Próximamente: "${resource.label}" se generará con IA basándose en los datos de tu organización.`
          );
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
        </svg>
        {resource.label}
      </button>
    );
  }

  if (resource.type === "template") {
    return (
      <span
        className={`${base} bg-white/8 text-white/70 cursor-default`}
        title={resource.value}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8M16 17H8M10 9H8" />
        </svg>
        {resource.label}
      </span>
    );
  }

  // type === "tool"
  return (
    <button
      type="button"
      className={`${base} bg-white/10 text-white/80 hover:bg-white/15`}
      title={resource.value}
      onClick={() => {
        alert(
          `Próximamente: herramienta "${resource.label}" integrada en la plataforma.`
        );
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
      {resource.label}
    </button>
  );
}
