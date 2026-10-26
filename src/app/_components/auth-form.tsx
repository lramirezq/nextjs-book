"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { FormState } from "@/app/auth-actions";

/**
 * FORMULARIO DE AUTENTICACIÓN — Client Component (Capítulo 7).
 *
 * Es un componente de cliente ("use client") porque necesita interactividad:
 *   - `useActionState` conecta el formulario con una Server Action y nos da
 *     el resultado (por ejemplo, un mensaje de error).
 *   - `useFormStatus` sabe cuándo el envío está en curso para deshabilitar el
 *     botón y evitar envíos duplicados.
 */

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  title: string;
  footer: React.ReactNode;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
    >
      {pending ? "Un momento…" : label}
    </button>
  );
}

export default function AuthForm({ action, submitLabel, title, footer }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(
    action,
    undefined,
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">{title}</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <SubmitButton label={submitLabel} />
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
      </div>

      <Link href="/" className="mt-6 text-center text-sm text-slate-400 hover:text-slate-600">
        ← Volver al inicio
      </Link>
    </main>
  );
}
