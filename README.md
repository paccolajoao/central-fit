# central-fit

Monorepo com **frontend** (Next.js) e **backend** (Laravel API) separados. Aplicação de acompanhamento pessoal de saúde e fitness: registra alimentação importada do **Cronometer** e atividades físicas importadas do **Samsung Health**, com dashboards de visualização diária e semanal.

Autenticação via **Laravel Sanctum no modo SPA** (sessão por cookie httpOnly + proteção CSRF).

## Funcionalidades

### Autenticação e sessão
- Login por e-mail e senha com rate limiting (5 tentativas/IP) e mensagens genéricas (anti-enumeração).
- Sessão segura via Sanctum SPA — cookie httpOnly, SameSite=Lax, proteção CSRF.
- Proteção de rotas em duas camadas: `proxy.ts` (checagem otimista no edge) + DAL server-side (validação real contra o backend).
- Logout que invalida a sessão no servidor.

### Alimentação (`/dashboard/alimentacao`)
- Importação de dados nutricionais via **CSV exportado do Cronometer** (Serving Summary).
- Visualização diária: cards de progresso para calorias, proteína, carboidratos e gordura vs metas.
- Refeições agrupadas (Café da manhã, Almoço, Jantar, Lanches) com totais e remoção individual de entradas.
- Visualização semanal: gráfico de barras empilhadas com macros por dia + resumo (médias, total kcal, dias registrados).
- Navegação por data com seletor de dia.

### Atividades (`/dashboard/atividades`)
- Importação de treinos via **ZIP ou CSV exportado do Samsung Health** (dados pessoais).
- Suporte a 15+ tipos de exercício: corrida, caminhada, ciclismo, natação, musculação, yoga, pilates, elíptico, aeróbica e outros.
- Cada atividade exibe: tipo, duração, distância, calorias gastas, FC média/máxima, ritmo (corrida/caminhada) ou velocidade (ciclismo).
- Detalhes expansíveis: FC mínima, ganho de altitude, cadência, contagem de passos, notas.
- Visualização semanal: gráfico de duração por dia + resumo (dias ativos, total duração/distância/calorias).
- Mapeamento automático de colunas Samsung Health (com ou sem prefixo `com.samsung.health.exercise.*`).
- Deduplicação automática via UUID da atividade original.

### Configurações (`/dashboard/configuracoes`)
Interface em abas:

**Aba Nutrição:**
- Definição de metas diárias de calorias, proteína, carboidratos e gordura.
- Configuração de credenciais do Cronometer (armazenadas criptografadas).

**Aba Atividades:**
- Definição de metas: duração semanal (min), calorias diárias (kcal), passos diários.
- Instruções passo-a-passo para exportar e importar dados do Samsung Health.

### Interface
- Sidebar colapsável com navegação entre módulos.
- Header com menu do usuário e alternador de tema claro/escuro.
- Design responsivo (mobile-first).

---

## Stack

| Camada   | Tecnologias                                                                        |
| -------- | ---------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind v4 · shadcn/ui (Base UI) · TypeScript |
| Backend  | Laravel 13 · PHP 8.4 · Sanctum                                                     |
| Banco    | PostgreSQL                                                                          |
| Auth     | Sanctum SPA (cookie de sessão httpOnly + CSRF)                                     |
| Gráficos | Recharts                                                                            |

> **shadcn/ui neste projeto** usa Base UI (não Radix) com estilo `base-nova`. Componentes usam a `render` prop para composição (ex.: `render={<Link href="..." />}`) em vez de `asChild`.

---

## Estrutura

```
central-fit/
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── login/                         # página pública de login
│       │   └── (app)/                         # área autenticada
│       │       ├── layout.tsx                 # shell: valida sessão + sidebar + header
│       │       └── dashboard/
│       │           ├── page.tsx               # dashboard principal
│       │           ├── alimentacao/           # módulo de alimentação
│       │           ├── atividades/            # módulo de atividades físicas
│       │           └── configuracoes/         # página de configurações (abas)
│       ├── components/
│       │   ├── nutrition/                     # NutritionDashboard, MacroSummaryCards,
│       │   │                                  # MealSection, WeeklyChart, ImportDialog,
│       │   │                                  # DateNavigation
│       │   ├── activity/                      # ActivityDashboard, ActivitySummaryCards,
│       │   │                                  # ActivityList, WeeklyActivityChart,
│       │   │                                  # ImportSamsungDialog
│       │   ├── settings/                      # SettingsForm (abas Nutrição + Atividades)
│       │   └── ui/                            # Button, Card, Input, Tabs, Sidebar,
│       │                                      # DropdownMenu, Tooltip, ...
│       ├── lib/
│       │   ├── api.ts                         # cliente axios (browser) com CSRF
│       │   ├── dal.ts                         # validação de sessão server-side
│       │   ├── nutrition-types.ts             # tipos e constantes de nutrição
│       │   └── activity-types.ts              # tipos, constantes e helpers de atividade
│       └── proxy.ts                           # proteção de rotas (Next 16, ex-middleware)
│
├── backend/
│   ├── app/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── NutritionEntry.php             # entradas nutricionais do Cronometer
│   │   │   ├── Activity.php                   # sessões de atividade física
│   │   │   └── UserSetting.php                # metas + credenciais Cronometer
│   │   └── Http/Controllers/
│   │       ├── Auth/AuthController.php        # login / logout / me
│   │       ├── Nutrition/
│   │       │   ├── NutritionController.php    # daily, weekly, destroy
│   │       │   └── NutritionImportController.php  # importação CSV Cronometer
│   │       ├── Activity/
│   │       │   ├── ActivityController.php     # daily, weekly, destroy
│   │       │   └── ActivityImportController.php   # importação ZIP/CSV Samsung Health
│   │       └── Settings/
│   │           └── UserSettingController.php  # show, update
│   ├── database/migrations/
│   │   ├── *_create_users_table.php
│   │   ├── *_create_nutrition_entries_table.php
│   │   ├── *_create_user_settings_table.php
│   │   ├── *_create_activities_table.php
│   │   └── *_add_activity_goals_to_user_settings.php
│   ├── routes/api.php
│   └── config/{cors,sanctum,session}.php
│
└── package.json                               # scripts para rodar front + back juntos
```

