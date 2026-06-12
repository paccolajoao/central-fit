import { NextResponse, type NextRequest } from "next/server";

// Nome do cookie de sessão emitido pelo Laravel (ver SESSION_COOKIE no backend).
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "central_fit_session";

/**
 * Proxy (antigo middleware) — proteção otimista de rotas.
 *
 * Faz apenas uma checagem barata pela presença do cookie de sessão, sem
 * validar no backend (isso roda em toda navegação/prefetch). A verificação
 * real e autoritativa é feita na DAL (src/lib/dal.ts) via /api/user, chamada
 * pelos Server Components das rotas protegidas.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Roda apenas nas rotas protegidas.
export const config = {
  matcher: ["/dashboard/:path*"],
};
