import { NextResponse } from "next/server";

/**
 * Endpoint de diagnóstico: devuelve la versión del código desplegado.
 * Sirve para confirmar qué commit está sirviendo el hosting.
 */
export function GET() {
  return NextResponse.json({
    version: "2-memory-only",
    persistence: "memory (disco solo si es escribible)",
  });
}
