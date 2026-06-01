import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baker Tilly · Autoevaluación Ley N° 21.719",
  description:
    "Sistema de autoevaluación del cumplimiento de la Ley N° 21.719 de Protección de Datos Personales de Chile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
