---
name: create-task
description: >-
  Creates and executes work tasks for the sync_v2 monorepo using tasks/TEMPLATE.md,
  AGENTS.md architecture (Controller → Service → Repository), and required skills.
  Use when the user asks to create a task, feature, bugfix, ticket, or execution
  plan; or before implementing multi-file changes across apps/server or apps/web.
---

# Create Task

## When to use

Before implementing a feature, bugfix, or multi-file change: create a task file, then execute against its checklist.

## Steps

1. Read [`AGENTS.md`](../../../AGENTS.md) at repo root.
2. Copy [`tasks/TEMPLATE.md`](../../../tasks/TEMPLATE.md) → `tasks/YYYYMMDD-slug.md`.
3. Fill objective, out of scope, touched apps/packages, skills, acceptance criteria.
4. Mark status `in_progress`.
5. Read required skills before coding.
6. Implement only what the task lists. Update checkboxes as you go.
7. Mark status `done` when acceptance criteria pass.

## Backend rules (mandatory)

- Business logic only in `apps/server/src` Services.
- No business logic in `packages/*`.
- Flow: Route → Controller → Service → Repository → Drizzle.
- Classes only for Controllers, Services, Repositories.
- File name = class name (`CreateClientService.ts`, `ClientController.ts`, `ClientRepository.ts`).
- One file = one responsibility. One Service = one use case.
- Controllers: HTTP only. Repositories: data access only.
- Routes: `*.routes.ts` per module; register in `routes/index.ts`.
- Middlewares only under `middlewares/`.
- Deviation requires justification in the task file.
- Soft-delete obrigatório: toda tabela com `ativo`, `created_at`, `updated_at`. Proibido hard-delete na app. Exclusão = `ativo = false`. Service: `SoftDeleteXService.ts`.
- IDs obrigatórios em UUID: PK/FK com `uuid` (`idColumn()`). Proibido serial/sequencial. Inserts: `createId()` em `@sync_v2/utils`. Auth: `generateId: "uuid"`.

## Frontend rules (mandatory)

If the task touches UI in `apps/web`:

1. Read and follow [`.agents/skills/chakra-ui-builder/SKILL.md`](../chakra-ui-builder/SKILL.md).
2. Do not invent a parallel UI stack.

## Other skills

- Auth changes: [`.agents/skills/better-auth-best-practices/SKILL.md`](../better-auth-best-practices/SKILL.md)
- Turborepo / pipelines: [`.agents/skills/turborepo/SKILL.md`](../turborepo/SKILL.md)

## Do not

- Start multi-file features without a task file.
- Put domain rules in `packages/db`, `packages/contracts`, or other packages.
- Call Drizzle from Services or Controllers.
- Use functions instead of classes for Controller / Service / Repository.
