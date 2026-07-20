# Tarefa: Fluxo de caixa — gráfico mensal

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-fluxo-caixa-grafico-mensal`

## Objetivo

Série do gráfico de fluxo de caixa agregada por mês (Entrada / Saída / Saldo) quando o range cruza meses; diária só no mesmo mês. UI + PDF saúde.

## Fora de escopo

- Mudar KPIs / tabela diária
- Charts Receitas×Despesas / Evolução
- PDF saúde com filtro intra-mês (fixa ano)

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task`
- [x] `chakra-ui-builder`
- [ ] `better-auth-best-practices`
- [ ] `turborepo`

## Checklist backend

- [x] Helpers em `financeiroReportShared`
- [x] `GetFluxoCaixaReportService` — series mensal/diária
- [x] `GenerateFinanceiroSaudePdfService` — labels mês

## Checklist frontend

- [x] `FinanceiroReportPage` — chart 3 séries + labels

## Critérios de aceite

- [x] Fluxo no ano: ~12 pontos Jan–Dez; Entrada, Saída, Saldo
- [x] Filtro um mês: gráfico diário
- [x] PDF saúde fluxo: eixos só mês
- [x] Tabela detalhe ainda lista dias

## Progresso

- [x] Task
- [x] Service + helpers
- [x] UI
- [x] PDF
