import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

/**
 * PORTADA — Server Component (Capítulo 1).
 *
 * Al ser un componente de servidor, puede leer la sesión directamente con
 * `await` antes de renderizar, sin enviar JavaScript al navegador.
 */
export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
        Proyecto del libro
      </span>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Mis Tareas
      </h1>
      <p className="mt-4 max-w-md text-lg text-slate-600">
        Una app completa con autenticación, el patrón BFF y almacenamiento en el
        servidor. El ejemplo que construyes a lo largo de{" "}
        <span className="font-semibold text-slate-800">
          Next.js de Cero a Producción
        </span>
        .
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {user ? (
          <Link
            href="/tasks"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
          >
            Ir a mis tareas
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Iniciar sesión
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
