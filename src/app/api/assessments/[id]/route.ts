import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getAssessment, setAssessmentConclusions } from "@/lib/assessments";
import { AssessmentConclusions } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession(req: NextRequest) {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const assessment = getAssessment(id);
  if (!assessment) {
    return NextResponse.json(
      { error: "Evaluación no encontrada" },
      { status: 404 }
    );
  }
  return NextResponse.json({ assessment });
}

// PATCH -> adjunta las conclusiones generadas por Claude a la evaluación.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;

  let body: { conclusions?: AssessmentConclusions };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.conclusions) {
    return NextResponse.json(
      { error: "Faltan las conclusiones" },
      { status: 400 }
    );
  }

  const ok = setAssessmentConclusions(id, body.conclusions);
  if (!ok) {
    return NextResponse.json(
      { error: "Evaluación no encontrada" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
