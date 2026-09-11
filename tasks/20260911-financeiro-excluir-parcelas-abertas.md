# Tarefa: Excluir parcelas em aberto junto com a conta

- **Status:** done
- **Data:** 2026-09-11
- **Slug:** `20260911-financeiro-excluir-parcelas-abertas`

## Objetivo

Ao excluir um lançamento financeiro que pertença a um grupo de parcelas com outras parcelas em aberto, perguntar se a exclusão deve aplicar só na vigente ou também nas demais em aberto.

## Fora de escopo

- Alterar schema DB / migrations.
- Propagar exclusão para parcelas já pagas ou canceladas.
- Alterar fluxo de cancelamento (só soft-delete).
- Hard-delete.

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
- [ ] `*Repository.ts` (classe; só acesso a dados) — reuso de `listOpenByGroup` / `softDelete`
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP) — sem path novo
- [ ] `*.routes.ts` + registro em `routes/index.ts` — sem path novo
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `SoftDeleteFinancialEntryService.ts`
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum desvio.

## Critérios de aceite

- [x] Excluir sem grupo / só 1 aberta: soft-delete só da conta; sem pergunta de escopo.
- [x] Com outras abertas: pergunta; “somente esta” não mexe nas irmãs.
- [x] “Demais em aberto”: todas abertas do grupo soft-deleted; pagas/canceladas intactas.
- [x] Vale para a pagar e a receber.
- [x] Sem hard-delete; sem mudança de schema DB.

## Progresso

- [x] Branch `feat/financeiro-excluir-parcelas-abertas` a partir de `main`
- [x] Flag `deleteOpenInstallments` no contract
- [x] Propagação no `SoftDeleteFinancialEntryService`
- [x] Confirm no `FinancialEntriesPage` + API client
- [x] Critérios de aceite validados
