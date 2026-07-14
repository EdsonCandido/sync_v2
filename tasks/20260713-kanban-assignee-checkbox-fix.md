# Tarefa: Fix seleção de responsáveis no Kanban

- **Status:** done
- **Data:** 2026-07-13
- **Slug:** `20260713-kanban-assignee-checkbox-fix`

## Objetivo

Corrigir o dialog de create/edit de card Kanban para permitir marcar/desmarcar qualquer responsável da lista (não só o primeiro), usando `Fieldset` + `CheckboxGroup` no lugar de vários `Checkbox` dentro de `Field.Root`. Remover instrumentação de debug.

## Fora de escopo

- Backend / API de assignees
- Filtro de responsável na toolbar do Kanban
- Checklist e outros campos do dialog

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



## Critérios de aceite

- [x] Create card: dá para marcar/desmarcar qualquer usuário da lista de Responsáveis
- [x] Edit card: idem
- [x] Validação ≥1 responsável e payload `assigneeUserIds` mantidos
- [x] Logs de debug (`127.0.0.1:7381` / `data-debug-assignees`) removidos

## Progresso

- [x] Task criada
- [x] `KanbanCardDialog.tsx`: Fieldset + CheckboxGroup
- [x] Debug removido
- [x] Critérios de aceite ok
