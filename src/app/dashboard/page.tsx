import Link from "next/link";
import { dimensions, totalQuestions } from "@/data/survey";

export default function DashboardHome() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      {/* Bienvenida */}
      <section className="mb-8">
        <p className="mb-2 inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          Protección de Datos · Chile
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          Bienvenido al panel
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Desde aquí puedes iniciar la autoevaluación del cumplimiento de la Ley
          N° 21.719 de tu empresa y revisar los resultados con conclusiones
          generadas por IA.
        </p>
      </section>

      {/* Métricas rápidas */}
      <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Dimensiones" value={`${dimensions.length}`} />
        <StatCard label="Preguntas" value={`${totalQuestions}`} />
        <StatCard label="Escala" value="1–5" />
        <StatCard label="Informe" value="PDF" />
      </section>

      {/* Acceso a la encuesta */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Link
          href="/dashboard/encuesta"
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-green p-6 shadow-sm transition-all hover:bg-brand-green-dark lg:col-span-2"
        >
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-midnight/15 text-midnight">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3 8-8" />
                <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-midnight">
              Iniciar autoevaluación Ley N° 21.719
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-midnight/80">
              Responde {totalQuestions} preguntas agrupadas en{" "}
              {dimensions.length} dimensiones. Obtén tu puntaje promedio, un
              gráfico radial y conclusiones por dimensión.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-midnight">
            Comenzar encuesta
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        {/* Dimensiones evaluadas */}
        <div className="card-dark rounded-2xl p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-muted">
            Dimensiones evaluadas
          </h3>
          <ul className="space-y-2.5">
            {dimensions.map((d, i) => (
              <li key={d.id} className="flex items-center gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <span className="leading-snug">{d.shortName}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark rounded-2xl border-l-4 border-l-accent p-5 shadow-sm">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted">{label}</p>
    </div>
  );
}
