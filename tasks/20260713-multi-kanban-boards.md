# Tarefa: Multi-kanban — boards, acesso, prioridade e destaque

- **Status:** done
- **Data:** 2026-07-13
- **Slug:** `20260713-multi-kanban-boards`

## Objetivo

Múltiplos boards por empresa: 1 default com 4 colunas base; boards custom com membros; prioridade; UI com tabs + modo todos/destaque (localStorage).

## Fora de escopo

- Notificações
- Tags por board
- Drag reorder entre boards
- Preferência destaque no servidor
- Perfil `super` no kanban

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

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
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateKanbanBoardService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

`kanban_columns.board_id` nullable no schema para backfill de colunas antigas via `EnsureDefaultKanbanBoardService`. App sempre exige board após ensure.

## Critérios de aceite

- [x] Branch criada a partir de `main`
- [x] 1 board default por empresa; colunas base por board; default não deletável
- [x] Board custom com membros; admin cria; admin ou criador edita
- [x] Prioridade ordena lista; UI tabs + todos/destaque (localStorage)
- [x] `GET /board` exige `boardId`; acesso respeitado; soft-delete; UUID

## Progresso

- [x] Schema + push DB
- [x] Backend API boards
- [x] Scope boardId em colunas/cards
- [x] Frontend
- [x] Aceite
