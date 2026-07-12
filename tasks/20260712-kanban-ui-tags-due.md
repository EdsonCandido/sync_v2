# Tarefa: Redesign Kanban UI + previsão + tags

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-kanban-ui-tags-due`

## Objetivo

Redesenhar UI do Kanban (SaaS moderno + Framer Motion) e adicionar `dueAt` (previsão de conclusão) + tags, mantendo regras de acesso e funcionalidades atuais.

## Fora de escopo

- Prioridade
- Anexos
- Comentários separados do histórico
- Mudança de regras admin/cliente/colunas base

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [x] `packages/contracts`
- [x] `packages/types`
- [ ] `packages/auth`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task`
- [x] `chakra-ui-builder`
- [ ] `better-auth-best-practices`
- [ ] `turborepo`

## Checklist backend

- [x] Schema dueAt + kanban_tags + kanban_card_tags
- [x] Contracts/query filtros
- [x] Repos/services sync tags
- [x] observationCount na listagem

## Checklist frontend

- [x] framer-motion
- [x] Toolbar / Stats / Column / Card componentizados
- [x] Dialog dueAt + tags
- [x] Skeleton / empty / error / responsivo

## Critérios de aceite

- [x] UI moderna + dark mode
- [x] Previsão de conclusão + atraso visual + KPI
- [x] Tags add/remove + filtro/busca
- [x] Funções atuais intactas

## Progresso

- [x] Schema + push
- [x] API
- [x] UI
- [x] Aceite
