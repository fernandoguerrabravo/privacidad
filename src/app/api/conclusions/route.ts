import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const LOG = "[Claude]"; // prefijo para identificar los logs de conexión

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
  reason?: string; // por qué se usó el respaldo (solo cuando source === "fallback")
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

  // En producción, Claude es la ÚNICA fuente: no se usa el respaldo local.
  // (Se puede forzar también en dev con ANTHROPIC_REQUIRED=true).
  const requireClaude =
    process.env.NODE_ENV === "production" ||
    process.env.ANTHROPIC_REQUIRED === "true";

  // Log de configuración de la conexión (sin exponer el secreto).
  console.log(
    `${LOG} entorno=${process.env.NODE_ENV} modeloClaude=${MODEL} ` +
      `apiKey=${apiKey ? `presente(${apiKey.slice(0, 7)}…, ${apiKey.length} chars)` : "AUSENTE"} ` +
      `modoEstricto=${requireClaude}`
  );

  if (!apiKey) {
    if (requireClaude) {
      console.error(
        `${LOG} ❌ No hay ANTHROPIC_API_KEY y el modo estricto está activo. No se generan conclusiones.`
      );
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY no está configurada en el servidor. Las conclusiones requieren Claude.",
        },
        { status: 503 }
      );
    }
    console.warn(
      `${LOG} ⚠️ Sin ANTHROPIC_API_KEY: usando respaldo local (solo desarrollo).`
    );
    return NextResponse.json(buildFallback(body, "Sin ANTHROPIC_API_KEY"));
  }

  try {
    const started = Date.now();
    console.log(`${LOG} → Conectando a Claude (${ANTHROPIC_URL})…`);
    const result = await generateWithClaude(apiKey, body);
    console.log(
      `${LOG} ✅ Conclusiones generadas por Claude en ${Date.now() - started}ms ` +
        `(dimensiones=${result.dimensions.length}).`
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error(`${LOG} ❌ Error al generar con Claude: ${message}`);

    if (requireClaude) {
      // En modo estricto el fallo se propaga al cliente (no hay respaldo).
      return NextResponse.json(
        { error: `No se pudo generar con Claude: ${message}` },
        { status: 502 }
      );
    }
    // Modo tolerante (solo desarrollo): respaldo local indicando el motivo.
    console.warn(`${LOG} ⚠️ Usando respaldo local tras el fallo de Claude.`);
    return NextResponse.json(buildFallback(body, message));
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

  const res = await fetchWithRetry({
    apiKey,
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

  // Log de uso de tokens y modelo que confirma una respuesta real de Claude.
  if (data?.usage) {
    console.log(
      `${LOG}   modelo=${data.model ?? MODEL} ` +
        `tokens_entrada=${data.usage.input_tokens} ` +
        `tokens_salida=${data.usage.output_tokens} ` +
        `stop=${data.stop_reason ?? "?"}`
    );
  }

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

// Llama a la API de Anthropic con timeout y un reintento ante fallos de red
// o errores transitorios (429/5xx), para mayor robustez en producción.
async function fetchWithRetry({
  apiKey,
  body,
  attempts = 3,
  timeoutMs = 40000,
}: {
  apiKey: string;
  body: string;
  attempts?: number;
  timeoutMs?: number;
}): Promise<Response> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      console.log(
        `${LOG}   intento ${i + 1}/${attempts} → POST ${ANTHROPIC_URL} (timeout ${timeoutMs}ms)`
      );
      const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      console.log(
        `${LOG}   intento ${i + 1}: respuesta HTTP ${res.status} ${res.statusText}`
      );

      // Reintenta solo ante errores transitorios.
      if ((res.status === 429 || res.status >= 500) && i < attempts - 1) {
        console.warn(
          `${LOG}   estado transitorio (${res.status}); reintentando…`
        );
        await new Promise((r) => setTimeout(r, 800 * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const msg = err instanceof Error ? err.message : "error";
      console.warn(`${LOG}   intento ${i + 1} falló: ${msg}`);
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 800 * (i + 1)));
        continue;
      }
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Fallo de red hacia Anthropic: ${lastError.message}`
      : "Fallo de red hacia Anthropic"
  );
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

// Conclusiones locales por reglas. Solo se usan en desarrollo cuando no hay
// API key o falla Claude. En producción Claude es la única fuente.
function buildFallback(body: RequestBody, reason?: string): ConclusionsResponse {
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
    reason,
  };
}
