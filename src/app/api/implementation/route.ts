import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import {
  getProgress,
  toggleItem,
  updateItemNotes,
  resetAllProgress,
} from "@/lib/implementation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireSession(req: NextRequest) {
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
}

// GET -> progreso actual de todos los items
export async function GET(req: NextRequest) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ progress: getProgress() });
}

// POST -> toggle un item o actualizar notas
export async function POST(req: NextRequest) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { itemId?: string; completed?: boolean; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.itemId) {
    return NextResponse.json({ error: "Falta itemId" }, { status: 400 });
  }

  if (typeof body.completed === "boolean") {
    const item = toggleItem(body.itemId, body.completed, body.notes);
    return NextResponse.json({ item });
  }

  if (body.notes !== undefined) {
    updateItemNotes(body.itemId, body.notes);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Falta completed o notes" },
    { status: 400 }
  );
}

// DELETE -> reiniciar todo el progreso
export async function DELETE(req: NextRequest) {
  if (!(await requireSession(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  resetAllProgress();
  return NextResponse.json({ ok: true });
}
