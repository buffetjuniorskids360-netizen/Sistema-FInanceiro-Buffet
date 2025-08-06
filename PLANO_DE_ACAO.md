# Plano de Ação Integrado — API, Banco de Dados (Neon/MCP), Segurança, Observabilidade e CI/CD

Este documento consolida o plano de diagnóstico e correção da API, auditoria/organização do banco de dados (PostgreSQL/Neon), integração com MCP do Neon, segurança/compliance, testes e pipeline CI/CD. Foi adaptado ao projeto atual com Drizzle ORM, Express e frontend em React, e utiliza as melhores práticas para garantir confiabilidade, performance, segurança e boa DX.

Sumário
- 0) Resumo, Milestones e Cronograma
- 1) Diagnóstico da API e Correções
- 2) Banco de Dados (Auditoria, Esquema, Migrações e Neon/MCP)
- 3) Segurança e Conformidade
- 4) Observabilidade e SRE
- 5) CI/CD, Rollout e Rollback
- 6) Inicialização, Seeds e Testes do Sistema
- 7) README.md Consolidado (pronto para colar)
- 8) Todo List Final, Riscos e Mitigações
- 9) Anexos (DDL/Migrações, Exemplos e Comandos)

Observação
- Este plano substitui e integra o conteúdo anterior, mantendo os objetivos e tarefas, mas ampliando com cronograma, checklists, entregáveis e exemplos práticos prontos para execução.

## 0) Resumo, Milestones e Cronograma

Milestones
- M1: Banco consistente no Neon (branch temporária via MCP), migrações aplicadas e smoke test DB.
- M2: API corrigida com padronização de erros, autenticação/validação e testes de integração/contrato.
- M3: Segurança (RLS/roles), observabilidade (tracing, logs, métricas) e backup/restore testados.
- M4: CI/CD com migrações automatizadas via MCP (gated), deploy com rollback e README final.

Cronograma por ondas
- Semana 1–2: Diagnóstico de API e auditoria de banco; DER e plano de migração; branch temporária MCP.
- Semana 3–4: Segurança (JWT, RBAC), padronização de erros e validações; observabilidade.
- Semana 5–6: CI/CD (lint, build, testes, security scan, migrações, deploy), performance/tuning, README final; fechamento da Todo List.

Critérios de sucesso (exemplos)
- Erros 5xx < 0.5% e 4xx coerentes; p95 < 300ms; disponibilidade 99.9%.
- Cobertura de testes alvo (unit/integration/contract), regressões zero após release.
- Migrações seguras via MCP (prepare/complete), rollback testado.

## 1) Diagnóstico da API e Correções

1.1 Levantamento detalhado de erros
- Coletar logs estruturados e stack traces por endpoint (server/index.ts e middlewares).
- Registrar: rota, método, status code, traceId/requestId, usuário/role (se autenticado), latência.
- Categorizar por: autenticação/autorização, validação, timeouts/latência, concorrência, idempotência, versionamento, CORS, serialização, rate limiting, schema/DB, dependências externas.

1.2 Metodologia de diagnóstico
- Observabilidade: habilitar logs estruturados (pino), tracing (OpenTelemetry) e métricas (Prometheus).
- Testes de contrato: gerar OpenAPI (quando aplicável) e validar com Dredd/Prism.
- Repro de falhas: testes de integração com cenários reais e fixtures; reproduzir 500/422/401/403/404.
- Tracing ponta-a-ponta: HTTP e consultas pg para identificar gargalos.

1.3 Padrão de respostas de erro e correlação
- Payload JSON de erro:
{
  "error": "ValidationError",
  "message": "Invalid payload",
  "code": "ERR_VALIDATION",
  "traceId": "a1b2c3d4",
  "details": [{ "path": "username", "message": "required" }]
}
- Incluir traceId/requestId em todas as respostas e logs.
- Implementar mapeamento global de exceções: middleware/ExceptionFilter que normaliza códigos e mensagens.

