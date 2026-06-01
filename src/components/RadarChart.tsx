"use client";

interface RadarPoint {
  label: string;
  value: number; // 0 - max
}

interface RadarChartProps {
  data: RadarPoint[];
  max?: number;
}

// viewBox amplio para que las etiquetas laterales nunca se recorten.
const VB_WIDTH = 500;
const VB_HEIGHT = 420;
const CENTER_X = VB_WIDTH / 2;
const CENTER_Y = VB_HEIGHT / 2 + 4;
const RADIUS = 120;
const LABEL_OFFSET = 30;

export default function RadarChart({ data, max = 5 }: RadarChartProps) {
  const levels = max; // un anillo por cada nivel (1..5)
  const angleStep = (Math.PI * 2) / data.length;

  // Empieza arriba (-90°) y avanza en sentido horario.
  const pointFor = (index: number, valueRatio: number) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const r = RADIUS * valueRatio;
    return {
      x: CENTER_X + r * Math.cos(angle),
      y: CENTER_Y + r * Math.sin(angle),
    };
  };

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const ratio = (l + 1) / levels;
    return data
      .map((_, i) => {
        const p = pointFor(i, ratio);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  });

  const axisLines = data.map((_, i) => pointFor(i, 1));

  const valuePoints = data.map((d, i) =>
    pointFor(i, max > 0 ? d.value / max : 0)
  );
  const valuePolygon = valuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  const labelPositions = data.map((d, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = CENTER_X + (RADIUS + LABEL_OFFSET) * cos;
    const y = CENTER_Y + (RADIUS + LABEL_OFFSET) * sin;

    let anchor: "start" | "middle" | "end" = "middle";
    if (cos > 0.25) anchor = "start";
    else if (cos < -0.25) anchor = "end";

    return { x, y, anchor, label: d.label, value: d.value, sin };
  });

  return (
    <svg
      viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Gráfico radial de promedios por dimensión"
    >
      {/* Anillos de la grilla */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={`grid-${i}`}
          points={pts}
          fill={i === levels - 1 ? "rgba(255,255,255,0.04)" : "none"}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />
      ))}

      {/* Ejes radiales */}
      {axisLines.map((p, i) => (
        <line
          key={`axis-${i}`}
          x1={CENTER_X}
          y1={CENTER_Y}
          x2={p.x}
          y2={p.y}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />
      ))}

      {/* Área de valores */}
      <polygon
        points={valuePolygon}
        fill="rgba(209, 236, 81, 0.22)"
        stroke="#d1ec51"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* Vértices */}
      {valuePoints.map((p, i) => (
        <circle key={`pt-${i}`} cx={p.x} cy={p.y} r={3.5} fill="#d1ec51" />
      ))}

      {/* Etiquetas con su puntaje */}
      {labelPositions.map((l, i) => {
        const lines = wrapLabel(l.label);
        // Ajuste vertical para etiquetas superiores/inferiores con 2 líneas.
        const baseDy = l.sin < -0.3 ? -(lines.length - 1) * 1.1 : 0;
        return (
          <text
            key={`label-${i}`}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor}
            dominantBaseline="middle"
            fontSize={13}
            fill="#ffffff"
          >
            {lines.map((line, li) => (
              <tspan
                key={li}
                x={l.x}
                dy={li === 0 ? `${baseDy}em` : "1.15em"}
                fontWeight={500}
              >
                {line}
              </tspan>
            ))}
            <tspan
              x={l.x}
              dy="1.25em"
              fontSize={12}
              fontWeight={700}
              fill="#d1ec51"
            >
              {l.value > 0 ? l.value.toFixed(1) : "–"}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}

// Divide etiquetas largas en máximo dos líneas para que quepan.
function wrapLabel(label: string): string[] {
  const words = label.split(" ");
  if (label.length <= 18 || words.length === 1) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}
