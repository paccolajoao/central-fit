import axios from "axios";

/**
 * Cliente HTTP para uso no browser (Client Components).
 *
 * - withCredentials: envia/recebe os cookies de sessão do Sanctum.
 * - withXSRFToken: lê o cookie XSRF-TOKEN e o reenvia no header X-XSRF-TOKEN
 *   (proteção CSRF do Sanctum SPA).
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/**
 * Obtém o cookie XSRF-TOKEN antes de qualquer requisição que altera estado
 * (login, logout, etc.). Deve ser chamado antes do POST /api/login.
 */
export async function initCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}
