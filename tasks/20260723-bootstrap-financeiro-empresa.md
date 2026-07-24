# Tarefa: Bootstrap financeiro ao criar empresa

- **Status:** done
- **Data:** 2026-07-23
- **Slug:** `20260723-bootstrap-financeiro-empresa`

## Objetivo

Ao criar empresa no painel admin (`POST /api/companies`), cadastrar automaticamente categorias de receita/despesa e centros de custo padrão (mesmo catálogo do seed), no mesmo request.

## Fora de escopo

- Conta bancária / fornecedor padrão
- Lançamentos financeiros
- Mudança de UI no painel
- Backfill de empresas já existentes

## Apps / packages tocados

- [x] `apps/server`
- [ ] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [ ] outro: ___

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados) — repos existentes
- [x] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP) — sem mudança
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [ ] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [ ] Componentes com Chakra UI v3 + tokens semânticos
- [ ] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Criar empresa em `/dashboard/empresas` → empresa nova já tem 5 categorias receita, 7 despesa, 6 centros
- [x] `POST /api/companies` faz o bootstrap no mesmo request
- [x] Seed CLI e create usam o mesmo catálogo
- [x] Soft-delete / UUID intactos; sem regra de negócio em `packages/*`

## Progresso

- [x] Catálogo `defaultFinanceiroCatalog.ts`
- [x] `SeedCompanyFinanceiroDefaultsService`
- [x] Hook em `CreateCompanyService`
- [x] `seed.ts` importa catálogo
