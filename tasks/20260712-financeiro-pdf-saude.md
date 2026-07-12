# Tarefa: PDF saúde financeira

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-financeiro-pdf-saude`

## Objetivo

Exportar PDF da saúde financeira no dashboard: KPIs do mês + detalhe de contas a pagar/receber em aberto + resumo por centro de custo (split receber/pagar). Geração server-side com pdfkit; botão de download na página Saúde financeira.

## Fora de escopo

- Gráficos no PDF
- Fluxo de caixa
- Engine genérico de relatórios
- Filtro de datas na UI
- Geração PDF no browser

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Dep `pdfkit` em `apps/server`: monorepo sem gerador PDF; geração server-side garante auth + blob estável. Endpoint devolve binário (sem schema Zod de response).

## Critérios de aceite

- [x] Usuário com `financeiro` read baixa PDF pelo dashboard
- [x] PDF traz KPIs + listas pagar e receber em aberto + resumo por centro (split receber/pagar)
- [x] Sem hard-delete / sem IDs serial; sem mudança de schema DB

## Progresso

- [x] Task file
- [x] Repository: `listOpenEntriesForReport` + `groupOpenByCostCenterAndKind`
- [x] `pdfkit` + `GenerateFinanceiroSaudePdfService`
- [x] `FinanceiroReportController` + rota PDF
- [x] Botão + `downloadSaudeFinanceiraPdf` no dashboard
