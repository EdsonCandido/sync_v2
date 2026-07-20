# Tarefa: Recriar card concluído em outro kanban

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-kanban-recreate-card`

## Objetivo

Permitir recriar um card na coluna Concluído em outro kanban, mantendo o cliente, permitindo trocar responsáveis, e com opções de copiar histórico, checklist e/ou anexos. O card original permanece com evento de auditoria.

## Fora de escopo

- Mover card entre kanbans (drag/move continua bloqueado).
- Soft-delete do card original.
- Copiar lançamentos financeiros.
- Alterar schema de tabelas (reusa tabelas existentes).

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

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
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

- [x] Botão só em card na coluna Concluído.
- [x] Novo card no kanban escolhido, coluna A fazer, mesmo cliente, assignees escolhidos.
- [x] Original permanece; histórico origem registra recreate.
- [x] Flags checklist/anexos/histórico respeitadas de forma independente.
- [x] Move entre kanbans via drag continua bloqueado.

## Progresso

- [x] Task file criado
- [x] Contracts
- [x] Backend service + repos + rota
- [x] Frontend dialog + wiring
- [x] Validação final
