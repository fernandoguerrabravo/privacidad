"use client";

import { useMemo, useState } from "react";
import { dimensions, totalQuestions, SCALE_LABELS } from "@/data/survey";
import { computeResult } from "@/lib/scoring";
import RatingScale from "./RatingScale";
import Results from "./Results";

type View = "survey" | "results";

export default function Survey() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [view, setView] = useState<View>("survey");
  const [showErrors, setShowErrors] = useState(false);

  const result = useMemo(
    () => computeResult(dimensions, answers),
    [answers]
  );

  const progress = Math.round(
    (result.totalAnswered / totalQuestions) * 100
  );
  const allAnswered = result.totalAnswered === totalQuestions;
  const remaining = totalQuestions - result.totalAnswered;

  // Indica si una pregunta concreta está pendiente.
  const isUnanswered = (questionId: string) =>
    typeof answers[questionId] !== "number";

  // Cuenta de preguntas pendientes por dimensión (para el aviso por bloque).
  const pendingByDimension = (dimensionId: string) => {
    const dim = dimensions.find((d) => d.id === dimensionId);
    if (!dim) return 0;
    return dim.questions.filter((q) => isUnanswered(q.id)).length;
  };

  const handleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleReset = () => {
    setAnswers({});
    setShowErrors(false);
    setView("survey");
  };

  // Solo permite ver resultados si están todas respondidas.
  const handleSubmit = () => {
    if (allAnswered) {
      setShowErrors(false);
      setView("results");
      return;
    }
    // Falta responder: muestra los errores y lleva a la primera pendiente.
    setShowErrors(true);
    const firstPending = dimensions
      .flatMap((d) => d.questions)
      .find((q) => isUnanswered(q.id));
    if (firstPending) {
      const el = document.getElementById(`q-${firstPending.id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (view === "results") {
    return (
      <Results
        result={result}
        onBack={() => setView("survey")}
        onReset={handleReset}
      />
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      {/* Encabezado */}
      <header className="mb-8">
        <p className="mb-2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          Protección de Datos · Chile
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Autoevaluación Ley N° 21.719
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Responde cada afirmación según el nivel de cumplimiento de tu empresa,
          en una escala de 1 a 5. Al finalizar obtendrás tu puntaje promedio, un
          gráfico por dimensiones y conclusiones generadas con IA.
        </p>
      </header>

      {/* Barra de progreso fija contextual */}
      <div className="sticky top-0 z-20 -mx-5 mb-6 border-b border-border bg-background/90 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progreso</span>
          <span className="text-muted">
            {result.totalAnswered} de {totalQuestions} ({progress}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Leyenda de la escala */}
      <section className="card-dark mb-6 rounded-2xl p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-muted">
          Escala de evaluación
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent font-semibold text-accent-foreground">
                {s}
              </span>
              <span className="text-muted">{SCALE_LABELS[s]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Encuesta */}
      <section className="space-y-6">
        {dimensions.map((dim, index) => {
          const pending = pendingByDimension(dim.id);
          const dimComplete = pending === 0;
          return (
            <div
              key={dim.id}
              className={`card-dark rounded-2xl p-6 shadow-sm ${
                showErrors && !dimComplete
                  ? "ring-2 ring-red-500/60"
                  : ""
              }`}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {index + 1}
                    </span>
                    {dim.name}
                  </h3>
                  {dimComplete ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold text-accent">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Completo
                    </span>
                  ) : (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        showErrors
                          ? "bg-red-500/20 text-red-300"
                          : "bg-white/10 text-white/70"
                      }`}
                    >
                      Faltan {pending}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {dim.description}
                </p>
              </div>

              <div className="divide-y divide-border">
                {dim.questions.map((q) => {
                  const missing = showErrors && isUnanswered(q.id);
                  return (
                    <div
                      key={q.id}
                      id={`q-${q.id}`}
                      className={`flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between ${
                        missing ? "-mx-3 rounded-lg bg-red-500/10 px-3" : ""
                      }`}
                    >
                      <div className="max-w-xl">
                        <p className="text-sm leading-relaxed">{q.text}</p>
                        {missing && (
                          <p className="mt-1 text-xs font-medium text-red-300">
                            Esta pregunta es obligatoria.
                          </p>
                        )}
                      </div>
                      <RatingScale
                        name={q.text}
                        value={answers[q.id]}
                        onChange={(v) => handleChange(q.id, v)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Acciones */}
      <section className="mt-8 flex flex-col items-center gap-3">
        {allAnswered ? (
          <p className="inline-flex items-center gap-2 text-xs font-medium text-accent">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Respondiste las {totalQuestions} preguntas. Ya puedes ver tus
            resultados.
          </p>
        ) : (
          <p
            className={`text-xs ${
              showErrors ? "font-medium text-red-300" : "text-muted"
            }`}
          >
            Debes responder las {totalQuestions} preguntas para continuar. Te
            faltan {remaining}.
          </p>
        )}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-white/20 bg-transparent px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-accent hover:text-accent"
          >
            Reiniciar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            aria-disabled={!allAnswered}
            className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition-colors ${
              allAnswered
                ? "bg-accent text-accent-foreground hover:bg-accent-dark"
                : "cursor-not-allowed bg-accent/40 text-accent-foreground/60"
            }`}
          >
            Aceptar y ver resultados
          </button>
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-muted/70">
        Herramienta orientativa de autoevaluación. No constituye asesoría legal
        sobre la Ley N° 21.719.
      </footer>
    </main>
  );
}
