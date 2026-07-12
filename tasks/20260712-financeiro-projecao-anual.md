# Tarefa: Gráfico projeção anual financeira

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-financeiro-projecao-anual`

## Objetivo

Adicionar no dashboard Saúde financeira um gráfico de projeção do ano civil corrente (jan–dez, 12 meses sem faltar nenhum) com receitas e despesas mês a mês, baseado no vencimento dos lançamentos não cancelados.

## Fora de escopo

- Seletor de ano
- Realizado vs projetado separado
- PDF
- Fluxo de caixa diário

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
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
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

Nenhuma.

## Critérios de aceite

- [x] API devolve exatamente 12 meses do ano corrente
- [x] Gráfico mostra receitas e despesas em todos os meses (zero ok)
- [x] Títulos cancelados fora; soft-delete respeitado

## Progresso

- [x] Task file
- [x] `yearlyProjectionByDueDate` no repository
- [x] Contract + dashboard service + tipo web
- [x] `ProjecaoAnualChart` no dashboard