1.4 Estratégias de correção por categoria
- AuthN/AuthZ: JWT (access/refresh), RBAC baseado em roles/claims; expiração curta; refresh seguro.
- Validação: DTOs com class-validator (Nest) ou Zod (Express); 422/400 padronizados.
- Timeouts/latência: timeouts no driver pg; índices adequados; paginação keyset; evitar N+1.
- Concorrência/Idempotência: idempotency-key para POST críticos; transações; isolamento REPEATABLE READ; locks quando estritamente necessário.
- Versionamento: prefixo /v1; política de depreciação com sunset headers.
- CORS: restringir a origins confiáveis; métodos e headers necessários.
- Rate limiting: e.g. 100 req/min por IP/usuário; lockout progressivo em login.
- Erros de schema: alinhar tipos entre ORM e DB; tratar nullability e defaults; corrigir FKs.
- Dependências externas: backoff exponencial, circuit breaker.

1.5 Plano de testes automatizados
- Unit: serviços/validadores (≥80%).
- Integração: repositórios/queries e rotas principais usando banco isolado (branch dev no Neon).
- Contrato: 100% dos endpoints publicados usando OpenAPI + Dredd/Prism.
- E2E: fluxos críticos (auth, CRUD).
- Segurança: fuzzing, injeções, brute force, RBAC, vazamento de dados.
- Performance: k6/Artillery, medindo p50/p95/p99 e throughput.

## 2) Banco de Dados (Auditoria, Esquema, Migrações e Neon/MCP)

2.1 Estado atual e auditoria
- Schema em [shared/schema.ts](shared/schema.ts) usa drizzle-orm/pg-core com tabelas: users, clients, events, payments, documents, expenses, cash_flow.
- Confirmar no Neon: listar tabelas e comparar; gerar DER. Validar PKs, FKs, NOT NULL, UNIQUE, CHECKs, índices e RLS.

2.2 Esquema final proposto (namespace app)
- Criar schema app e ativar extensões; mover tabelas para app.*; habilitar RLS.
- Índices: FKs e colunas de filtro/ordenação. Checks para status.

2.3 DDL base idempotente (para usar via MCP prepare_database_migration)
-- Schema e extensões
CREATE SCHEMA IF NOT EXISTS app;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabelas e colunas principais (users, clients, events, payments, documents, expenses, cash_flow) com PK uuid DEFAULT gen_random_uuid()
-- Exemplo de checks e FKs (comportamentos de deleção):
ALTER TABLE app.events
  DROP CONSTRAINT IF EXISTS events_client_id_fkey,
  ADD CONSTRAINT events_client_id_fkey FOREIGN KEY (client_id) REFERENCES app.clients(id) ON DELETE RESTRICT;

ALTER TABLE app.payments
  DROP CONSTRAINT IF EXISTS payments_event_id_fkey,
  ADD CONSTRAINT payments_event_id_fkey FOREIGN KEY (event_id) REFERENCES app.events(id) ON DELETE CASCADE;

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_events_client ON app.events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON app.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON app.events(event_date);
CREATE INDEX IF NOT EXISTS idx_payments_event ON app.payments(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON app.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_clients_name ON app.clients(name);
CREATE INDEX IF NOT EXISTS idx_documents_client ON app.documents(client_id);

-- RLS e Roles mínimas
CREATE ROLE app_rw NOINHERIT;
CREATE ROLE app_ro NOINHERIT;
GRANT USAGE ON SCHEMA app TO app_rw, app_ro;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_rw;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO app_ro;

DO $$
DECLARE r TEXT;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'app'
  LOOP
    EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY;', r);
    EXECUTE format('DROP POLICY IF EXISTS %I_rw_policy ON app.%I;', r, r);
    EXECUTE format('DROP POLICY IF EXISTS %I_ro_policy ON app.%I;', r, r);
    EXECUTE format('CREATE POLICY %I_rw_policy ON app.%I FOR ALL TO app_rw USING (true) WITH CHECK (true);', r, r);
    EXECUTE format('CREATE POLICY %I_ro_policy ON app.%I FOR SELECT TO app_ro USING (true);', r, r);
  END LOOP;
END $$;

2.4 Estratégia de migração segura
- Versionamento: migrations/ com timestamps (YYYYMMDDHHMM__descricao.sql).
- Up/Down: up idempotente quando possível (IF NOT EXISTS); down seguro.
- Rollout via MCP:
  1) prepare_database_migration → aplica em branch temporária, retorna Migration ID, Branch ID.
  2) run_sql → validar resultado (information_schema).
  3) complete_database_migration → aplica no main e limpa branch.
