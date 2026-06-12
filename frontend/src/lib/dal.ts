import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Data Access Layer — verificação de sessão autoritativa (server-side).
 *
 * Repassa os cookies recebidos do browser para o Laravel e define
 * Origin/Referer = frontend, de modo que o Sanctum trate a requisição como
 * "stateful" e autentique pela sessão. Memoizada com cache() para deduplicar
 * chamadas dentro do mesmo render.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";

  try {
    const res = await fetch(`${API_URL}/api/user`, {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        Referer: APP_ORIGIN,
        Origin: APP_ORIGIN,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as User;
  } catch {
    return null;
  }
});

/**
 * Exige um usuário autenticado; redireciona para /login caso contrário.
 * Use no topo dos Server Components de rotas protegidas.
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Fetch server-side autenticado — encaminha cookies da sessão para o backend.
 * Retorna null em caso de erro ou 401.
 */
export async function serverFetch<T>(path: string): Promise<T | null> {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        Referer: APP_ORIGIN,
        Origin: APP_ORIGIN,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
