import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  createAssessment,
  getLatestAssessment,
  listAssessments,
  NewAssessment,
} from "@/lib/assessments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession(req: NextRequest) {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

// GET /api/assessments            -> última evaluación + historial
// GET /api/assessments?all=1      -> historial completo (hasta 20)
export async function GET(req: NextRequest) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const latest = getLatestAssessment();
  const history = listAssessments(20);
  return NextResponse.json({ latest, history });
}

// POST /api/assessments -> guarda una nueva evaluación
export async function POST(req: NextRequest) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: NewAssessment;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (
    typeof body.overallAverage !== "number" ||
    !Array.isArray(body.dimensions)
  ) {
    return NextResponse.json(
      { error: "Datos de evaluación incompletos" },
      { status: 400 }
    );
  }

  const saved = createAssessment(body);
  return NextResponse.json({ assessment: saved }, { status: 201 });
}
