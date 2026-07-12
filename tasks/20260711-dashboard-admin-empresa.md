# Tarefa: Dashboard Administrador da Empresa

- **Status:** done
- **Data:** 2026-07-11
- **Slug:** `20260711-dashboard-admin-empresa`

## Objetivo

Dashboard agregado multi-tenant para `perfil=admin_empresa` em `/dashboard`: KPIs, gráficos, atividades, pendências, insights e ações rápidas — com API e schema completos, isolados por `companyId`.

## Fora de escopo

- CRUD completo de usuários/solicitações/contratos/pagamentos (só leitura agregada + seed)
- Dashboard do `super` ou do `cliente`
- Troca de visual brand (manter Helios)

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [x] `packages/auth` (additionalFields; hook de access tracking no server)
- [x] `packages/contracts`
- [x] `packages/types`
- [ ] `packages/utils`
- [ ] outro: ___

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [x] Schema em `packages/db` (se precisar de tabela)
- [x] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
- [x] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Access tracking no hook `after` de sign-in em `apps/server/src/auth.ts` (já usado para validação de login) — domínio fica no server, sem regra de negócio em `packages/auth`.

## Critérios de aceite

- [x] `admin_empresa` vê KPIs + 2 gráficos + atividades + pendências + insights + ações rápidas em `/dashboard`
- [x] Dados só da própria `companyId`
- [x] Skeleton, empty e error states
- [x] Responsivo + dark mode
- [x] Soft-delete + UUID em tabelas novas
- [x] Seed reproduz cenário demo com insights não vazios

## Progresso

- [x] Task file
- [x] Schema + types + contracts
- [x] Backend API
- [x] Seed + db:push
- [x] Frontend components + rota
