"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dimensions } from "@/data/survey";
import { getComplianceLevel } from "@/lib/scoring";
import RadarChart from "./RadarChart";
import ScoreGauge from "./ScoreGauge";
import HourglassLoader from "./HourglassLoader";

interface AssessmentDimension {
  id: string;
  name: string;
  average: number;
  answered: number;
  total: number;
}

interface Assessment {
  id: string;
  overallAverage: number;
  levelLabel: string;
  totalAnswered: number;
  totalQuestions: number;
  dimensions: AssessmentDimension[];
  createdAt: string;
}

const shortName = (id: string, fallback: string) =>
  dimensions.find((d) => d.id === id)?.shortName ?? fallback;

function scoreColor(avg: number): string {
  if (avg <= 0) return "#a1a1aa";
  if (avg < 2) return "#dc2626";
  if (avg < 3) return "#ea580c";
  if (avg < 4) return "#ca8a04";
  if (avg < 4.5) return "#16a34a";
  return "#d1ec51";
}

function textOn(hex: string): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#1a1a1a" : "#ffffff";
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function LastResult() {
  const [latest, setLatest] = useState<Assessment | null>(null);
  const [history, setHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((d) => {
        setLatest(d.latest ?? null);
        setHistory(d.history ?? []);
      })
      .catch(() => setError("No se pudo cargar el resultado"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-5 py-10 sm:px-8">
        <HourglassLoader label="Cargando último resultado…" />
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <div className="card-dark rounded-2xl p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-white">
            Aún no hay resultados
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Completa la autoevaluación para registrar tu primer resultado de
            cumplimiento de la Ley N° 21.719.
          </p>
          <Link
            href="/dashboard/encuesta"
            className="mt-5 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Iniciar autoevaluación
          </Link>
        </div>
      </div>
    );
  }

  const level = getComplianceLevel(latest.overallAverage);
  const radarData = latest.dimensions.map((d) => ({
    label: shortName(d.id, d.name),
    value: d.average,
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            Último resultado · Ley N° 21.719
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Resultado de la autoevaluación
          </h2>
          <p className="mt-2 text-sm text-muted">
            Realizada el {fmtDate(latest.createdAt)} · {latest.totalAnswered}/
            {latest.totalQuestions} preguntas respondidas.
          </p>
        </div>
        <Link
          href="/dashboard/encuesta"
          className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-accent hover:text-accent"
        >
          Nueva evaluación
        </Link>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {/* Puntaje + gráfico */}
      <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card-dark flex flex-col items-center justify-center gap-4 rounded-2xl p-6 shadow-sm">
          <h3 className="self-start text-sm font-medium text-muted">
            Puntaje final promedio
          </h3>
          <ScoreGauge score={latest.overallAverage} color={level.color} />
          <div className="text-center">
            <span
              className="inline-block rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                backgroundColor: level.color,
                color: textOn(level.color),
              }}
            >
              {level.label}
            </span>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {level.description}
            </p>
          </div>
        </div>

        <div className="card-dark rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted">
              Promedios por dimensión
            </h3>
            <span className="text-xs text-muted">Escala 1–5</span>
          </div>
          <div className="mx-auto w-full max-w-lg">
            <div style={{ aspectRatio: "500 / 420" }}>
              <RadarChart data={radarData} max={5} />
            </div>
          </div>
        </div>
      </section>

      {/* Desglose por dimensión */}
      <section className="mb-8">
        <h3 className="mb-4 text-base font-semibold text-white">
          Detalle por dimensión
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {latest.dimensions.map((d) => (
            <div key={d.id} className="card-dark rounded-xl p-4 shadow-sm">
              <span
                className="inline-block rounded-lg px-2 py-0.5 text-sm font-bold"
                style={{
                  backgroundColor: scoreColor(d.average),
                  color: textOn(scoreColor(d.average)),
                }}
              >
                {d.average > 0 ? d.average.toFixed(1) : "–"}
              </span>
              <p className="mt-2 text-xs font-medium leading-snug text-white">
                {shortName(d.id, d.name)}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {d.answered}/{d.total} resp.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Historial */}
      {history.length > 1 && (
        <section>
          <h3 className="mb-4 text-base font-semibold text-white">
            Historial de evaluaciones
          </h3>
          <div className="card-dark overflow-hidden rounded-2xl shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Puntaje</th>
                  <th className="px-4 py-3 font-medium">Nivel</th>
                  <th className="px-4 py-3 font-medium">Respondidas</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a, i) => {
                  const lvl = getComplianceLevel(a.overallAverage);
                  return (
                    <tr
                      key={a.id}
                      className={`border-b border-white/5 ${
                        i === 0 ? "bg-white/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-white/90">
                        {fmtDate(a.createdAt)}
                        {i === 0 && (
                          <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                            Actual
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {a.overallAverage.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: lvl.color,
                            color: textOn(lvl.color),
                          }}
                        >
                          {lvl.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {a.totalAnswered}/{a.totalQuestions}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