---

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

# configure as credenciais do PostgreSQL e do admin no .env:
#   DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
#   ADMIN_EMAIL, ADMIN_PASSWORD

# crie o banco (caso ainda não exista)
createdb -h 127.0.0.1 -U postgres central_fit
# ou: psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE central_fit"

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

```
E-mail:  admin@centralfit.com  (padrão do .env.example)
Senha:   defina em ADMIN_PASSWORD antes de rodar o seed
```

> Após alterar o `.env`, rode `php artisan migrate:fresh --seed` para recriar o usuário.

---

## Rotas da API

### Autenticação
| Método | Rota                   | Auth | Descrição                                       |
| ------ | ---------------------- | ---- | ----------------------------------------------- |
| GET    | `/sanctum/csrf-cookie` | —    | Define o cookie `XSRF-TOKEN` (obrigatório pré-login) |
| POST   | `/api/login`           | —    | Autentica com e-mail + senha                    |
| POST   | `/api/logout`          | ✓    | Encerra a sessão                                |
| GET    | `/api/user`            | ✓    | Retorna o usuário autenticado                   |

### Nutrição
| Método | Rota                             | Descrição                                          |
| ------ | -------------------------------- | -------------------------------------------------- |
| GET    | `/api/nutrition/daily`           | Entradas do dia agrupadas por refeição + totais    |
| GET    | `/api/nutrition/weekly`          | Stats diárias de um período (padrão: últimos 7 dias) |
| POST   | `/api/nutrition/import`          | Importa CSV do Cronometer (multipart/form-data)    |
| DELETE | `/api/nutrition/entries/{entry}` | Remove uma entrada nutricional                     |

### Atividades
| Método | Rota                                  | Descrição                                              |
| ------ | ------------------------------------- | ------------------------------------------------------ |
| GET    | `/api/activities/daily`               | Atividades do dia + totais de duração/distância/calorias |
| GET    | `/api/activities/weekly`              | Stats diárias de um período + resumo semanal           |
| POST   | `/api/activities/import/samsung`      | Importa ZIP ou CSV do Samsung Health                   |
| DELETE | `/api/activities/{activity}`          | Remove uma atividade                                   |

### Configurações
| Método | Rota             | Descrição                                          |
| ------ | ---------------- | -------------------------------------------------- |
| GET    | `/api/settings`  | Retorna metas nutricionais, metas de atividade e status Cronometer |
| PUT    | `/api/settings`  | Atualiza metas e/ou credenciais do Cronometer      |

---

## Importações suportadas

### Cronometer (alimentação)
1. Cronometer → Settings → Account → Export Data → **Serving Summary**
2. Faça upload do CSV em `/dashboard/alimentacao` → "Importar CSV"

Campos importados: data, refeição, nome do alimento, quantidade, energia (kcal), proteína, carboidratos, gordura, fibras, açúcares, net carbs, sódio, gordura saturada, colesterol.

Deduplicação por `(user_id, entry_date, meal_name, food_name, amount)`.

### Samsung Health (atividades físicas)
1. Samsung Health → Perfil → Configurações → Gerenciar dados → **Baixar dados pessoais** → Health data (ZIP)
2. Faça upload do ZIP em `/dashboard/atividades` → "Importar Samsung Health"

Campos importados: tipo de exercício, início/fim, duração, distância (m), calorias, velocidade média/máxima (m/s), FC média/máxima/mínima, cadência, passos, ganho/perda de altitude, notas.

Tipos de exercício mapeados automaticamente: corrida, caminhada, ciclismo, natação, musculação, aeróbica, elíptico, yoga, pilates e outros.

Aceita ZIP completo (extrai o CSV de exercício automaticamente) ou CSV de exercício diretamente. Deduplicação por `datauuid` da atividade original.

---

## Variáveis de ambiente

**backend/.env** (principais)

```env
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

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_COOKIE_NAME=central_fit_session
```

> `SESSION_COOKIE` (backend) e `SESSION_COOKIE_NAME` (frontend) devem ter o mesmo valor — o `proxy.ts` usa esse nome para detectar a presença da sessão no edge.

---

## Segurança

- Sessão por **cookie httpOnly + SameSite=Lax** (Sanctum SPA).
- **Proteção CSRF** via `XSRF-TOKEN` / `X-XSRF-TOKEN`.
- **CORS** restrito ao `FRONTEND_URL` com `supports_credentials: true`.
- **Rate limiting** no login (5 tentativas por e-mail+IP) com mensagens genéricas.
- **Proteção de rotas** em duas camadas: `proxy.ts` (otimista) + DAL server-side.
- **Credenciais do Cronometer** armazenadas criptografadas (`Crypt::encrypt`).
- Todos os endpoints de dados filtram por `user_id` do usuário autenticado.
- Cabeçalhos de segurança HTTP configurados no `next.config.ts` (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

> **Produção:** front e back devem compartilhar o mesmo domínio registrável (ex.: `app.dominio.com` + `api.dominio.com`), `SESSION_DOMAIN=.dominio.com` e HTTPS (`SESSION_SECURE_COOKIE=true`).
