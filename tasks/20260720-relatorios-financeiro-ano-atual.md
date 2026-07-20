# Tarefa: Relatórios financeiros — default Jan–Dez ano atual

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-relatorios-financeiro-ano-atual`

## Objetivo

Período default dos relatórios financeiros = 01/01–31/12 do ano corrente (UI + backend). PDF de saúde: fluxo no ano e labels Jan–Dez nos gráficos mensais.

## Fora de escopo

- Mudar série diária do fluxo para mensal
- Alterar KPIs “do mês” na capa do PDF saúde
- Contracts / schema

## Apps / packages tocados

- [x] `apps/server`
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

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` — `financeiroReportShared`, `GenerateFinanceiroSaudePdfService`
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: padrão do monorepo
- [x] IDs: UUID apenas

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Abrir relatório sem filtro → De/Até = 01/01 e 31/12 do ano atual
- [x] Request sem `from`/`to` no backend → range anual
- [x] PDF saúde: charts mensais com labels Jan–Dez; fluxo cobrindo o ano
- [x] Usuário ainda muda período manualmente

## Progresso

- [x] Task file
- [x] Shared defaultYearRange
- [x] UI yearRange
- [x] PDF saúde
