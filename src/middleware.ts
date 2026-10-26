import { NextResponse, type NextRequest } from "next/server";

/**
 * MIDDLEWARE — Guardia de rutas (Capítulo 5).
 *
 * Se ejecuta antes de cada petición a las rutas indicadas en `config.matcher`.
 * Hace una comprobación RÁPIDA: ¿existe la cookie de sesión? Si no, redirige
 * al login sin siquiera cargar la página.
 *
 * Importante: el middleware NO valida la firma de la cookie ni consulta el
 * almacenamiento (corre en el entorno Edge). Esa validación completa la hace
 * la propia página en el servidor. Es la defensa en capas: el middleware
 * filtra lo evidente; la página confirma de verdad.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("session");

  if (!hasSession) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Solo protege las rutas privadas.
  matcher: ["/tasks/:path*"],
};
