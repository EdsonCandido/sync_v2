# Tarefa: Controle de módulos por empresa

- **Status:** done
- **Data:** 2026-08-23
- **Slug:** `20260823-modulos-por-empresa`

## Objetivo

Super configura, por empresa, quais módulos o `admin_empresa` acessa (`canAccess`) e quais pode liberar a clientes (`canLiberate`). Desativar acesso cascateia revogando grants dos clientes. CLI libera todos os módulos para empresas existentes (compat produção).

## Fora de escopo

- Controle por usuário admin (escopo é por empresa)
- Módulos embutidos em planos
- Alterar permissões do perfil `super`

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
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

- [x] Schema `company_module_permissions` em `packages/db`
- [x] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at`
- [x] Contracts: list/upsert company modules
- [x] `CompanyModulePermissionRepository.ts`
- [x] `GetCompanyModulesService.ts` / `UpsertCompanyModulesService.ts` (cascade)
- [x] `CompanyModulePermissionController.ts` + rotas `requireSuper`
- [x] Ajustar `GetMyModulesService`, middlewares, upsert/list permissões cliente
- [x] CLI `db:grant-all-company-modules` idempotente
- [x] IDs: UUID apenas

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] UI módulos no fluxo Empresas (super): Acessar / Liberar
- [x] Tela Permissões: só módulos `canLiberate`
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

## Critérios de aceite

- [x] Super configura por empresa `canAccess` / `canLiberate` na UI de Empresas
- [x] Admin só vê/usa módulos com `canAccess`; só libera módulos com `canLiberate`
- [x] Desativar `canAccess` revoga grants daquele módulo nos clientes da empresa
- [x] Sem rows na tabela = comportamento legado (tudo liberado)
- [x] `npm run db:grant-all-company-modules` libera todos os módulos para todas as empresas
- [x] Sem hard-delete; IDs UUID; fluxo Route → Controller → Service → Repository

## Progresso

- [x] Schema + contracts
- [x] API super + cascade
- [x] Enforce admin/cliente
- [x] CLI grant-all
- [x] UI Empresas + Permissões

## Deploy

Após `db:push` / migrate, rodar `npm run db:grant-all-company-modules` antes de o super restringir módulos.
