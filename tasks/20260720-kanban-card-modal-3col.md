# Tarefa: Modal kanban 3 colunas (Pipefy)

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-kanban-card-modal-3col`

## Objetivo

Refazer o modal do card do kanban em layout largo de 3 colunas inspirado no Pipefy: cliente + detalhes, histórico/responsáveis, seletor de fases com cor. Enriquecer o detail API com dados de endereço do cliente.

## Fora de escopo

- Alterar visual do card (`KanbanCardItem*`) ou layout da página index/board.
- Clone pixel-perfect do Pipefy.
- Campo `observacoes` na tabela `clients` (usar `description` do card).

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
- [x] `chakra-ui-refactor`

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

Nenhum.

## Critérios de aceite

- [x] Modal edit abre grande, 3 colunas no desktop; 1 coluna no mobile.
- [x] Col1 mostra endereço do cliente quando há `clientId`.
- [x] Col2 mostra responsáveis + histórico.
- [x] Col3 lista fases com cor; seleção move o card sem drag.
- [x] Card do board e página index visualmente iguais.
- [x] Create/edit/save/checklist/anexos/finance continuam funcionando.

## Progresso

- [x] Task file criado
- [x] Backend: enrich client no detail
- [x] Frontend: modal 3 colunas + subcomponentes
- [x] Phase select + wiring columns
- [x] Validação final
