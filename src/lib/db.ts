import "server-only";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * CAPA DE DATOS — Capítulo 12 del libro.
 *
 * Esta es la ÚNICA parte de la aplicación que accede al almacenamiento.
 * La marca `import "server-only"` hace que, si por error alguien intenta
 * importar este archivo desde un componente de cliente, el build falle.
 * Así garantizamos que los datos nunca viajan al navegador.
 *
 * Para que el proyecto funcione con `npm install && npm run dev` sin instalar
 * ni configurar ninguna base de datos, guardamos todo en un simple archivo
 * JSON en el servidor. La interfaz pública de este módulo (las funciones de
 * abajo) es la misma que tendría con una base de datos real: si mañana
 * quisieras usar PostgreSQL, solo cambiarías el interior de estas funciones.
 */

// ---- Tipos que viajan por la aplicación (DTOs) ----

export type User = {
  id: number;
  email: string;
  passwordHash: string;
};

export type Task = {
  id: number;
  userId: number;
  text: string;
  done: boolean;
  createdAt: string;
};

type Database = {
  users: User[];
  tasks: Task[];
  nextUserId: number;
  nextTaskId: number;
};

// ---- Lectura y escritura del archivo ----

const DB_PATH = join(process.cwd(), "data.json");

function emptyDatabase(): Database {
  return { users: [], tasks: [], nextUserId: 1, nextTaskId: 1 };
}

function read(): Database {
  if (!existsSync(DB_PATH)) return emptyDatabase();
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
  } catch {
    // Si el archivo está corrupto, empezamos de cero en lugar de romper la app.
    return emptyDatabase();
  }
}

function write(db: Database): void {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

// ---- Operaciones de USUARIOS ----

export function createUser(email: string, passwordHash: string): User {
  const db = read();
  const user: User = { id: db.nextUserId++, email, passwordHash };
  db.users.push(user);
  write(db);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return read().users.find((u) => u.email === email);
}

export function findUserById(id: number): User | undefined {
  return read().users.find((u) => u.id === id);
}

// ---- Operaciones de TAREAS ----
// Fíjate en que TODAS reciben el `userId`: una tarea siempre se consulta o
// modifica en el contexto de su dueño. Nunca devolvemos tareas de otro.

export function listTasks(userId: number): Task[] {
  return read()
    .tasks.filter((t) => t.userId === userId)
    .sort((a, b) => {
      // Primero las pendientes; dentro de cada grupo, las más recientes arriba.
      if (a.done !== b.done) return a.done ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function createTask(userId: number, text: string): Task {
  const db = read();
  const task: Task = {
    id: db.nextTaskId++,
    userId,
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };
  db.tasks.push(task);
  write(db);
  return task;
}

/** Alterna el estado hecha/pendiente, solo si la tarea es del usuario. */
export function toggleTask(userId: number, taskId: number): void {
  const db = read();
  const task = db.tasks.find((t) => t.id === taskId && t.userId === userId);
  if (!task) return; // no es suya (o no existe): no hacemos nada
  task.done = !task.done;
  write(db);
}

/** Borra una tarea, solo si pertenece al usuario. */
export function deleteTask(userId: number, taskId: number): void {
  const db = read();
  const before = db.tasks.length;
  db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
  if (db.tasks.length !== before) write(db);
}
