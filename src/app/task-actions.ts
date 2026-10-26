"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { listTasks, createTask, toggleTask, deleteTask, type Task } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * SERVER ACTIONS DE TAREAS (el BFF de la app) — Capítulos 4, 5 y 12.
 *
 * Cada acción hace lo mismo en el mismo orden:
 *   1. Obtiene el usuario de la SESIÓN (la identidad nunca llega del cliente).
 *   2. Valida la entrada con Zod.
 *   3. Llama a la capa de datos pasando SIEMPRE el id del usuario, de modo
 *      que solo toca las tareas de su dueño.
 *   4. Revalida la ruta para que la lista se refresque.
 *
 * La interfaz nunca importa la capa de datos: siempre pasa por aquí.
 */

const taskTextSchema = z
  .string()
  .trim()
  .min(1, "La tarea no puede estar vacía.")
  .max(100, "La tarea es demasiado larga (máximo 100 caracteres).");

const taskIdSchema = z.coerce.number().int().positive();

/** Devuelve las tareas del usuario de la sesión. Lo usa la página de tareas. */
export async function getMyTasks(): Promise<Task[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return listTasks(user.id);
}

export async function addTask(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return; // sin sesión, no hacemos nada

  const parsed = taskTextSchema.safeParse(formData.get("text"));
  if (!parsed.success) return; // entrada inválida: la ignoramos en silencio

  createTask(user.id, parsed.data);
  revalidatePath("/tasks");
}

export async function toggleTaskAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const parsed = taskIdSchema.safeParse(formData.get("id"));
  if (!parsed.success) return;

  // La capa de datos filtra por userId: aunque alguien mande el id de una
  // tarea ajena, no se modificará nada.
  toggleTask(user.id, parsed.data);
  revalidatePath("/tasks");
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const parsed = taskIdSchema.safeParse(formData.get("id"));
  if (!parsed.success) return;

  deleteTask(user.id, parsed.data);
  revalidatePath("/tasks");
}
