# central-fit

Monorepo com **frontend** (Next.js) e **backend** (Laravel) separados. Autenticação por e-mail/senha usando **Laravel Sanctum no modo SPA** (sessão por cookie httpOnly + proteção CSRF) e uma **dashboard inicial com menu lateral**.

## Funcionalidades

- 🔐 **Login** por e-mail e senha (validação no cliente com zod + no servidor com FormRequest).
- 🛡️ **Sessão segura** via Sanctum SPA — cookie httpOnly, SameSite=Lax e proteção CSRF.
- 🚦 **Rate limiting** no login (5 tentativas por e-mail+IP) com mensagens genéricas (anti-enumeração).
- 🧭 **Proteção de rotas** em duas camadas: `proxy.ts` (checagem otimista) + DAL server-side (validação real).
- 📊 **Dashboard** com sidebar colapsável, header com menu do usuário (logout) e **alternador de tema** (claro/escuro).
- 🚪 **Logout** que invalida a sessão no servidor.
- 🧱 Seções do menu (Alunos, Treinos, Agenda, Configurações) já roteadas com placeholder "Em construção".

## Stack

| Camada   | Tecnologias                                                                 |
| -------- | --------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui · TypeScript    |
| Backend  | Laravel 13 · PHP 8.4 · Sanctum                                              |
| Banco    | PostgreSQL                                                                   |
| Auth     | Sanctum SPA (cookie de sessão httpOnly + CSRF)                              |

## Estrutura

```
central-fit/
├── frontend/                     # Next.js + Tailwind + shadcn/ui
│   └── src/
│       ├── app/
│       │   ├── login/            # página de login
│       │   ├── (app)/            # área autenticada (layout com sidebar)
│       │   │   ├── layout.tsx     #   shell: valida sessão + sidebar + header
│       │   │   └── dashboard/     #   dashboard e seções
│       │   └── layout.tsx         # root layout (tema, toaster)
│       ├── components/            # login-form, app-sidebar, user-nav, theme-toggle
│       ├── lib/
│       │   ├── api.ts             # cliente axios (browser) com CSRF
│       │   └── dal.ts             # validação de sessão server-side
│       └── proxy.ts               # proteção de rotas (Next 16 "proxy", ex-middleware)
├── backend/                      # Laravel API + Sanctum
│   ├── app/Http/
│   │   ├── Controllers/Auth/AuthController.php   # login / logout / me
│   │   └── Requests/Auth/LoginRequest.php        # validação + rate limiting
│   ├── routes/api.php            # /api/login, /api/logout, /api/user
│   ├── database/seeders/         # cria o usuário admin a partir do .env
│   └── config/{cors,sanctum,session}.php
└── package.json                  # scripts p/ rodar front + back juntos (concurrently)
```

## Pré-requisitos

- **Node.js 20+** e **npm**
- **PHP 8.3+** e **Composer**
- **PostgreSQL** em execução (local ou remoto)

---

## Como rodar

### 1. Backend (Laravel) — porta 8000

```bash
cd backend

# dependências
composer install

# ambiente
cp .env.example .env
php artisan key:generate

# configure as credenciais do Postgres e do admin no .env:
#   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
#   ADMIN_EMAIL, ADMIN_PASSWORD

# crie o banco (caso ainda não exista)
createdb -h 127.0.0.1 -U postgres central_fit
#   ou: psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE central_fit"

# tabelas + usuário admin
php artisan migrate --seed

# sobe o servidor
php artisan serve --host=127.0.0.1 --port=8000
```

API disponível em <http://localhost:8000>.

### 2. Frontend (Next.js) — porta 3000

```bash
cd frontend

# dependências
npm install

# ambiente (já aponta para o backend em :8000)
cp .env.example .env.local

# sobe o servidor de desenvolvimento
npm run dev
```

App disponível em <http://localhost:3000> → redireciona para `/login`.

### 3. (Opcional) Rodar os dois juntos pela raiz

```bash
npm install     # instala o concurrently (uma vez)
npm run dev     # sobe API (:8000) e Web (:3000) em paralelo
```

> Scripts disponíveis na raiz: `npm run dev`, `npm run dev:api`, `npm run dev:web`, `npm run build:web`.

---

## Credenciais padrão

O usuário admin é criado pelo seeder a partir do `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
Os valores padrão do `.env.example` são:

```
E-mail:  admin@centralfit.com
Senha:   (defina em ADMIN_PASSWORD antes de rodar o seed)
```

> ⚠️ **Troque a senha do admin** antes de qualquer uso real. Após alterar o `.env`, rode `php artisan migrate:fresh --seed`.

## Rotas da API

| Método | Rota                   | Auth | Descrição                                  |
| ------ | ---------------------- | ---- | ------------------------------------------ |
| GET    | `/sanctum/csrf-cookie` | —    | Define o cookie `XSRF-TOKEN` (pré-login)   |
| POST   | `/api/login`           | —    | Autentica com e-mail + senha               |
| POST   | `/api/logout`          | ✓    | Encerra a sessão                           |
| GET    | `/api/user`            | ✓    | Retorna o usuário autenticado              |

Fluxo do cliente: `GET /sanctum/csrf-cookie` → `POST /api/login` (com header `X-XSRF-TOKEN`) → cookie de sessão httpOnly é definido.

## Variáveis de ambiente

**backend/.env** (principais)

```
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SESSION_DOMAIN=localhost
SESSION_COOKIE=central_fit_session
SESSION_SAME_SITE=lax
SESSION_SECURE_COOKIE=false        # true em produção (HTTPS)
DB_CONNECTION=pgsql
DB_DATABASE=central_fit
DB_USERNAME=postgres
DB_PASSWORD=
ADMIN_EMAIL=admin@centralfit.com
ADMIN_PASSWORD=
```

**frontend/.env.local**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_COOKIE_NAME=central_fit_session
```

## Segurança

- Sessão por **cookie httpOnly + SameSite=Lax** (Sanctum SPA).
- **Proteção CSRF** (`XSRF-TOKEN` / `X-XSRF-TOKEN`).
- **CORS** restrito ao frontend, com credenciais.
- **Rate limiting** no login + mensagens genéricas (anti-enumeração de usuários).
- **Proteção de rotas** em duas camadas: `proxy.ts` (otimista) + DAL server-side validando a sessão real.
- Cabeçalhos de segurança no Next (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

> **Produção:** front e back devem compartilhar o mesmo domínio registrável (ex.: `app.dominio.com` + `api.dominio.com`, `SESSION_DOMAIN=.dominio.com`) e usar HTTPS (`SESSION_SECURE_COOKIE=true`).
