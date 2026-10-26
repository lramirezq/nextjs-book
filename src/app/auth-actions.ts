"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { findUserByEmail, createUser } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
} from "@/lib/auth";

/**
 * SERVER ACTIONS DE AUTENTICACIÓN — Capítulos 5 y 7 del libro.
 *
 * Una Server Action ("use server") es una función que corre en el servidor
 * pero se invoca desde el cliente, normalmente desde el `action` de un
 * formulario. Next.js crea el endpoint por debajo; nosotros solo escribimos
 * la función.
 *
 * Regla de oro: una Server Action es un endpoint REAL. Siempre validamos la
 * entrada (con Zod) y comprobamos permisos DENTRO de la función.
 */

// Forma del resultado que devolvemos a los formularios.
export type FormState = { error?: string } | undefined;

// Esquema de validación compartido por registro y login.
const credentialsSchema = z.object({
  email: z.string().email("Escribe un correo válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

/** Registra un usuario nuevo y lo deja con la sesión iniciada. */
export async function register(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // 1. Validamos la entrada en el borde.
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  // 2. Regla de negocio: el correo no puede estar ya registrado.
  if (findUserByEmail(email)) {
    return { error: "Ese correo ya está registrado." };
  }

  // 3. Guardamos la contraseña hasheada, nunca en texto plano.
  const user = createUser(email, hashPassword(password));

  // 4. Iniciamos sesión y entramos a la app.
  await createSession(user.id);
  redirect("/tasks");
}

/** Inicia sesión con un usuario existente. */
export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { email, password } = parsed.data;

  const user = findUserByEmail(email);
  // Mensaje genérico a propósito: no revelamos si el fallo fue el correo o la
  // contraseña, para no dar pistas a quien intente adivinar cuentas.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSession(user.id);
  redirect("/tasks");
}

/** Cierra la sesión y vuelve a la portada. */
export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
