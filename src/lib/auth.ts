// Autenticación simple basada en cookie con sesión firmada (HMAC-SHA256).
// Funciona tanto en el runtime de Node como en el Edge (middleware),
// usando la Web Crypto API.
//
// NOTA: Esto es una autenticación básica pensada para demo / uso interno.
// Para producción conviene un proveedor de identidad real (OAuth, etc.),
// almacenamiento de usuarios con hash de contraseñas y rotación de secretos.

const encoder = new TextEncoder();
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas en segundos

export const SESSION_COOKIE = "session";

function getSecret(): string {
  return process.env.AUTH_SECRET || "dev-secret-cambia-esto-en-produccion";
}

export function getCredentials(): { username: string; password: string } {
  return {
    username: process.env.AUTH_USERNAME || "admin",
    password: process.env.AUTH_PASSWORD || "admin123",
  };
}

export function checkCredentials(username: string, password: string): boolean {
  const c = getCredentials();
  return username === c.username && password === c.password;
}

export interface SessionData {
  u: string; // username
  iat: number; // emitido en (ms)
}

// ---- helpers base64url (compatibles con Edge y Node) ----
function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64url(new Uint8Array(sig));
}

export async function createSessionToken(username: string): Promise<string> {
  const payloadObj: SessionData = { u: username, iat: Date.now() };
  const payload = base64url(encoder.encode(JSON.stringify(payloadObj)));
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionData | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = await hmac(payload);
  // Comparación de longitud + contenido (suficiente para este caso).
  if (expected.length !== sig.length || expected !== sig) return null;

  try {
    const data = JSON.parse(
      new TextDecoder().decode(fromBase64url(payload))
    ) as SessionData;

    // Expiración por tiempo de emisión.
    if (Date.now() - data.iat > SESSION_MAX_AGE * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};
