# Tarefa: Gráficos financeiros Jan–Dez do ano atual

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-graficos-financeiro-meses-ano`

## Objetivo

Receitas x Despesas e Evolução mensal passam a exibir sempre os 12 meses Jan–Dez do ano corrente, ordenados, com zero nos meses sem pagamento (sem janela rolante).

## Fora de escopo

- Alterar Projeção do ano / lógica por vencimento
- Mudar contracts (shape já serve)
- Schema / migrations

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
- [x] `*Repository.ts` (classe; só acesso a dados) — `yearlyPaymentSeries`
- [x] `*Service.ts` (uma classe por caso de uso) — `GetFinanceiroDashboardService`
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Eixo X dos dois gráficos: Jan, Fev, … Dez (nessa ordem)
- [x] Sempre 12 pontos/colunas no ano atual
- [x] Mês sem pagamento aparece com 0 (não some)
- [x] Projeção do ano inalterada

## Progresso

- [x] Task file criado
- [x] Repository: série Jan–Dez (`yearlyPaymentSeries`)
- [x] Service: sem slice(-6)
- [x] Frontend: labels + subtítulos
