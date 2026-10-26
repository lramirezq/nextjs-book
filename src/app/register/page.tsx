import Link from "next/link";
import AuthForm from "@/app/_components/auth-form";
import { register } from "@/app/auth-actions";

export default function RegisterPage() {
  return (
    <AuthForm
      action={register}
      title="Crear cuenta"
      submitLabel="Registrarme"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    />
  );
}
