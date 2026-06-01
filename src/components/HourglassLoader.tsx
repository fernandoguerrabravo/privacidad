"use client";

interface HourglassLoaderProps {
  label?: string;
  size?: number;
}

// Reloj de arena animado que gira mientras se espera la respuesta de Claude.
export default function HourglassLoader({
  label = "Generando conclusiones con Claude…",
  size = 40,
}: HourglassLoaderProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-6 text-center"
      role="status"
      aria-live="polite"
    >
      <svg
        className="animate-hourglass"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d1ec51"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {/* Marco del reloj de arena */}
        <path d="M6 2h12" />
        <path d="M6 22h12" />
        <path d="M6 2c0 4 3 6 6 10 3-4 6-6 6-10" />
        <path d="M6 22c0-4 3-6 6-10 3 4 6 6 6 10" />
        {/* Arena cayendo (parpadea) */}
        <line
          className="animate-sand"
          x1="12"
          y1="11"
          x2="12"
          y2="15"
          stroke="#c2de3f"
        />
      </svg>
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}
