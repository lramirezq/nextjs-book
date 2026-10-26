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
 * ── Cómo guardamos los datos ──────────────────────────────────────────────
 * Para que el proyecto funcione con `npm install && npm run dev` sin instalar
 * ni configurar ninguna base de datos, usamos un almacén EN MEMORIA.
 *
 *  - En desarrollo (tu máquina), además lo respaldamos en un archivo
 *    `data.json`, de modo que los datos sobreviven a los reinicios.
 *  - En producción serverless (por ejemplo, Vercel) el sistema de archivos es
 *    de solo lectura, así que solo usamos la memoria. Los datos durarán lo que
 *    dure la instancia del servidor; perfecto para una demo.
 *
 * En una aplicación real usarías una base de datos (PostgreSQL, SQLite, etc.).
 * Lo valioso del patrón BFF es que SOLO cambiaría el interior de este archivo:
 * el resto de la app seguiría igual, porque solo conoce las funciones de abajo.
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

// ---- Dónde y cómo se guarda ----

// ¿Podemos escribir en disco? Solo en desarrollo. En Vercel (y otros entornos
// serverless) el sistema de archivos es de solo lectura.
const CAN_PERSIST = process.env.NODE_ENV !== "production";
const DB_PATH = join(process.cwd(), "data.json");

function emptyDatabase(): Database {
  return { users: [], tasks: [], nextUserId: 1, nextTaskId: 1 };
}

// Guardamos la base en `globalThis` para que sobreviva a las recargas de
// módulos que hace Next.js en desarrollo y se comparta entre peticiones.
const globalStore = globalThis as unknown as { __db?: Database };

function load(): Database {
  if (globalStore.__db) return globalStore.__db;

  // Primera vez: intentamos leer el archivo (si estamos en desarrollo).
  let db = emptyDatabase();
  if (CAN_PERSIST && existsSync(DB_PATH)) {
    try {
      db = JSON.parse(readFileSync(DB_PATH, "utf8")) as Database;
    } catch {
      // Si el archivo está corrupto, empezamos de cero en lugar de romper.
      db = emptyDatabase();
    }
  }
  globalStore.__db = db;
  return db;
}

function save(db: Database): void {
  globalStore.__db = db;
  // Solo escribimos a disco en desarrollo; en serverless esto se omite.
  if (CAN_PERSIST) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
    } catch {
      // Si por cualquier motivo no se puede escribir, seguimos con la memoria.
    }
  }
}

// ---- Operaciones de USUARIOS ----

export function createUser(email: string, passwordHash: string): User {
  const db = load();
  const user: User = { id: db.nextUserId++, email, passwordHash };
  db.users.push(user);
  save(db);
  return user;
}

export function findUserByEmail(email: string): User | undefined {
  return load().users.find((u) => u.email === email);
}

export function findUserById(id: number): User | undefined {
  return load().users.find((u) => u.id === id);
}

// ---- Operaciones de TAREAS ----
// Fíjate en que TODAS reciben el `userId`: una tarea siempre se consulta o
// modifica en el contexto de su dueño. Nunca devolvemos tareas de otro.

export function listTasks(userId: number): Task[] {
  return load()
    .tasks.filter((t) => t.userId === userId)
    .sort((a, b) => {
      // Primero las pendientes; dentro de cada grupo, las más recientes arriba.
      if (a.done !== b.done) return a.done ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export function createTask(userId: number, text: string): Task {
  const db = load();
  const task: Task = {
    id: db.nextTaskId++,
    userId,
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };
  db.tasks.push(task);
  save(db);
  return task;
}

/** Alterna el estado hecha/pendiente, solo si la tarea es del usuario. */
export function toggleTask(userId: number, taskId: number): void {
  const db = load();
  const task = db.tasks.find((t) => t.id === taskId && t.userId === userId);
  if (!task) return; // no es suya (o no existe): no hacemos nada
  task.done = !task.done;
  save(db);
}

/** Borra una tarea, solo si pertenece al usuario. */
export function deleteTask(userId: number, taskId: number): void {
  const db = load();
  const before = db.tasks.length;
  db.tasks = db.tasks.filter((t) => !(t.id === taskId && t.userId === userId));
  if (db.tasks.length !== before) save(db);
}
