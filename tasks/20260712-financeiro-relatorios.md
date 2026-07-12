# Tarefa: Relatórios do módulo financeiro

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-financeiro-relatorios`

## Objetivo

Entregar 12 relatórios financeiros com tela filtrável (período) + export PDF cada um: Geral, Fluxo de Caixa (realizado+previsto), Receitas/Despesas por período, Receitas por Cliente, Despesas por Categoria, Centro de Custo, Inadimplência, Clientes Devedores, Pagamentos/Recebimentos por Banco, Extrato Financeiro.

## Fora de escopo

- Conciliação bancária / caixa diário
- Gráficos dentro do PDF
- CSV/Excel
- Seletor multi-empresa
- Engine genérico de relatórios
- Notificações de inadimplência
- Mudança de schema DB

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se precisar pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [x] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
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

Helper compartilhado `FinanceiroPdfHelper` (money/date/header/tabela) e shell UI `FinanceiroReportPage` — evita 12 cópias de boilerplate PDF/UI. Regra de negócio permanece em Services separados (1 Get + 1 Generate PDF por relatório). Sem engine genérico.

## Critérios de aceite

- [x] 12 relatórios com `GET /api/financeiro/relatorios/:slug` (JSON) e `GET .../:slug/pdf`
- [x] Filtro `from`/`to` (default mês corrente); extrato exige `bankAccountId`
- [x] Fluxo de caixa: série diária realizado (payments) + previsto (vencimentos open) + saldo acumulado
- [x] Inadimplência com aging 0–30 / 31–60 / 61–90 / 90+
- [x] UI hub + página por slug com filtros, tabela/KPIs e botão Baixar PDF
- [x] Permissão `financeiro` read; companyId só da sessão
- [x] PDF saúde financeira existente permanece

## Progresso

- [x] Task + contracts
- [x] Repository aggregations
- [x] Services Get + PDF (12)
- [x] Controller + rotas
- [x] Web hub + páginas
- [x] Check + aceite
