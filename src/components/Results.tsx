"use client";

import { useEffect, useState } from "react";
import { SurveyResult } from "@/lib/scoring";
import { dimensions } from "@/data/survey";
import RadarChart from "./RadarChart";
import ScoreGauge from "./ScoreGauge";
import HourglassLoader from "./HourglassLoader";

interface ResultsProps {
  result: SurveyResult;
  onBack: () => void;
  onReset: () => void;
}

interface ConclusionItem {
  id: string;
  conclusion: string;
}

interface ConclusionsResponse {
  overall: string;
  dimensions: ConclusionItem[];
  source: "claude" | "fallback";
}

export default function Results({ result, onBack, onReset }: ResultsProps) {
  const [data, setData] = useState<ConclusionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/conclusions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            overallAverage: result.overallAverage,
            levelLabel: result.level.label,
            dimensions: result.dimensionScores.map((d) => {
              const meta = dimensions.find((x) => x.id === d.id);
              return {
                id: d.id,
                name: d.name,
                description: meta?.description ?? "",
                average: d.average,
                answered: d.answered,
                total: d.total,
              };
            }),
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(
            json?.error ?? "No se pudieron generar las conclusiones"
          );
        }
        if (!cancelled) setData(json as ConclusionsResponse);
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Error al generar conclusiones"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [result]);

  const radarData = result.dimensionScores.map((d) => ({
    label: dimensions.find((x) => x.id === d.id)?.shortName ?? d.name,
    value: d.average,
  }));

  const conclusionFor = (id: string) =>
    data?.dimensions.find((c) => c.id === id)?.conclusion;

  const exportDate = new Date().toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      {/* Encabezado visible solo al imprimir/exportar */}
      <div className="hidden print:mb-6 print:block">
        <h1 className="text-xl font-semibold">
          Informe de autoevaluación · Ley N° 21.719
        </h1>
        <p className="text-sm text-muted">
          Protección de Datos Personales de Chile · Generado el {exportDate}
        </p>
        <hr className="mt-3 border-border" />
      </div>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <p className="mb-2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Resultados · Ley N° 21.719
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Informe de cumplimiento
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Puntaje promedio, distribución por dimensión y conclusiones
            generadas con IA en base a tus respuestas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white/80 transition-colors hover:border-accent hover:text-accent"
          >
            Editar respuestas
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white/80 transition-colors hover:border-accent hover:text-accent"
          >
            Reiniciar
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            title={
              loading
                ? "Espera a que terminen de generarse las conclusiones"
                : "Exportar el informe a PDF"
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 17V3" />
              <path d="m6 11 6 6 6-6" />
              <path d="M19 21H5" />
            </svg>
            {loading ? "Generando…" : "Exportar a PDF"}
          </button>
        </div>
      </header>

      {/* Panel superior: puntaje + gráfico */}
      <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card-dark print-avoid-break flex flex-col items-center justify-center gap-4 rounded-2xl p-6 shadow-sm">
          <h2 className="self-start text-sm font-medium text-muted">
            Puntaje final promedio
          </h2>
          <ScoreGauge
            score={result.overallAverage}
            color={result.level.color}
          />
          <div className="text-center">
            <span
              className="inline-block rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                backgroundColor: result.level.color,
                color: textOn(result.level.color),
              }}
            >
              {result.level.label}
            </span>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {result.level.description}
            </p>
          </div>
        </div>

        <div className="card-dark print-avoid-break rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">
              Promedios por dimensión
            </h2>
            <span className="text-xs text-muted">Escala 1–5</span>
          </div>
          <div className="mx-auto w-full max-w-lg">
            <div style={{ aspectRatio: "500 / 420" }}>
              <RadarChart data={radarData} max={5} />
            </div>
          </div>
        </div>
      </section>

      {/* Conclusión general */}
      <section className="card-dark print-avoid-break mb-8 rounded-2xl p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Conclusión general</h2>
          {data && (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white/80">
              {data.source === "claude"
                ? "Generado con Claude"
                : "Análisis automático"}
            </span>
          )}
        </div>
        {loading ? (
          <HourglassLoader label="Generando conclusión general con Claude…" />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">
            {data?.overall}
          </p>
        )}
      </section>

      {/* Conclusiones por dimensión */}
      <section>
        <h2 className="mb-4 text-base font-semibold">
          Conclusiones por dimensión
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {result.dimensionScores.map((d) => (
            <div
              key={d.id}
              className="card-dark print-avoid-break flex flex-col rounded-2xl p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold leading-snug">{d.name}</h3>
                <span
                  className="shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold"
                  style={{
                    backgroundColor:
                      d.average > 0 ? scoreColor(d.average) : "#a1a1aa",
                    color:
                      d.average > 0 ? textOn(scoreColor(d.average)) : "#ffffff",
                  }}
                >
                  {d.average > 0 ? d.average.toFixed(1) : "–"}
                </span>
              </div>
              {loading ? (
                <HourglassLoader label="Analizando…" size={28} />
              ) : (
                <p className="text-sm leading-relaxed text-muted">
                  {conclusionFor(d.id) ?? "Sin conclusión disponible."}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-muted/70">
        Herramienta orientativa de autoevaluación. No constituye asesoría legal
        sobre la Ley N° 21.719.
      </footer>
    </main>
  );
}

function scoreColor(avg: number): string {
  if (avg < 2) return "#dc2626";
  if (avg < 3) return "#ea580c";
  if (avg < 4) return "#ca8a04";
  if (avg < 4.5) return "#16a34a";
  return "#d1ec51";
}

// Elige texto negro o blanco según la luminancia del fondo (contraste).
function textOn(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a1a" : "#ffffff";
}
