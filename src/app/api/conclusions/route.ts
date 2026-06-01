import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

interface DimensionPayload {
  id: string;
  name: string;
  description: string;
  average: number;
  answered: number;
  total: number;
}

interface RequestBody {
  overallAverage: number;
  levelLabel: string;
  dimensions: DimensionPayload[];
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

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body?.dimensions?.length) {
    return NextResponse.json(
      { error: "Faltan datos de dimensiones" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Sin API key: usamos conclusiones locales basadas en reglas.
  if (!apiKey) {
    return NextResponse.json(buildFallback(body));
  }

  try {
    const result = await generateWithClaude(apiKey, body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Error al generar con Claude:", err);
    // Ante cualquier fallo, no rompemos la experiencia.
    return NextResponse.json(buildFallback(body));
  }
}

async function generateWithClaude(
  apiKey: string,
  body: RequestBody
): Promise<ConclusionsResponse> {
  const dimensionsText = body.dimensions
    .map(
      (d) =>
        `- ${d.name} (id: ${d.id}): promedio ${d.average.toFixed(
          1
        )}/5, ${d.answered}/${d.total} preguntas respondidas. Enfoque: ${
          d.description
        }`
    )
    .join("\n");

  const prompt = `Eres un consultor experto en la Ley N° 21.719 de Protección de Datos Personales de Chile. Una empresa completó una autoevaluación con puntajes de 1 (no cumple) a 5 (cumple completamente).

Puntaje global: ${body.overallAverage.toFixed(1)}/5 (nivel: ${body.levelLabel}).

Resultados por dimensión:
${dimensionsText}

Genera una conclusión breve, concreta y accionable para CADA dimensión (2 a 3 frases cada una), considerando su puntaje. Incluye al menos una recomendación práctica por dimensión. Además, redacta una conclusión general (3 a 4 frases).

Responde EXCLUSIVAMENTE en JSON válido con esta estructura exacta, sin texto adicional ni markdown:
{
  "overall": "string",
  "dimensions": [ { "id": "string", "conclusion": "string" } ]
}
Usa los mismos id de dimensión entregados. Escribe en español de Chile, tono profesional y claro.`;

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text: string =
    data?.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";

  const parsed = extractJson(text);
  if (!parsed) {
    throw new Error("No se pudo parsear la respuesta del modelo");
  }

  return {
    overall: String(parsed.overall ?? ""),
    dimensions: Array.isArray(parsed.dimensions)
      ? parsed.dimensions.map((d: ConclusionItem) => ({
          id: String(d.id),
          conclusion: String(d.conclusion ?? ""),
        }))
      : [],
    source: "claude",
  };
}

// Extrae el primer objeto JSON presente en el texto del modelo.
function extractJson(text: string): {
  overall?: string;
  dimensions?: ConclusionItem[];
} | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Conclusiones locales por reglas, usadas cuando no hay API key o falla Claude.
function buildFallback(body: RequestBody): ConclusionsResponse {
  const phraseFor = (avg: number, name: string): string => {
    if (avg <= 0)
      return `No hay respuestas suficientes en "${name}" para concluir. Completa esta dimensión para obtener una evaluación.`;
    if (avg < 2)
      return `"${name}" presenta un cumplimiento crítico (${avg.toFixed(
        1
      )}/5). Prioriza definir políticas y controles básicos en esta área de forma urgente.`;
    if (avg < 3)
      return `"${name}" muestra avances iniciales (${avg.toFixed(
        1
      )}/5), pero con brechas relevantes. Formaliza procedimientos y asigna responsables.`;
    if (avg < 4)
      return `"${name}" tiene un cumplimiento intermedio (${avg.toFixed(
        1
      )}/5). Refuerza la documentación y la consistencia de los procesos existentes.`;
    if (avg < 4.5)
      return `"${name}" está en buen nivel (${avg.toFixed(
        1
      )}/5). Mantén la mejora continua y realiza auditorías periódicas.`;
    return `"${name}" alcanza un cumplimiento óptimo (${avg.toFixed(
      1
    )}/5). Sostén las buenas prácticas y monitorea cambios normativos.`;
  };

  return {
    overall: `El puntaje global es ${body.overallAverage.toFixed(
      1
    )}/5 (nivel ${
      body.levelLabel
    }). Revisa las dimensiones con menor puntaje y establece un plan de acción priorizado para fortalecer el cumplimiento de la Ley N° 21.719.`,
    dimensions: body.dimensions.map((d) => ({
      id: d.id,
      conclusion: phraseFor(d.average, d.name),
    })),
    source: "fallback",
  };
}
