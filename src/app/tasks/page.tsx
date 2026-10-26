import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyTasks, addTask } from "@/app/task-actions";
import { logout } from "@/app/auth-actions";
import TaskList from "@/app/_components/task-list";

/**
 * PÁGINA DE TAREAS — Server Component protegido (Capítulos 5 y 12).
 *
 * Aunque el middleware ya bloquea el acceso sin sesión, volvemos a validar
 * aquí en el servidor: es la "defensa en capas". Nunca confiamos en una sola
 * barrera.
 */
export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const tasks = await getMyTasks();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Tareas</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* Formulario para crear una tarea. Usa la Server Action directamente. */}
      <form action={addTask} className="mb-6 flex gap-2">
        <input
          name="text"
          required
          maxLength={100}
          placeholder="¿Qué hay que hacer?"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700"
        >
          Añadir
        </button>
      </form>

      <TaskList tasks={tasks} />
    </main>
  );
}