- Backup/Restore: snapshots do Neon antes de migrações de risco; playbook de restore testado.

2.5 Boas práticas de conexão
- Pool pg com SSL (rejectUnauthorized: false quando necessário).
- min=2 max=10; idleTimeoutMillis=30000; connectionTimeoutMillis=5000.
- Retries exponenciais para erros transitórios; prepared statements conforme padrão de uso.
- Transações e isolamento adequados (REPEATABLE READ quando necessário).

2.6 Observabilidade de DB
- Métricas de consultas (latência, erros), deadlocks, tempo por endpoint/consulta.
- EXPLAIN ANALYZE para rotas críticas; prepare_query_tuning do MCP para índices.

## 3) Segurança e Conformidade

- Usuários/roles com privilégios mínimos (app_rw/app_ro), segregação por ambiente (dev/stage/prod).
- TLS em trânsito (sslmode=require); dados sensíveis com hashing e mascaramento em logs.
- Segredos em .env local e Secret Manager (GitHub Secrets, etc.); rotação periódica de credenciais e chaves JWT.
- RLS ativado com políticas coerentes com RBAC; testes de RBAC nos testes de integração.
- Backups automáticos e testes de restore; RPO 1h, RTO 2h como metas.
- LGPD/GDPR: minimização de dados, retenção mínima, direito ao esquecimento (onde aplicável).

## 4) Observabilidade e SRE

- Tracing: OpenTelemetry (Node SDK + exporter OTLP) → Jaeger/Tempo.
- Logs: pino com JSON, níveis e correlação (requestId/traceId).
- Métricas: prom-client (requests_total, request_duration_seconds, db_query_duration_seconds, error_count).
- Health/readiness: /healthz (heap/event loop) e /readyz (SELECT 1 no DB).
- Alertas e SLOs: 5xx > 1% por 5m; p95 > 300ms; erro de DB e latência ACIMA do normal; disponibilidade 99.9%.

## 5) CI/CD, Rollout e Rollback

Pipeline GitHub Actions (exemplo)
- Estágios: lint → build → testes (unit/int/contract/security) → migração via MCP (gated) → deploy.
- Migrações via MCP:
  - prepare_database_migration com SQL gerado (Drizzle ou DDL).
  - Validação automatizada (run_sql + checagens).
  - Aprovação manual ou revisão → complete_database_migration.
- Zero-downtime:
  - DDL backward-compatible, índices CONCURRENTLY (quando aplicável), feature flags para releases.

Pseudocode de jobs
- build-test: npm ci, lint, build, test.
- db-migrations: preparar migração via MCP em branch temporária; gate de aprovação; completar migração.
- deploy: somente após migrações aprovadas.

Rollback
- Reverter env para última release; complete_database_migration reverso (down scripts) ou restore de snapshot Neon conforme severidade.

## 6) Inicialização, Seeds e Testes do Sistema

Ordem de inicialização
1) Provisionar DB no Neon via MCP.
2) Aplicar migrações (prepare → validar → complete).
3) Rodar seeds mínimos (usuário admin, cliente/evento/pagamento de teste).
4) Iniciar API e executar smoke tests.

Seeds mínimos (exemplo)
- Admin: username admin, senha strong (hash).
- Cliente e evento de teste + pagamento.

Testes do sistema
- Unitários de serviços, validadores.
- Integração de repositórios/queries e rotas.
- Contrato (OpenAPI + Dredd/Prism).
- Segurança (injeções, brute force, RBAC).
- Carga/estresse: k6/Artillery.

