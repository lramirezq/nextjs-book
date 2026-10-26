import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { findUserById, type User } from "./db";

/**
 * AUTENTICACIÓN Y SESIÓN — Capítulo 5 del libro.
 *
 * Aquí vive todo lo relacionado con contraseñas y sesión. Dos ideas clave:
 *
 *  1. Las contraseñas NUNCA se guardan en texto plano. Guardamos un "hash"
 *     (con scrypt + sal aleatoria), que es irreversible.
 *
 *  2. La sesión se guarda en una cookie HttpOnly: el JavaScript del navegador
 *     NO puede leerla, lo que la protege de ataques XSS. Firmamos el id del
 *     usuario para que nadie pueda falsificar la cookie.
 */

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

// En una app real este secreto vive en una variable de entorno.
// Aquí tiene un valor por defecto solo para que el ejemplo funcione al clonar.
const SECRET = process.env.SESSION_SECRET ?? "cambia-esto-en-produccion-por-favor";

// ---- Contraseñas ----

/** Convierte una contraseña en un hash seguro con el formato `salt:hash`. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Comprueba una contraseña contra su hash guardado, sin filtrar tiempos. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) return false;
  const attempt = scryptSync(password, salt, 64);
  const expected = Buffer.from(storedHash, "hex");
  // timingSafeEqual evita filtrar información por el tiempo de comparación.
  if (attempt.length !== expected.length) return false;
  return timingSafeEqual(attempt, expected);
}

// ---- Firma del valor de la cookie ----
// Guardamos "userId.firma". La firma impide que alguien cambie el id a mano.

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function buildCookieValue(userId: number): string {
  const payload = String(userId);
  return `${payload}.${sign(payload)}`;
}

function parseCookieValue(cookie: string): number | null {
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return null;
  // Comprobamos que la firma coincida: si no, la cookie fue manipulada.
  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }
  const id = Number(payload);
  return Number.isInteger(id) ? id : null;
}

// ---- Gestión de la sesión ----
// OJO: en Next.js 15+ `cookies()` es asíncrono, por eso usamos `await`.

/** Inicia la sesión guardando la cookie HttpOnly. */
export async function createSession(userId: number): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, buildCookieValue(userId), {
    httpOnly: true, // el JS del navegador no puede leerla
    secure: process.env.NODE_ENV === "production", // solo HTTPS en producción
    sameSite: "lax", // mitiga ataques CSRF
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Cierra la sesión borrando la cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Devuelve el usuario de la sesión actual, o `null` si no hay sesión válida.
 * La identidad SIEMPRE se deriva aquí, en el servidor, nunca de un dato que
 * envíe el cliente.
 */
export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const cookie = store.get(COOKIE_NAME)?.value;
  if (!cookie) return null;

  const id = parseCookieValue(cookie);
  if (id === null) return null;

  return findUserById(id) ?? null;
}
