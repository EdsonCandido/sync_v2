# Tarefa: CLI backfill financeiro empresas existentes

- **Status:** done
- **Data:** 2026-07-23
- **Slug:** `20260723-backfill-financeiro-empresas`

## Objetivo

Comando npm idempotente que aplica categorias receita/despesa e centros de custo padrão em todas as empresas ativas já cadastradas, sem duplicar o que já existe.

## Fora de escopo

- Conta bancária / fornecedor
- Lançamentos
- UI
- Soft-delete de itens extras fora do catálogo

## Apps / packages tocados

- [x] `apps/server`
- [ ] `apps/web`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task`

## Checklist backend

- [x] `CompanyRepository.listAllActive`
- [x] `BackfillCompaniesFinanceiroDefaultsService`
- [x] Script CLI + `db:seed-financeiro-defaults`

## Critérios de aceite

- [x] `npm run db:seed-financeiro-defaults` percorre empresas `ativo=true`
- [x] Reexecução não duplica categorias por nome nem centros por código
- [x] Usa `SeedCompanyFinanceiroDefaultsService` (mesma lógica do create)

## Progresso

- [x] Task + implementação
