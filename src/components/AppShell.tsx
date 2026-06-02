"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconProps}>
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/encuesta",
    label: "Autoevaluación",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconProps}>
        <path d="M9 11l3 3 8-8" />
        <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
      </svg>
    ),
  },
  {
    href: "/dashboard/plan",
    label: "Plan de acción",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconProps}>
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <path d="M9 3h6v4H9z" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
];

export default function AppShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green text-sm font-bold text-midnight">
          BT
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Baker Tilly</p>
          <p className="text-[11px] text-white/55">Ley N° 21.719 · Chile</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-brand-green text-midnight"
                : "text-white/70 hover:bg-white/10 hover:text-brand-green"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-brand-green"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconProps}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar escritorio (fijo, con scroll propio si hiciera falta) */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-card lg:flex">
        {SidebarContent}
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col overflow-y-auto bg-card shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Columna principal */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header (fijo arriba de la columna) */}
        <header className="z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-card px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg border border-white/20 p-2 text-brand-green hover:bg-white/10 lg:hidden"
              aria-label="Abrir menú"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" {...iconProps}>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <h1 className="text-sm font-semibold text-white sm:text-base">
              {pageTitle(pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-white">
                {username}
              </p>
              <p className="text-[11px] text-white/55">Sesión activa</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-semibold uppercase text-midnight">
              {username.slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Contenido con scroll independiente */}
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}

function pageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/encuesta")) return "Autoevaluación";
  if (pathname.startsWith("/dashboard/plan")) return "Plan de acción";
  return "Panel de control";
}
