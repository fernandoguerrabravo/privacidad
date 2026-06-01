import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // nunca cachear el diagnóstico

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

// Enmascara un secreto mostrando solo prefijo y longitud (nunca el valor).
function mask(value: string | undefined): string | null {
  if (!value) return null;
  const prefix = value.slice(0, 7);
  return `${prefix}…(${value.length} chars)`;
}

export async function GET(req: NextRequest) {
  // Solo accesible con sesión válida (evita exponer config públicamente).
  const session = await verifySessionToken(
    req.cookies.get(SESSION_COOKIE)?.value
  );
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  const env = {
    ANTHROPIC_API_KEY: {
      present: Boolean(apiKey),
      preview: mask(apiKey), // ej: "sk-ant-…(108 chars)" — sin exponer el secreto
    },
    AUTH_USERNAME: { present: Boolean(process.env.AUTH_USERNAME) },
    AUTH_PASSWORD: { present: Boolean(process.env.AUTH_PASSWORD) },
    AUTH_SECRET: { present: Boolean(process.env.AUTH_SECRET) },
    NODE_ENV: process.env.NODE_ENV,
  };

  // ?ping=1 hace una llamada real mínima a Claude para verificar conectividad.
  const doPing = req.nextUrl.searchParams.get("ping") === "1";
  let claude: {
    checked: boolean;
    ok?: boolean;
    status?: number;
    error?: string;
  } = { checked: false };

  if (doPing) {
    if (!apiKey) {
      claude = { checked: true, ok: false, error: "No hay ANTHROPIC_API_KEY" };
    } else {
      try {
        const res = await fetch(ANTHROPIC_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 5,
            messages: [{ role: "user", content: "ping" }],
          }),
        });
        claude = { checked: true, ok: res.ok, status: res.status };
        if (!res.ok) {
          const text = await res.text();
          claude.error = text.slice(0, 300);
        }
      } catch (e) {
        claude = {
          checked: true,
          ok: false,
          error: e instanceof Error ? e.message : "Error de red",
        };
      }
    }
  }

  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    env,
    claude,
  });
}
