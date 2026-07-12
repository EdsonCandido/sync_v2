# Tarefa: CRUD completo de Planos

- **Status:** done
- **Data:** 2026-07-11
- **Slug:** `20260711-crud-planos`

## Objetivo

Completar CRUD de Planos (listagem paginada, update, soft-delete) e tela dashboard exclusiva SUPER, reusando padrão de Empresas.

## Fora de escopo

- Campos extras de billing/limites
- Histórico de mudanças de plano
- Reatribuir empresas em massa ao excluir plano

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task`
- [x] `chakra-ui-builder`
- [ ] `better-auth-best-practices`
- [ ] `turborepo`

## Checklist backend

- [x] Contracts update/list
- [x] `PlanRepository` list paginado, update, softDelete
- [x] `FindPlanService`, `UpdatePlanService`, `SoftDeletePlanService`, `ListPlanOptionsService`
- [x] `PlanController` + rotas (incluindo `/options`)
- [x] Soft-delete bloqueia se empresa ativa usa o plano

## Checklist frontend

- [x] Menu Planos (só SUPER)
- [x] `dashboard.planos.tsx` + `PlanFormDialog`
- [x] `plans-api.ts`; Empresas usa `/api/plans/options`

## Critérios de aceite

- [x] SUPER: list/search/paginação/create/edit/view/soft-delete
- [x] ADMIN/cliente: sem menu e API 403
- [x] Soft-delete com empresa vinculada → 409
- [x] Select Empresas continua com planos ativos

## Progresso

- [x] Task
- [x] Backend
- [x] Frontend
