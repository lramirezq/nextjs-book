import type { Task } from "@/lib/db";
import { toggleTaskAction, deleteTaskAction } from "@/app/task-actions";

/**
 * LISTA DE TAREAS — Server Component (Capítulos 2 y 12).
 *
 * Renderiza la lista recibida por props. Cada botón (alternar, borrar) es un
 * pequeño formulario que invoca una Server Action, enviando el id de la tarea
 * por un campo oculto. No necesita JavaScript propio: funciona con la mejora
 * progresiva de Next.js.
 */
export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-slate-400">
        No tienes tareas todavía. ¡Añade la primera!
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          {/* Alternar hecha/pendiente */}
          <form action={toggleTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <button
              type="submit"
              aria-label={task.done ? "Marcar como pendiente" : "Marcar como hecha"}
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                task.done
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-slate-300 hover:border-indigo-400"
              }`}
            >
              {task.done ? "✓" : ""}
            </button>
          </form>

          <span
            className={`flex-1 ${
              task.done ? "text-slate-400 line-through" : "text-slate-800"
            }`}
          >
            {task.text}
          </span>

          {/* Borrar */}
          <form action={deleteTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <button
              type="submit"
              aria-label="Borrar tarea"
              className="rounded-lg px-2 py-1 text-sm text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              Borrar
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}
