import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DumbbellIcon } from "lucide-react";

import { getCurrentUser } from "@/lib/dal";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  // Se já estiver autenticado, vai direto para a dashboard (checagem real).
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* Painel de marca (desktop) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <DumbbellIcon className="size-5" />
          </div>
          <span className="font-heading text-lg font-semibold">central-fit</span>
        </div>
        <blockquote className="relative max-w-md space-y-3">
          <p className="font-heading text-2xl font-medium leading-snug text-balance">
            Gerencie sua academia com simplicidade — alunos, treinos e agenda em
            um só lugar.
          </p>
          <footer className="text-sm text-primary-foreground/70">
            Painel de gestão central-fit
          </footer>
        </blockquote>
        <p className="relative text-xs text-primary-foreground/60">
          © 2026 central-fit
        </p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
