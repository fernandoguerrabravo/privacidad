import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  listActivities,
  createActivity,
  createManyActivities,
  NewActivity,
} from "@/lib/activities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession(req: NextRequest) {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function GET(req: NextRequest) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ activities: listActivities() });
}

export async function POST(req: NextRequest) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: NewActivity | { activities: NewActivity[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Soporta crear una o varias actividades (estas últimas para sugerencias).
  if ("activities" in body && Array.isArray(body.activities)) {
    const valid = body.activities.filter((a) => a?.dimension_id && a?.title);
    if (!valid.length) {
      return NextResponse.json(
        { error: "No hay actividades válidas" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { activities: createManyActivities(valid) },
      { status: 201 }
    );
  }

  const single = body as NewActivity;
  if (!single.dimension_id || !single.title?.trim()) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios (dimensión y título)" },
      { status: 400 }
    );
  }
  return NextResponse.json({ activity: createActivity(single) }, { status: 201 });
}
