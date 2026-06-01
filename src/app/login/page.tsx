import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-lg font-bold text-accent-foreground">
            BT
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            Baker Tilly · Ley N° 21.719
          </h1>
          <p className="mt-1 text-sm text-muted">
            Protección de Datos Personales · Chile
          </p>
        </div>

        <div className="card-dark rounded-2xl p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold">Iniciar sesión</h2>
          <p className="mb-5 text-sm text-muted">
            Ingresa tus credenciales para acceder al panel.
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-muted/70">
          Acceso restringido. Herramienta orientativa de autoevaluación.
        </p>
      </div>
    </main>
  );
}