## 7) README.md Consolidado (pronto para colar)

README.md
# Projeto BuffetJuniors — API + DB (Neon)

## Visão Geral
API Node.js/TypeScript com Postgres (Neon). Esquema gerenciado via MCP Neon (prepare/complete). Observabilidade e segurança integradas.

## Requisitos
- Node.js 20+
- DATABASE_URL (Neon, sslmode=require)
- Docker (opcional)
- GitHub Actions (CI/CD)

## Setup Rápido
1) Variáveis (.env):
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
JWT_SECRET=change_me
PORT=3000
CORS_ORIGIN=http://localhost:5173

2) Instalação:
npm ci

3) Dev:
npm run dev

## Banco de Dados
- MCP Neon:
  - prepare_database_migration → branch temporária
  - run_sql → validação
  - complete_database_migration → aplica no main
- Schema base: app.users, app.clients, app.events, app.payments, app.documents, app.expenses, app.cash_flow
- RLS: app_rw (RW), app_ro (RO)

## Migrações
- migrations/ timestampadas (up/down).
- Rollout via MCP; rollback via down ou snapshot Neon.

## Testes
- Unit: npm run test:unit
- Integração: npm run test:int
- Contrato: npm run test:contract
- Segurança: npm run test:security
- Carga: npm run test:load

## Segurança
- JWT + refresh; RBAC
- CORS restrito, Helmet, rate limiting
- RLS, segredos externos

## Observabilidade
- OpenTelemetry (traces), pino (logs), Prometheus (métricas)
- Health: /healthz; Readiness: /readyz

## CI/CD
- Lint/build/test
- Migrações via MCP com gate
- Deploy e rollback

## Troubleshooting
- sslmode=require; role/claims; branch MCP e logs

## Compatibilidade
- Node 20; Postgres 14+; Drizzle/pg

## Roadmap
- Particionamento histórico; Redis; canary releases

## Changelog Resumido
- v0.1: schema base, auth e observabilidade inicial

## 8) Todo List Final, Riscos e Mitigações

Todo List (exemplo priorizado)
- [ ] P0: Aplicar DDL base via MCP (prepare → validar → complete) e validar tabelas no Neon
- [ ] P0: Padronizar erros, habilitar logs estruturados e OpenTelemetry
- [ ] P0: Implementar JWT + RBAC + CORS + rate limiting + validações DTO
- [ ] P1: Testes de integração/contrato (100% endpoints públicos)
- [ ] P1: Configurar CI/CD com estágio de migração (gated)
- [ ] P1: Criar backups/snapshots e teste de restore documentado
- [ ] P2: Índices finos e tuning em consultas críticas
- [ ] P2: README final publicado e mantido

Riscos e mitigação
- Migração quebrar produção → MCP prepare/complete + snapshot + gate.
- RLS bloquear app → políticas permissivas em dev + testes de RBAC.
- Custos/limites Neon → autoscale adequado + alertas.
- Latência intermitente → pooling/keep-alive + índices/prepared statements.

## 9) Anexos (DDL/Migrações, Exemplos e Comandos)

9.1 DDL base (idempotente)
- Vide seção 2.3. Use-a no MCP prepare_database_migration antes de completar.

9.2 Consultas de validação
-- Tabelas/índices:
SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='app';
SELECT * FROM pg_indexes WHERE schemaname='app';
-- Sanidade:
SELECT 1;
-- Planos:
EXPLAIN ANALYZE SELECT * FROM app.events WHERE status='pending' AND event_date >= CURRENT_DATE ORDER BY event_date DESC LIMIT 20;

9.3 Boas práticas de conexão (pg)
- Pool com SSL, min/max ajustados, timeouts; retries; prepared statements quando aplicável.

9.4 Exemplos de testes (conceituais)
- Jest/supertest para integração; Dredd/Prism para contrato; k6/Artillery para carga.

9.5 CI/CD (conceitual)
- GitHub Actions com jobs build-test, db-migrations (MCP prepare/complete) e deploy; gates manuais em produção.

— Fim do Plano Integrado —
