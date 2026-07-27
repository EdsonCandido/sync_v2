# Tarefa: Filtro data financeiro — busca explícita

- **Status:** done
- **Data:** 2026-07-27
- **Slug:** `20260727-financeiro-filtro-data-explicito`

## Objetivo

Parar auto-fetch ao mudar datas nos filtros do financeiro. Datas ficam em rascunho até o usuário clicar Pesquisar. Load inicial com defaults (mês/ano) continua.

## Fora de escopo

- Backend / contratos.
- Mudar comportamento de status ou busca textual.
- Dashboard index do financeiro (sem filtro de data).

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

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [ ] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [ ] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [ ] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Mudar De/Até em contas a receber/pagar não dispara request até Pesquisar
- [x] Mudar De/Até em relatórios financeiros não dispara request até Pesquisar
- [x] Load inicial com defaults (mês/ano) continua ao abrir a página
- [x] Status e busca textual mantêm comportamento atual

## Progresso

- [x] Draft + botão Pesquisar em `FinancialEntriesPage`
- [x] Draft + botão Pesquisar em `FinanceiroReportPage`
