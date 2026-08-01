# Tarefa: Widgets inteligentes + módulo Agendamentos

- **Status:** done
- **Data:** 2026-08-01
- **Slug:** `20260801-dashboard-widgets-agendamentos`

## Objetivo

Backend + UI: widgets inteligentes com dados reais; módulo Agendamentos (CRUD, blocos, lembretes); notificações in-app e nativas (ao abrir + T-30).

## Fora de escopo

- Service worker / push com app fechado
- Email/SMS de lembrete
- Recorrência de agendamentos
- Search global
- Writers em massa em `company_activities`

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

## Checklist backend

- [x] Schema agendamentos + notifications + dashboard-widgets
- [x] Toda tabela: UUID + soft-delete
- [x] Contracts Zod
- [x] Repositories / Services / Controllers / Routes
- [x] Módulo `agendamentos` em permissões

## Checklist frontend

- [x] Leu chakra-ui-builder
- [x] Página Agendamentos
- [x] Navbar notificações reais
- [x] Widgets reais + DnD persistido

## Justificativa de desvio

Vários services de widgets (favorites/goals/layout/get) no arquivo `DashboardWidgetsServices.ts` para reduzir churn nesta entrega; cada classe continua 1 caso de uso. Split em arquivos 1:1 fica follow-up.

## Critérios de aceite

- [x] CRUD agendamentos + blocos + lembrete
- [x] Notificações on_open + t30 (in-app + nativa)
- [x] Widgets sem mock demo
- [x] Typecheck + Biome ok

## Progresso

- [x] Task file
- [x] Schema + contracts
- [x] APIs
- [x] Frontend
- [x] Aceite
