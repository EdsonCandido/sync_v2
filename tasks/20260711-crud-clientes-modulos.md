# Tarefa: CRUD Clientes + permissões por módulo

- **Status:** done
- **Data:** 2026-07-11
- **Slug:** `20260711-crud-clientes-modulos`

## Objetivo

CRUD completo de clientes (PF/PJ, documento alfanumérico, endereço na mesma tabela + mapa CEP/geocode) e sistema de permissões por módulo (`ler`/`editar`) para clientes, financeiro e kanban.

## Fora de escopo

- CRUD real de financeiro / kanban
- CRUD de usuários (só atribuição de módulos)
- Row-level “cliente só vê próprios registros”
- Upload / logo

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [x] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
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

1. CEP/geocode: `super` **ou** módulo `clientes` com `edit` — super precisa do proxy no form de empresas.
2. `admin_empresa` tem acesso implícito total aos módulos company (sem linhas em `user_module_permissions`).

## Critérios de aceite

- [x] Tabela `clients` + CRUD API/UI com PF/PJ, documento só letras/números, endereço + mapa
- [x] Soft-delete; UUID; escopo por `companyId`
- [x] `user_module_permissions` + middleware; sidebar e rotas respeitam grants
- [x] `super` só empresas/planos; `admin_empresa` tudo company; `cliente` só módulos associados
- [x] Admin atribui ler/editar na UI de permissões
- [x] CEP/geocode servem super (empresas) e quem edita clientes

## Progresso

- [x] Task file
- [x] Schema + contracts + types
- [x] Backend permissões + middleware + CEP/geocode
- [x] Backend CRUD clientes
- [x] Seed
- [x] Frontend permissões + sidebar
- [x] Frontend CRUD clientes
