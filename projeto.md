# 🍽️ Buffet Juniors Kids — Projeto Técnico Completo (Horizon Beta → Replit/Claude Sonnet 4)

Este documento fornece uma visão técnica completa do projeto para permitir migração e correções seguras no Replit usando Claude Sonnet 4, sem quebrar o funcionamento atual.

Última revisão técnica realizada a partir do código em repositório local.

============================================================

1. Informações Gerais do Projeto

- Nome do projeto: Buffet Juniors Kids (rest-express)
- Descrição: Sistema full-stack de gestão para buffets infantis, cobrindo clientes, eventos, pagamentos, despesas, documentos e estatísticas (dashboard). Inclui autenticação com sessão, upload de arquivos, consultas financeiras, e visualizações de dados.
- Versão atual: 1.0.0
- Status do desenvolvimento: Em desenvolvimento (com rotas e UI já operacionais)
- Datas:
  - Data de início: não especificada no repositório
  - Última atualização do código: 2025-08-06 (com base no ambiente de análise)
- Equipe responsável/desenvolvedores: não especificado no repositório

============================================================

2. Arquitetura e Stack Tecnológico Completo

Frontend
- Framework principal: React 18.3.1 com TypeScript
- Router: Wouter 3.3.5
- Estado/Server State: @tanstack/react-query 5.60.5
- UI/Design System:
  - Radix UI (conjunto de bibliotecas @radix-ui/*)
  - shadcn/ui (via components.json e utilitários)
  - Tailwind CSS 3.4.17 + tailwindcss-animate 1.0.7 + @tailwindcss/typography 0.5.15
  - Ícones: lucide-react 0.453.0
  - Animações: tw-animate-css 1.2.5
- Bundler/build: Vite 6.3.5 com @vitejs/plugin-react 4.3.2
- Linguagem: TypeScript 5.6.3
- Estrutura de pastas (principal):
  - client/
    - index.html
    - src/
      - App.tsx
      - main.tsx
      - index.css
      - components/
        - dashboard/
          - revenue-chart.tsx
          - stats-cards.tsx
        - events/
          - event-modal.tsx
          - upcoming-events.tsx
        - layout/
          - header.tsx
          - sidebar.tsx
        - payments/
          - recent-payments.tsx
        - ui/ (biblioteca shadcn UI com vários componentes)
      - hooks/
        - use-auth.tsx
        - use-mobile.tsx
        - use-toast.ts
      - lib/
        - protected-route.tsx
        - queryClient.ts
        - utils.ts
      - pages/
        - active-clients-page.tsx
        - auth-page.tsx
        - clients-page.tsx
        - dashboard-page.tsx
        - documents-page.tsx
        - events-month-page.tsx
        - events-page.tsx
        - expenses-page.tsx
        - not-found.tsx
        - payments-page.tsx
        - pending-payments-page.tsx
        - revenue-page.tsx
        - revenue-total-page.tsx
- Dependências exatas do frontend: ver seção 4 (package.json completo)

Backend/API
- Runtime/Framework: Node.js com Express 4.21.2 (ESM)
- Linguagem: TypeScript (build server com esbuild 0.25.0)
- Arquitetura: REST monolito (API Express + Vite middleware em dev; estático servido em produção)
- DB/ORM: PostgreSQL com Drizzle ORM 0.39.1 e driver @neondatabase/serverless 0.10.4
- Sessões e Auth:
  - Autenticação: passport 0.7.0 com passport-local 1.0.0
  - Sessões: express-session 1.18.1 + connect-pg-simple 10.0.0 (armazenamento de sessão no PostgreSQL, schema app, tabela session)
- Upload de arquivos: multer 2.0.2, diretório uploads/ com restrição de tipos e limite 10MB
- Logging: pino 9.7.0, pino-http 10.5.0; em desenvolvimento usa pino-pretty 13.1.1
- Middlewares principais:
  - express.json()
  - express.urlencoded({ extended: false })
  - Gerador de correlation ID (X-Request-Id) com crypto.randomUUID()
  - pino-http para logs estruturados
  - express-session + passport.initialize() + passport.session()
  - serve estáticos de uploads
- Rotas:
  - Health: GET /healthz, GET /readyz
  - Auth:
    - POST /api/register
    - POST /api/login
    - POST /api/logout
    - GET /api/user
  - Clients: GET/POST/PUT/DELETE /api/clients
  - Events: GET/POST/PUT/DELETE /api/events; GET /api/events/upcoming
  - Payments: GET/POST /api/payments; GET /api/payments/recent; GET /api/payments/event/:eventId
  - Documents: GET/POST/DELETE /api/documents; arquivos servidos em /uploads
  - Stats: GET /api/stats; GET /api/stats/financial
  - Expenses: GET/POST/PUT/DELETE /api/expenses; GET /api/expenses/categories
  - Cashflow: GET /api/cashflow
  - Todas as rotas (exceto auth e health) exigem sessão autenticada via requireAuth
- Resumo de controle de erros:
  - Handler central que formata resposta JSON com code/message/requestId; nível de log adaptativo via pino-http
- Dependências exatas do backend: ver seção 4

Banco de Dados
- Sistema: PostgreSQL (Neon Serverless) via @neondatabase/serverless 0.10.4
- Migrations: drizzle-kit 0.31.4 (out: ./migrations; schema: ./shared/schema.ts; dialect postgresql; credencial lida de DATABASE_URL)
- Schema (Drizzle com schema app):
  - Tabelas:
    - app.users: id (uuid por gen_random_uuid), username unique, password (hash), name, role (default admin), created_at
    - app.clients: id, name, email, phone, address, created_at
    - app.events: id, child_name, age, client_id (FK clients.id), event_date (date), start_time, end_time, guest_count, total_value (numeric), status (pending/confirmed/completed/cancelled, default pending), notes, created_at
    - app.payments: id, event_id (FK events.id), amount (numeric), payment_method, payment_date, description, status (pending/completed/failed, default completed)
    - app.documents: id, event_id (FK events.id), client_id (FK clients.id), filename, original_name, file_size, mime_type, upload_path, uploaded_at
    - app.expenses: id, description, amount (numeric), category, payment_method, supplier, receipt_number, expense_date, status (paid/pending/cancelled, default paid), event_id (FK events.id), created_at
    - app.cash_flow: id, type (income/expense), description, amount, category, payment_method, reference_id, reference_type (payment/expense/adjustment), transaction_date, created_at
  - Relações modeladas em Drizzle (relations) para join e inferências
  - Schemas de inserção (zod): insertUserSchema, insertClientSchema, insertEventSchema, insertPaymentSchema, insertDocumentSchema, insertExpenseSchema, insertCashFlowSchema
- Consultas principais implementadas em storage:
  - Listagens e joins para clients, events (com client), payments (com event e client), expenses (com event e client opcional)
  - Métricas:
    - getMonthlyStats: receita do mês, despesas do mês, lucro, contagem de eventos, clientes ativos no ano, valor pendente
    - getFinancialSummary: receita total, despesas totais, lucro, margem, despesas por categoria, receita por mês
  - Cash flow com filtros por período
  - Agregações com SQL (COALESCE, DATE_TRUNC, EXTRACT, TO_CHAR, SUM)
- Índices:
  - Não explícitos em schema.ts além de chaves e uniques; considerar índices para colunas filtradas (event_date, payment_date, status, category) em melhorias futuras

Configurações específicas do Cursor/Horizon/Replit
- Vite integra:
  - @replit/vite-plugin-runtime-error-modal 0.0.3
  - @replit/vite-plugin-cartographer 0.2.8 condicionalmente quando REPL_ID está presente e NODE_ENV != "production"
- client/index.html inclui replit-dev-banner.js para banner no topo ao rodar fora do Replit
- Aliases Vite/TS:
  - @ → client/src
  - @shared → shared
  - @assets → attached_assets (se existir)
- components.json (shadcn): configura tailwind.config.ts, baseColor neutral, css client/src/index.css e aliases para components/ui/hooks/lib/utils

============================================================

3. Estrutura Completa do Projeto

projeto/
├── client/
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       │   ├── dashboard/
│       │   │   ├── revenue-chart.tsx
│       │   │   └── stats-cards.tsx
│       │   ├── events/
│       │   │   ├── event-modal.tsx
│       │   │   └── upcoming-events.tsx
│       │   ├── layout/
│       │   │   ├── header.tsx
│       │   │   └── sidebar.tsx
│       │   ├── payments/
│       │   │   └── recent-payments.tsx
│       │   └── ui/ ... (biblioteca shadcn/ui completa)
│       ├── hooks/
│       │   ├── use-auth.tsx
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       ├── lib/
│       │   ├── protected-route.tsx
│       │   ├── queryClient.ts
│       │   └── utils.ts
│       └── pages/
│           ├── active-clients-page.tsx
│           ├── auth-page.tsx
│           ├── clients-page.tsx
│           ├── dashboard-page.tsx
│           ├── documents-page.tsx
│           ├── events-month-page.tsx
│           ├── events-page.tsx
│           ├── expenses-page.tsx
│           ├── not-found.tsx
│           ├── payments-page.tsx
│           ├── pending-payments-page.tsx
│           ├── revenue-page.tsx
│           └── revenue-total-page.tsx
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── storage.ts
│   ├── vite.ts
│   └── .env
├── shared/
│   └── schema.ts
├── uploads/ (pasta de uploads, servida por /uploads)
├── .env (ATENÇÃO: arquivo aparente corrompido)
├── drizzle.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── components.json
├── package.json
├── package-lock.json
├── replit.md
├── PLANO_DE_ACAO.md
└── .gitignore

============================================================

4. Dependências e Versões EXATAS (package.json)

Dependencies (produção)
{
  "@hookform/resolvers": "^3.10.0",
  "@jridgewell/trace-mapping": "^0.3.25",
  "@neondatabase/serverless": "^0.10.4",
  "@radix-ui/react-accordion": "^1.2.4",
  "@radix-ui/react-alert-dialog": "^1.1.7",
  "@radix-ui/react-aspect-ratio": "^1.1.3",
  "@radix-ui/react-avatar": "^1.1.4",
  "@radix-ui/react-checkbox": "^1.1.5",
  "@radix-ui/react-collapsible": "^1.1.4",
  "@radix-ui/react-context-menu": "^2.2.7",
  "@radix-ui/react-dialog": "^1.1.7",
  "@radix-ui/react-dropdown-menu": "^2.1.7",
  "@radix-ui/react-hover-card": "^1.1.7",
  "@radix-ui/react-label": "^2.1.3",
  "@radix-ui/react-menubar": "^1.1.7",
  "@radix-ui/react-navigation-menu": "^1.2.6",
  "@radix-ui/react-popover": "^1.1.7",
  "@radix-ui/react-progress": "^1.1.3",
  "@radix-ui/react-radio-group": "^1.2.4",
  "@radix-ui/react-scroll-area": "^1.2.9",
  "@radix-ui/react-select": "^2.1.7",
  "@radix-ui/react-separator": "^1.1.7",
  "@radix-ui/react-slider": "^1.2.4",
  "@radix-ui/react-slot": "^1.2.0",
  "@radix-ui/react-switch": "^1.1.4",
  "@radix-ui/react-tabs": "^1.1.12",
  "@radix-ui/react-toast": "^1.2.7",
  "@radix-ui/react-toggle": "^1.1.3",
  "@radix-ui/react-toggle-group": "^1.1.3",
  "@radix-ui/react-tooltip": "^1.2.0",
  "@tanstack/react-query": "^5.60.5",
  "@types/multer": "^2.0.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "cmdk": "^1.1.1",
  "connect-pg-simple": "^10.0.0",
  "date-fns": "^3.6.0",
  "dotenv": "^17.2.1",
  "drizzle-orm": "^0.39.1",
  "drizzle-zod": "^0.7.0",
  "embla-carousel-react": "^8.6.0",
  "express": "^4.21.2",
  "express-session": "^1.18.1",
  "framer-motion": "^11.13.1",
  "input-otp": "^1.4.2",
  "lucide-react": "^0.453.0",
  "memorystore": "^1.6.7",
  "multer": "^2.0.2",
  "nanoid": "^5.1.5",
  "next-themes": "^0.4.6",
  "passport": "^0.7.0",
  "passport-local": "^1.0.0",
  "pino": "^9.7.0",
  "pino-http": "^10.5.0",
  "postgres": "^3.4.7",
  "react": "^18.3.1",
  "react-day-picker": "^8.10.1",
  "react-dom": "^18.3.1",
  "react-hook-form": "^7.55.0",
  "react-icons": "^5.4.0",
  "react-resizable-panels": "^2.1.7",
  "recharts": "^2.15.4",
  "tailwind-merge": "^2.6.0",
  "tailwindcss-animate": "^1.0.7",
  "tw-animate-css": "^1.2.5",
  "vaul": "^1.1.2",
  "wouter": "^3.3.5",
  "ws": "^8.18.0",
  "zod": "^3.24.2",
  "zod-validation-error": "^3.4.0"
}

DevDependencies
{
  "@replit/vite-plugin-cartographer": "^0.2.8",
  "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
  "@tailwindcss/typography": "^0.5.15",
  "@tailwindcss/vite": "^4.1.3",
  "@types/connect-pg-simple": "^7.0.3",
  "@types/express": "4.17.21",
  "@types/express-session": "^1.18.0",
  "@types/node": "20.16.11",
  "@types/passport": "^1.0.16",
  "@types/passport-local": "^1.0.38",
  "@types/react": "^18.3.11",
  "@types/react-dom": "^18.3.1",
  "@types/ws": "^8.5.13",
  "@vitejs/plugin-react": "^4.3.2",
  "autoprefixer": "^10.4.20",
  "drizzle-kit": "^0.31.4",
  "esbuild": "^0.25.0",
  "pino-pretty": "^13.1.1",
  "postcss": "^8.4.47",
  "tailwindcss": "^3.4.17",
  "tsx": "^4.19.1",
  "typescript": "5.6.3",
  "vite": "^6.3.5"
}

OptionalDependencies
{
  "bufferutil": "^4.0.8"
}

Observação: Os prefixos ^ indicam range semver; para Replit e reprodutibilidade pinne versões no package.json conforme necessário.

============================================================

5. Scripts e Comandos

Scripts do package.json
- dev:
  - Windows (usado no repo): set NODE_ENV=development&& node --env-file=server/.env --env-file=.env --import=dotenv/config ./node_modules/tsx/dist/cli.mjs server/index.ts
  - Replit/Linux recomendação: usar cross-env ou ajustar para export:
    - cross-env NODE_ENV=development node --env-file=server/.env --env-file=.env --import=dotenv/config ./node_modules/tsx/dist/cli.mjs server/index.ts
- build:
  - vite build (gera client em dist/public)
  - esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
- start:
  - NODE_ENV=production node dist/index.js
- check:
  - tsc
- db:push:
  - drizzle-kit push (aplica schema do shared/schema.ts no banco conforme drizzle.config.ts)

Como instalar
- Node 18+ recomendado
- Instalar dependências:
  - npm ci
- Preparar variáveis:
  - criar server/.env com DATABASE_URL
  - opcional: .env raiz com PORT e SESSION_SECRET

Como executar em desenvolvimento
- Replit/Linux:
  - cross-env NODE_ENV=development node --env-file=server/.env --env-file=.env --import=dotenv/config ./node_modules/tsx/dist/cli.mjs server/index.ts
- Windows (conforme repo):
  - npm run dev

Como fazer build
- npm run build

Como executar em produção local
- npm run build
- npm start

Como executar testes
- Não há testes configurados no repositório (nenhum framework de testes presente).

============================================================

6. Funcionalidades Implementadas

Fluxo de autenticação
- Registro: POST /api/register (cria usuário e loga)
- Login: POST /api/login (LocalStrategy, sessão via cookie)
- Logout: POST /api/logout
- Obter usuário: GET /api/user
- Usuário padrão semeado na inicialização:
  - username: Buffet
  - password: Caieiras23
  - nome: Administrador Buffet

Gestão de Clientes
- CRUD completo em /api/clients com validação usando zod (insertClientSchema)

Gestão de Eventos
- CRUD completo em /api/events com join de cliente
- Próximos eventos: /api/events/upcoming?limit=N

Pagamentos
- Listar todos: /api/payments
- Recentes: /api/payments/recent?limit=N
- Por evento: /api/payments/event/:eventId
- Criar pagamento: POST /api/payments

Documentos
- Upload: POST /api/documents (multipart, campo file)
- Listar: GET /api/documents (no momento retorna mock de 3 itens na rota, mas storage tem CRUD de documents no banco)
- Deletar: DELETE /api/documents/:id
- Servir arquivos: /uploads

Despesas
- CRUD em /api/expenses
- Por categoria: /api/expenses/categories

Estatísticas e Finanças
- /api/stats: métricas do mês (receita, despesas, lucro, eventos, clientes ativos, pendências)
- /api/stats/financial?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD: sumários completos (receita total, despesas, margem, por categoria, por mês)

UI/Frontend
- Rotas protegidas por sessão via ProtectedRoute e use-auth.tsx
- Páginas principais: dashboard, eventos, clientes, pagamentos, despesas, documentos, relatórios (receita total, eventos do mês, clientes ativos, pagamentos pendentes)
- Componentes de UI (shadcn + Radix) e gráficos

============================================================

7. ⚠️ Problemas e Bugs Atuais (Crítico)

Bugs ativos e riscos
1) Arquivo .env raiz corrompido
- Arquivo: .env
- Descrição: O conteúdo está com caracteres inválidos (provável encoding/binário), o que pode quebrar o carregamento de variáveis com dotenv.
- Steps para reproduzir:
  - Abrir .env e observar caracteres inválidos
  - Rodar npm run dev e ver warnings de variáveis
- Mensagem de erro esperada:
  - No server/db.ts: Error("DATABASE_URL not set...") se não achar
- Impacto: Alto — pode impedir inicialização ou conexões
- Tentativas de correção: Não há
- Workaround: Usar server/.env válido e remover .env corrompido ou recriar

2) Rota GET /api/documents retorna mock enquanto storage implementa persistência
- Arquivos: server/routes.ts (linhas ~193-219), server/storage.ts (métodos de documents)
- Descrição: A listagem retorna dados mockados na rota, não usa storage.getDocuments(). Cria inconsistência entre upload, listagem e delete.
- Steps: Autenticar, chamar GET /api/documents → retorna mock fixo
- Impacto: Médio — inconsistência funcional
- Tentativas de correção: Não há
- Workaround: Substituir implementação para usar storage.getDocuments()

3) Dependência memorystore não utilizada
- Arquivo: package.json
- Descrição: memorystore está nas deps mas não é referenciada no código.
- Impacto: Baixo — inchamento de dependências
- Ação sugerida: Remover ou usar

4) Variáveis de ambiente em Windows vs Replit/Linux
- Arquivo: package.json (script dev com set NODE_ENV=development&& ...)
- Descrição: script usa sintaxe Windows, falha no Replit
- Impacto: Alto em Replit — comando não roda
- Workaround: Usar cross-env

5) Gen_random_uuid() exige extensão pgcrypto
- Arquivo: shared/schema.ts (defaults id)
- Descrição: As colunas usam default(sql gen_random_uuid()). Requer extensão pgcrypto habilitada no banco.
- Impacto: Médio quando rodando migrations em DB sem pgcrypto
- Workaround: Habilitar extensão ou usar uuid_generate_v4() com uuid-ossp

6) Search path e schema app
- Arquivo: shared/schema.ts (pgSchema("app")), drizzle.config.ts
- Descrição: O código assume schema app e qualifica tabelas. Session store também usa schema app. Ambientes sem schema app precisarão de criação.
- Impacto: Médio — erro se schema não existir
- Workaround: Garantir criação schema app nas migrations

7) Segurança: usuário padrão com credenciais fixas
- Arquivo: server/auth.ts (createDefaultUser)
- Descrição: Cria usuário admin padrão no boot com senha conhecida
- Impacto: Alto em produção
- Workaround: Controlar criação via variável de ambiente (ex: SEED_DEFAULT_USER=false) ou remover em prod

8) Limites e tipos de upload
- Arquivo: server/routes.ts (multer)
- Descrição: Tipos permitidos definidos por extensão e limite 10MB; sem antivírus/verificação de conteúdo
- Impacto: Baixo/Médio — risco conteúdo indevido
- Workaround: Validador de MIME real e antivírus opcional

Limitações Técnicas
- Índices ausentes em colunas de filtro (payments.status, events.event_date, expenses.expense_date/status/category)
- Falta de testes automatizados
- Ausência de CSRF proteção (sessões + POSTs)
- CORS não configurado (não necessário local pois SPA e API no mesmo host via Vite proxy; problemático se separar domínios)
- Falta de paginação nas listagens

Issues de Ambiente
- .env raiz corrompido
- Necessidade de pgcrypto
- Scripts dev Windows-only
- Replit precisa REPL_ID para plugin cartographer se desejar habilitar

============================================================

8. Configurações de Ambiente

Variáveis de Ambiente (.env/server/.env)
Exigidas
- DATABASE_URL=postgresql://... (com sslmode=require e channel_binding=require no Neon)
Opcional/recomendadas
- SESSION_SECRET=valor-seguro
- PORT=3000 (ou 5000 no .env corrompido)
- NODE_ENV=development | production

Exemplos
.env (criar limpo no Replit)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
SESSION_SECRET=trocar-por-um-aleatorio
PORT=3000
NODE_ENV=development

server/.env (existe no repo)
DATABASE_URL=postgresql://neondb_owner:...@.../neondb?sslmode=require&channel_binding=require

Configurações importantes
- Portas: default 3000 (server/index.ts); .env amostral tinha 5000
- URLs de APIs: SPA consome via caminho relativo /api/* no mesmo host
- CORS: não configurado explicitamente (não necessário se mono host)
- Headers: X-Request-Id é setado pela app e retornado; cookies de sessão padrão do express-session

============================================================

9. Testes

- Framework: não configurado
- Cobertura atual: N/A
- Como executar testes: N/A
- Testes falhando: N/A
- Testes importantes a criar:
  - Auth e sessão (login/logout, proteção de rotas)
  - CRUD de clients/events/payments/expenses/documents
  - Estatísticas (validação de agregações)
  - Upload de documentos (tipos, limites)
  - Permissões básicas (não há RBAC completo, mas validar role/admin se for evoluir)

============================================================

10. Próximos Passos e Melhorias

Funcionalidades planejadas/sugestões
- Substituir mock de documentos por integração com storage.getDocuments() na rota GET /api/documents
- Implementar paginação nos endpoints de listagem
- Adicionar índices nas colunas usadas em filtros e ordenações
- Proteger endpoints POST/PUT/DELETE contra CSRF se expostos a domínios distintos
- Adicionar testes automatizados (Vitest/Jest, Supertest)
- Painel de configurações (gerenciar usuário/senha, temas)
- RBAC simples (role admin vs operator)

Refatorações necessárias
- Parametrizar criação do usuário padrão via env (desabilitar em produção)
- Isolar validações de entrada com zod em camada própria (evitar repetição em rotas)
- Remover dependências não utilizadas (memorystore) e revisar optionalDependencies

Bugs a corrigir
- Arquivo .env corrompido
- GET /api/documents retornar dados reais
- Scripts dev cross-plataforma (cross-env)

Otimizações
- Cache agressivo para endpoints de leitura com ETags (pino e headers)
- Ajustes de pooling no Neon (Pool do @neondatabase/serverless já configurado)
- Logging de performance (tempo de queries) e tracing de requestId em storage

============================================================

Instruções específicas Horizon Beta → Replit

Análise completa obrigatória
- Código examinado integralmente: backend (server/*), frontend (client/*), schema (shared/*), configs (vite/tailwind/postcss/tsconfig), envs
- Dependências documentadas com versões do package.json
- Estrutura mapeada e endpoints listados
- Compatibilidades com Replit revisadas

Possíveis incompatibilidades no Replit e recomendações
- Script dev Windows-only:
  - Ajustar para cross-env:
    - Instalar: npm i -D cross-env
    - Script: "dev": "cross-env NODE_ENV=development node --env-file=server/.env --env-file=.env --import=dotenv/config ./node_modules/tsx/dist/cli.mjs server/index.ts"
- .env raiz corrompido:
  - Remover/renomear e criar novo .env somente com ASCII/UTF-8
- Extensão pgcrypto:
  - Certificar que o banco Neon esteja com pgcrypto habilitado (necessário para gen_random_uuid)
- Schema app:
  - Garantir criação do schema app e tabela session; drizzle-kit push deve criar tabelas do app. connect-pg-simple está configurado para criar a tabela session automaticamente com schemaName: app.
- Cartographer plugin:
  - É carregado somente quando REPL_ID existe e NODE_ENV !== production. Não é obrigatório.
- Replit deploy:
  - Use npm run build e npm start. Vite já coloca client em dist/public e server é bundleado em dist/index.js

============================================================

Como rodar no Replit (passos práticos)

1) Definir variáveis no Secrets do Replit:
- DATABASE_URL (Postgres/Neon) com sslmode=require
- SESSION_SECRET (valor aleatório forte)
- PORT (opcional, default 3000)

2) Ajustar script dev para Replit:
- Instalar cross-env:
  - npm i -D cross-env
- Alterar package.json → scripts.dev para:
  - "dev": "cross-env NODE_ENV=development node --env-file=server/.env --env-file=.env --import=dotenv/config ./node_modules/tsx/dist/cli.mjs server/index.ts"

3) Executar migrações:
- npx drizzle-kit push

4) Executar em desenvolvimento (HMR + API):
- npm run dev

5) Build e produção:
- npm run build
- npm start

============================================================

Mapeamento de Rotas (Backend)

Autenticação
- POST /api/register
- POST /api/login
- POST /api/logout
- GET /api/user

Saúde
- GET /healthz
- GET /readyz

Clientes
- GET /api/clients
- POST /api/clients
- PUT /api/clients/:id
- DELETE /api/clients/:id

Eventos
- GET /api/events
- GET /api/events/upcoming?limit=10
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

Pagamentos
- GET /api/payments
- GET /api/payments/recent?limit=10
- GET /api/payments/event/:eventId
- POST /api/payments

Documentos
- GET /api/documents
- POST /api/documents (multipart: file)
- DELETE /api/documents/:id
- GET /uploads/... (arquivos estáticos)

Estatísticas
- GET /api/stats
- GET /api/stats/financial?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

Despesas
- GET /api/expenses
- GET /api/expenses/categories
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id

Cash Flow
- GET /api/cashflow?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

============================================================

Configurações relevantes

- Vite (dev)
  - Root: client/
  - Build: dist/public
  - Aliases: @, @shared, @assets
  - Plugins: react, runtimeErrorOverlay, cartographer (condicional)
  - server.fs.strict: true

- Server (prod)
  - Serve estático de dist/public via server/vite.ts (serveStatic)
  - Host: localhost
  - Porta: PORT || 3000

- Tailwind
  - content: ./client/index.html, ./client/src/**/*.{js,jsx,ts,tsx}
  - plugins: tailwindcss-animate, @tailwindcss/typography

- TypeScript
  - paths: @/* → client/src/*, @shared/* → shared/*

============================================================

Observações de Segurança

- Não usar credenciais padrão em produção (Buffet / Caieiras23)
- Definir SESSION_SECRET forte via env
- Habilitar HTTPS no ambiente de produção (requer proxy externo em Replit)
- Validar tamanho e tipo real de arquivos enviados (MIME) para documentos
- Considerar CSRF se separar frontend e backend por domínios distintos

============================================================

Referências diretas ao código

- Scripts e dependências: package.json
- Entrada do servidor: server/index.ts
- Rotas/REST: server/routes.ts
- Autenticação e sessão: server/auth.ts
- Acesso a dados e estatísticas: server/storage.ts
- DB e Drizzle: server/db.ts e shared/schema.ts; drizzle.config.ts
- Integração Vite/Express: server/vite.ts; vite.config.ts
- Frontend root: client/index.html; client/src/main.tsx; client/src/App.tsx
- Proteção de rotas client: client/src/lib/protected-route.tsx
- Auth client: client/src/hooks/use-auth.tsx
- Tailwind/PostCSS: tailwind.config.ts; postcss.config.js
- TS config: tsconfig.json

============================================================

Diagramas (alto nível)

Frontend SPA → Backend API (Express)
[Client SPA] --> [GET/POST /api/* via fetch (credenciais include)]
[Client SPA] --> [Assets estáticos via Vite (dev) ou dist/public (prod)]
[Express] --> [Passport + Session (cookie)]
[Express] --> [Storage (Drizzle ORM)]
[Storage] --> [PostgreSQL (Neon)]

Fluxo de autenticação
[Login Form] --> [POST /api/login]
[Express/Passport] --> [Sessão criada (cookie)]
[Client ProtectedRoute] --> [GET /api/user] --> [Permite acesso às rotas privadas]

============================================================

Checklist para migração Replit (resumo)

- [ ] Criar .env válido (UTF-8) e/ou usar Secrets do Replit com DATABASE_URL, SESSION_SECRET, PORT
- [ ] Garantir pgcrypto e schema app no DB; rodar npx drizzle-kit push
- [ ] Ajustar script dev para cross-env
- [ ] Validar que uploads/ está acessível e persistente no Replit (volume/armazenamento)
- [ ] Corrigir GET /api/documents para usar storage.getDocuments()
- [ ] Verificar porta final (PORT) e mapeamento no Replit

============================================================

FIM