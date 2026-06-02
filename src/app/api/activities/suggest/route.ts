import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const LOG = "[Claude/sugerencias]";

interface DimensionPayload {
  id: string;
  name: string;
  description: string;
  average: number;
}

interface RequestBody {
  overallAverage: number;
  levelLabel: string;
  dimensions: DimensionPayload[];
}

interface SuggestedActivity {
  dimension_id: string;
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
}

export async function POST(req: NextRequest) {
  if (!(await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
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
  const requireClaude =
    process.env.NODE_ENV === "production" ||
    process.env.ANTHROPIC_REQUIRED === "true";

  if (!apiKey) {
    if (requireClaude) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no configurada. Las sugerencias requieren Claude." },
        { status: 503 }
      );
    }
    return NextResponse.json({ activities: buildFallback(body), source: "fallback" });
  }

  try {
    const started = Date.now();
    console.log(`${LOG} → solicitando sugerencias de actividades a Claude…`);
    const activities = await suggestWithClaude(apiKey, body);
    console.log(
      `${LOG} ✅ ${activities.length} actividades sugeridas en ${Date.now() - started}ms`
    );
    return NextResponse.json({ activities, source: "claude" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error(`${LOG} ❌ ${message}`);
    if (requireClaude) {
      return NextResponse.json(
        { error: `No se pudieron generar sugerencias con Claude: ${message}` },
        { status: 502 }
      );
    }
    return NextResponse.json({ activities: buildFallback(body), source: "fallback" });
  }
}

async function suggestWithClaude(
  apiKey: string,
  body: RequestBody
): Promise<SuggestedActivity[]> {
  const dims = body.dimensions
    .map(
      (d) =>
        `- ${d.name} (id: ${d.id}): puntaje ${d.average.toFixed(1)}/5. Enfoque: ${d.description}`
    )
    .join("\n");

  const prompt = `Eres consultor experto en la Ley N° 21.719 de Protección de Datos Personales de Chile. Una empresa completó una autoevaluación (escala 1 a 5). Debes proponer un PLAN DE ACCIÓN de implementación con actividades concretas para cerrar las brechas, priorizando las dimensiones con menor puntaje.

Puntaje global: ${body.overallAverage.toFixed(1)}/5 (nivel: ${body.levelLabel}).
Dimensiones:
${dims}

Genera entre 2 y 4 actividades por dimensión (más actividades y mayor prioridad cuando el puntaje sea más bajo). Cada actividad debe ser accionable, específica y realista para una empresa en Chile.

Responde EXCLUSIVAMENTE en JSON válido, sin markdown ni texto adicional, con esta estructura:
{
  "activities": [
    {
      "dimension_id": "string (usa el id exacto entregado)",
      "title": "string (acción breve, máx 90 caracteres)",
      "description": "string (1-2 frases con el cómo)",
      "priority": "alta | media | baja"
    }
  ]
}
Escribe en español de Chile, tono profesional.`;

  const res = await anthropicFetchWithRetry(apiKey, {
    model: MODEL,
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data?.usage) {
    console.log(
      `${LOG}   tokens_entrada=${data.usage.input_tokens} tokens_salida=${data.usage.output_tokens}`
    );
  }
  const text: string =
    data?.content?.map((c: { text?: string }) => c.text ?? "").join("") ?? "";

  const parsed = extractJson(text);
  if (!parsed?.activities || !Array.isArray(parsed.activities)) {
    throw new Error("Respuesta del modelo sin actividades válidas");
  }

  const validIds = new Set(body.dimensions.map((d) => d.id));
  return parsed.activities
    .filter((a) => a?.dimension_id && a?.title && validIds.has(a.dimension_id))
    .map((a) => ({
      dimension_id: String(a.dimension_id),
      title: String(a.title).slice(0, 120),
      description: String(a.description ?? ""),
      priority: ["alta", "media", "baja"].includes(a.priority)
        ? (a.priority as SuggestedActivity["priority"])
        : "media",
    }));
}

// Llama a la API de Anthropic con timeout y reintentos ante fallos de red
// o errores transitorios (429/5xx), para mayor robustez en producción.
async function anthropicFetchWithRetry(
  apiKey: string,
  payload: object,
  attempts = 3,
  timeoutMs = 40000
): Promise<Response> {
  let lastError: unknown;
  const body = JSON.stringify(payload);

  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      console.log(`${LOG}   intento ${i + 1}/${attempts} → POST Anthropic`);
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

      if ((res.status === 429 || res.status >= 500) && i < attempts - 1) {
        console.warn(`${LOG}   estado ${res.status}; reintentando…`);
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const msg = err instanceof Error ? err.message : "error";
      console.warn(`${LOG}   intento ${i + 1} falló: ${msg}`);
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
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

function extractJson(
  text: string
): { activities?: SuggestedActivity[] } | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

// Sugerencias locales (solo desarrollo sin key): una actividad genérica por dimensión.
function buildFallback(body: RequestBody): SuggestedActivity[] {
  return body.dimensions.map((d) => ({
    dimension_id: d.id,
    title: `Plan de mejora para ${d.name}`,
    description: `Definir y documentar acciones para fortalecer "${d.name}" (puntaje ${d.average.toFixed(
      1
    )}/5).`,
    priority: d.average < 2.5 ? "alta" : d.average < 3.5 ? "media" : "baja",
  }));
}
