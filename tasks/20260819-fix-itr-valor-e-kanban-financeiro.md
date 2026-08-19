# Tarefa: Corrigir valor ITR e botão financeiro no kanban

- **Status:** done
- **Data:** 2026-08-19
- **Slug:** `20260819-fix-itr-valor-e-kanban-financeiro`

## Objetivo

Corrigir parse duplicado de centavos no create ITR (R$ 30,00 gravava R$ 0,30). No kanban, se o card já tiver lançamento ativo, trocar “Lançar no financeiro” por “Ver no financeiro”.

## Fora de escopo

- Backfill de lançamentos ITR já gravados com valor errado
- Permitir segundo lançamento no mesmo card

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [ ] outro: ___

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum desvio. `FindKanbanCardService` orquestra `FinancialEntryRepository` (só dados); regra de quais entries entram na resposta fica no service.

## Critérios de aceite

- [x] ITR com R$ 30,00 grava e mostra R$ 30,00 no financeiro e na lista ITR
- [x] Card ITR com lançamento: botão **Ver no financeiro**, não criar segundo lançamento
- [x] Card sem lançamento: **Lançar no financeiro** igual hoje
- [x] Query `?id=` abre o lançamento na tela de contas

## Progresso

- [x] Corrigir `parseCreateBody` do ITR
- [x] `listActiveByKanbanCardId` + detalhe do card
- [x] Botão kanban + query na página de lançamentos
