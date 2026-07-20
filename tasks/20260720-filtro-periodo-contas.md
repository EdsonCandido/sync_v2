# Tarefa: Filtro De/Até em Contas a pagar e Contas a receber

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-filtro-periodo-contas`

## Objetivo

Adicionar filtro de período (De / Até) nas listagens de Contas a pagar e Contas a receber, com default do 1º ao último dia do mês atual, filtrando por data de vencimento.

## Fora de escopo

- Dashboard financeiro, bancos, relatórios, fluxo de caixa
- Sync com URL query params
- Default no server
- Filtrar por emissão/liquidação

## Apps / packages tocados

- [ ] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [ ] outro: ___

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

N/A — API já aceita `from`/`to` por `data_vencimento`.

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

## Critérios de aceite

- [x] Contas a pagar e Contas a receber exibem inputs De / Até
- [x] Carga inicial usa 1º dia → último dia do mês corrente
- [x] Listagem envia `from`/`to` e filtra por vencimento
- [x] Mudança de datas reseta página para 1
- [x] Outras telas financeiras não são alteradas

## Progresso

- [x] Criar esta tarefa
- [x] Tipar `from`/`to` em `financeiroApi.listLancamentos`
- [x] `monthRange` + state + UI + load em `FinancialEntriesPage`
