import { NextRequest, NextResponse } from "next/server";
import {
  checkCredentials,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Ingresa usuario y contraseña" },
      { status: 400 }
    );
  }

  if (!checkCredentials(username, password)) {
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos" },
      { status: 401 }
    );
  }

  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
