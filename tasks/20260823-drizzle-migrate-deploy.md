# Tarefa: Deploy com drizzle-kit migrate

- **Status:** done
- **Data:** 2026-08-23
- **Slug:** `20260823-drizzle-migrate-deploy`

## Objetivo

Trocar o deploy de `drizzle-kit push` (interativo, quebra sem TTY) para `drizzle-kit migrate` com SQL versionado. Incluir migration idempotente para `plans` (`duration_days`) e tabelas pendentes.

## Fora de escopo

- Reescrever histórico completo do schema em migrations
- Mudar fluxo Route/Service/UI
- Remover `db:push` do monorepo (continua no local)
- Mover migrate para o entrypoint do server

## Apps / packages tocados

- [ ] `apps/server`
- [ ] `apps/web`
- [x] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `deploy.sh`, `docs/PRODUCAO.md`, `docs/LOCAL.md`, `README.md`, `turbo.json`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [x] Schema em `packages/db` (migration delta; schema TS já existe)
- [x] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [ ] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [ ] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [ ] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [ ] Componentes com Chakra UI v3 + tokens semânticos
- [ ] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Migration SQL idempotente (delta) em vez de dump full-schema: banco de prod já existia via `push` histórico. `drizzle.config.ts` aponta `./src/schema/index.ts` (pasta inteira duplicava indexes via barrel + arquivos).

## Critérios de aceite

- [x] `./deploy.sh` aplica schema sem TTY / sem prompt
- [x] Prod com `plans` antigo migra dados e fica com `duration_days`
- [x] Tabelas `company_module_permissions` e `login_access_logs` existem após migrate
- [x] Docs refletem migrate em prod e push opcional em local
- [x] Próximas mudanças: `db:generate` → commit SQL → deploy migrate

## Progresso

- [x] Tarefa criada
- [x] Migration `0000` + journal + snapshot
- [x] `deploy.sh` + docs
- [x] Validação local (DB antigo + remigrate + `generate` sem delta)
