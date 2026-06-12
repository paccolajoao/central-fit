import { redirect } from "next/navigation";

// A raiz redireciona para a dashboard; o proxy.ts cuida de mandar
// usuários não autenticados para /login.
export default function Home() {
  redirect("/dashboard");
}
