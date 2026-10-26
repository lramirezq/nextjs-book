import Link from "next/link";
import AuthForm from "@/app/_components/auth-form";
import { login } from "@/app/auth-actions";

export default function LoginPage() {
  return (
    <AuthForm
      action={login}
      title="Iniciar sesión"
      submitLabel="Entrar"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Crear una
          </Link>
        </>
      }
    />
  );
}
