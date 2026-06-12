# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Monorepo with two independent apps: `frontend/` (Next.js) and `backend/` (Laravel API). There is **no shared JS tooling** — the frontend uses npm, the backend uses Composer. Authentication is **Laravel Sanctum in SPA (cookie) mode**, not token-based.

## Commands

Run from the repo root unless noted. The root `package.json` only orchestrates the two apps via `concurrently`.

```bash
# Dev — both apps at once (API :8000 + Web :3000)
npm install            # once, installs concurrently at root
npm run dev            # = dev:api + dev:web
npm run dev:api        # backend only  (cd backend && php artisan serve ...)
npm run dev:web        # frontend only (cd frontend && npm run dev)

# Frontend (cd frontend)
npm run build          # production build — the strongest check (full TS typecheck)
npx tsc --noEmit       # type-check only
npm run lint           # eslint

# Backend (cd backend)
php artisan test                       # run the suite (PHPUnit 12)
php artisan test --filter=SomeTest     # run a single test/class/method
php artisan migrate:fresh --seed       # rebuild DB + recreate the admin user from .env
```

> The backend is API-only here. Use `php artisan serve` — do **not** use the default `composer run dev` (it expects a traditional Laravel+Vite app and runs the backend's own `npm`/Vite, which this project doesn't use).

There is **no automated test setup on the frontend** — validate frontend changes with `npm run build` (it runs the TypeScript check) and `npm run lint`.

## Authentication architecture (read this before touching auth)

The auth flow spans both apps and several files. Understanding it requires reading them together:

**Client → backend (browser):** [frontend/src/lib/api.ts](frontend/src/lib/api.ts) is an axios instance with `withCredentials` + `withXSRFToken`. The login flow ([frontend/src/components/login-form.tsx](frontend/src/components/login-form.tsx)) calls `initCsrf()` (`GET /sanctum/csrf-cookie`) **before** `POST /api/login`, so the `X-XSRF-TOKEN` header is present. Same pattern for logout in [frontend/src/components/user-nav.tsx](frontend/src/components/user-nav.tsx).

**Server-side session check (SSR):** [frontend/src/lib/dal.ts](frontend/src/lib/dal.ts) (`getCurrentUser` / `requireUser`) calls the backend `/api/user` from the Next.js server. **Critical, non-obvious detail:** it forwards the incoming browser `Cookie` header *and* sets `Referer`/`Origin` to the frontend URL. Without those headers Sanctum does not treat the server-to-server request as "stateful" and returns 401. This is the trickiest part of the integration.

**Route protection is two layers** (defense in depth):
1. [frontend/src/proxy.ts](frontend/src/proxy.ts) — optimistic, edge-level. Only checks for *presence* of the session cookie and redirects to `/login`. Matches `/dashboard/:path*`.
2. [frontend/src/app/(app)/layout.tsx](frontend/src/app/(app)/layout.tsx) — authoritative. Calls `requireUser()` (the DAL) which actually validates the session against the backend and redirects if invalid.

**Backend side:** `$middleware->statefulApi()` in [backend/bootstrap/app.php](backend/bootstrap/app.php) enables Sanctum stateful auth for `routes/api.php`. [backend/app/Http/Controllers/Auth/AuthController.php](backend/app/Http/Controllers/Auth/AuthController.php) handles login/logout/me (login regenerates the session to prevent fixation). [backend/app/Http/Requests/Auth/LoginRequest.php](backend/app/Http/Requests/Auth/LoginRequest.php) does validation **and** rate limiting (`RateLimiter`, 5 attempts per email+IP) with a generic error message to avoid user enumeration. CORS lives in [backend/config/cors.php](backend/config/cors.php) (`supports_credentials => true`, origin = `FRONTEND_URL`).

### Cross-app env coupling (easy to break)

These values must stay in sync or auth silently fails:

- `SESSION_COOKIE` (backend `.env`) **must equal** `SESSION_COOKIE_NAME` (frontend `.env.local`) — `proxy.ts` reads the latter to detect the cookie.
- `SANCTUM_STATEFUL_DOMAINS` (backend) must include the frontend origin (`localhost:3000`).
- `FRONTEND_URL` (backend) is the single allowed CORS origin.
- `SESSION_DOMAIN=localhost` + `SESSION_SAME_SITE=lax` is what lets the session cookie flow between `:3000` and `:8000` in dev — cookies are not isolated by port, and `localhost:3000`/`localhost:8000` are same-site. **In production**, the two apps must share a registrable domain (e.g. `app.x.com` + `api.x.com`, `SESSION_DOMAIN=.x.com`, HTTPS + `SESSION_SECURE_COOKIE=true`).

The admin user is created by the seeder from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in the backend `.env`; change them and run `php artisan migrate:fresh --seed`.

## Frontend specifics — this is Next.js 16 + shadcn on Base UI

[frontend/AGENTS.md](frontend/AGENTS.md) (loaded via [frontend/CLAUDE.md](frontend/CLAUDE.md)) warns that **this Next.js has breaking changes from older training data** — read the relevant guide under `frontend/node_modules/next/dist/docs/` before writing frontend code. Confirmed differences in use here:

- **`middleware.ts` is gone — it's `proxy.ts`** (exports a `proxy` function). That's why route protection lives in `src/proxy.ts`.
- `cookies()` / `headers()` are **async** (`await headers()`), and route `params` are Promises (`await params`) — see [frontend/src/app/(app)/dashboard/[...rest]/page.tsx](frontend/src/app/(app)/dashboard/[...rest]/page.tsx).
- **shadcn/ui here is built on Base UI, not Radix** (style `base-nova`). Components use the **`render` prop** to compose custom elements instead of Radix's `asChild` — e.g. `<SidebarMenuButton render={<Link href=... />}>` in [frontend/src/components/app-sidebar.tsx](frontend/src/components/app-sidebar.tsx) and `<DropdownMenuTrigger render={<Button .../>} />`. There is **no `form` component** in this registry — forms use `react-hook-form` + `zod` directly.

Routing: `src/app/(app)/` is the authenticated area (its `layout.tsx` is the sidebar shell + the auth gate). `/login` is public. The root `app/page.tsx` redirects to `/dashboard`. Security headers are set in [frontend/next.config.ts](frontend/next.config.ts).
