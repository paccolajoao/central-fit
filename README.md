# central-fit

Monorepo com **frontend** (Next.js) e **backend** (Laravel) separados, autenticação por e-mail/senha com **Laravel Sanctum (SPA, cookie httpOnly + CSRF)** e uma dashboard inicial com menu lateral.

## Stack

| Camada   | Tecnologias                                                        |
| -------- | ------------------------------------------------------------------ |
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · TS  |
| Backend  | Laravel 13 · PHP 8.4 · Sanctum                                     |
| Banco    | PostgreSQL                                                         |

## Estrutura

```
central-fit/
├── frontend/   # Next.js + Tailwind + shadcn/ui
├── backend/    # Laravel API + Sanctum
└── package.json  # scripts p/ rodar front + back juntos (concurrently)
```

## Pré-requisitos

- Node.js 20+ e npm
- PHP 8.3+ e Composer
- PostgreSQL em execução

## Setup

### 1. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env          # se necessário
php artisan key:generate
# Ajuste as credenciais do Postgres e do admin no .env:
#   DB_USERNAME, DB_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
php artisan migrate --seed     # cria as tabelas e o usuário admin
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
# .env.local já aponta para http://localhost:8000
```

### 3. Rodar tudo junto (na raiz)

```bash
npm install          # instala o concurrently
npm run dev          # sobe API (:8000) e Web (:3000)
```

Ou separadamente: `npm run dev:api` e `npm run dev:web`.

Acesse <http://localhost:3000> → você será redirecionado para `/login`.

## Variáveis de ambiente

**backend/.env** (principais)

```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
SESSION_COOKIE=central_fit_session
DB_CONNECTION=pgsql
DB_DATABASE=central_fit
ADMIN_EMAIL=...        # usuário admin criado pelo seeder
ADMIN_PASSWORD=...
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_COOKIE_NAME=central_fit_session
```

## Segurança

- Sessão por **cookie httpOnly + SameSite=Lax** (Sanctum SPA).
- **Proteção CSRF** (XSRF-TOKEN / X-XSRF-TOKEN).
- **CORS** restrito ao frontend, com credenciais.
- **Rate limiting** no login (5 tentativas/min por e-mail+IP) e mensagens genéricas (anti-enumeração).
- **Proteção de rotas** em duas camadas: `proxy.ts` (otimista) + DAL server-side validando a sessão real.
- Cabeçalhos de segurança no Next (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

> **Produção:** front e back devem compartilhar o mesmo domínio registrável (ex.: `app.dominio.com` + `api.dominio.com`, `SESSION_DOMAIN=.dominio.com`) e usar HTTPS (`SESSION_SECURE_COOKIE=true`).
