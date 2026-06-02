import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 es un módulo nativo: debe tratarse como externo en el
  // empaquetado del servidor para que funcione en runtime.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
