"use client";

interface ScoreGaugeProps {
  score: number; // 0 - 5
  max?: number;
  color: string;
  size?: number;
}

export default function ScoreGauge({
  score,
  max = 5,
  color,
  size = 160,
}: ScoreGaugeProps) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(score / max, 1) : 0;
  const offset = circumference * (1 - ratio);
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-foreground">
          {score > 0 ? score.toFixed(1) : "–"}
        </span>
        <span className="text-xs text-muted">de {max.toFixed(1)}</span>
      </div>
    </div>
  );
}
