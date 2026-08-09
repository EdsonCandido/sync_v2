# Tarefa: CORS com múltiplos origins (vírgula)

- **Status:** done
- **Data:** 2026-08-09
- **Slug:** `20260809-cors-multi-origin`

## Objetivo

Permitir vários domínios em `CORS_ORIGIN` separados por vírgula, usados no middleware CORS e no `trustedOrigins` do Better Auth.

## Fora de escopo

- Alterar domínios reais de produção no servidor.
- Mudanças de UI.

## Apps / packages tocados

- [x] `apps/server`
- [ ] `apps/web`
- [ ] `packages/db`
- [x] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `packages/env`, `docs/`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [ ] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [ ] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [ ] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [ ] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [ ] Componentes com Chakra UI v3 + tokens semânticos
- [ ] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

N/A — mudança de env/infra, sem camadas CRUD.

## Critérios de aceite

- [x] `CORS_ORIGIN` aceita 1+ URLs separadas por vírgula
- [x] Express `cors` e Better Auth `trustedOrigins` usam a lista
- [x] Docs / `.env.example` documentam o formato

## Progresso

- [x] Schema Zod em `packages/env`
- [x] `apps/server` + `packages/auth`
- [x] Docs
