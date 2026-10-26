import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mis Tareas — App del libro Next.js",
  description:
    "Aplicación de ejemplo del libro \"Next.js de Cero a Producción\": lista de tareas con autenticación y el patrón BFF.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
