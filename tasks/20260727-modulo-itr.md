# Tarefa: Módulo ITR

- **Status:** done
- **Data:** 2026-07-27
- **Slug:** `20260727-modulo-itr`

## Objetivo

Criar módulo ITR que cadastra processos por cliente (CPF), sobe N arquivos (≥2), cria lançamento a receber + card no board Kanban ITR (colunas fixas), e expõe consulta pública Helios por CPF com download só em Pago/Disponível.

## Fora de escopo

- Auto-sync liquidação financeira ↔ coluna do kanban.
- Multi-empresa na consulta pública (fixo Helios).
- S3 / storage externo (bytea no Postgres).

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [x] `packages/types`
- [ ] `packages/utils`
- [x] outro: `packages/env`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [x] Schema em `packages/db` (se precisar de tabela)
- [x] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
- [x] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Rotas públicas `/api/public/itr/*` sem `requireAuth` — consulta aberta por CPF escopo Helios.

## Critérios de aceite

- [x] Cadastro ITR cria cliente (se novo) + lançamento a receber + card no board ITR coluna `a_fazer` + ≥2 arquivos
- [x] Board ITR com 5 colunas fixas; mover card altera consulta pública
- [x] `/consultar-itr` + botões login/landpage; busca só Helios; download só em `pago`/`disponivel`
- [x] Soft-delete + UUID em tabelas novas; módulo `itr` no menu com grant

## Progresso

- [x] Task file
- [x] Schema / types / env / contracts
- [x] Backend autenticado
- [x] Backend público
- [x] Seed board ITR
- [x] Frontend dashboard
- [x] Frontend público
