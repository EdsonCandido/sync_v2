# AGENTS.md — sync_v2

Guia obrigatório para agentes e contribuidores. Toda implementação futura segue este documento.

## Stack

| Camada   | Tecnologia                        |
| -------- | --------------------------------- |
| Monorepo | Turborepo + npm workspaces        |
| Web      | React, React Router, Chakra UI v3 |
| Server   | Express                           |
| DB       | PostgreSQL + Drizzle              |
| Auth     | Better Auth (`packages/auth`)     |

## Estrutura do monorepo

```
apps/
  server/     # API Express — única casa da regra de negócio
  web/        # Frontend React + Chakra UI

packages/
  auth/       # Config Better Auth (sem regra de negócio de domínio)
  config/     # Tooling / tsconfig compartilhado
  db/         # Schema Drizzle + client (sem regra de negócio)
  contracts/  # DTOs / schemas de API compartilhados
  types/      # Tipos compartilhados
  utils/      # Helpers puros reutilizáveis
```

- Apps ficam em `apps/`.
- Código reutilizável fica em `packages/`.
- **Nenhuma regra de negócio** em `packages/*`.
- **Toda regra de negócio** em `apps/server/src` (Services).

`packages/env` existe como infra de variáveis de ambiente. `packages/ui` é legado — não colocar regra de negócio lá.

## Arquitetura do server

```
apps/server/src/
  config/
  controllers/
  middlewares/
  repositories/
  routes/
  services/
  utils/
  app.ts
  server.ts
  index.ts
```

Fluxo obrigatório: **Route → Controller → Service → Repository → Drizzle**.

| Camada     | Pode                                 | Não pode                                                |
| ---------- | ------------------------------------ | ------------------------------------------------------- |
| Controller | HTTP: Request → Service → Response   | DB, SQL, Drizzle, regra de negócio                      |
| Service    | 1 caso de uso; toda regra de negócio | Drizzle direto; múltiplos casos de uso no mesmo arquivo |
| Repository | Acesso a dados via Drizzle           | Regra de negócio                                        |
| Route      | Wire path → controller + middlewares | Lógica de domínio                                       |
| Middleware | auth, authz, erro, logging           | Regra de negócio de domínio                             |

### Convenções (classes + nomes)

Sempre **classes** para Controllers, Services e Repositories.

Nome do arquivo = nome da classe:

- `ClientController.ts`
- `ClientRepository.ts`
- `CreateClientService.ts`
- `FindClientService.ts`
- `UpdateClientService.ts`
- `SoftDeleteClientService.ts`

Responsabilidade única: 1 arquivo = 1 responsabilidade. Evitar arquivos grandes, Services com múltiplas responsabilidades e Controllers com lógica.

Rotas: um módulo por arquivo (`client.routes.ts`). `routes/index.ts` registra todas as rotas. Middlewares só em `middlewares/`.

Desvio do padrão só com justificativa técnica clara documentada na tarefa em `tasks/`.

## IDs (obrigatório: UUID)

**Toda primary key e FK de domínio usa UUID.** Proibido `serial`, `bigserial`, autoincrement ou qualquer ID sequencial numérico.

| Campo | Coluna | Tipo |
| ----- | ------ | ---- |
| `id`  | `id`   | `uuid`, PK, default `gen_random_uuid()` / `defaultRandom()` |

- Schema Drizzle: usar `idColumn()` de `packages/db/src/schema/columns.ts` (ou equivalente `uuid("id").defaultRandom().primaryKey()`).
- FKs: coluna `uuid(...)` referenciando a PK.
- Inserts manuais: `createId()` de `@sync_v2/utils` (`crypto.randomUUID()`).
- Better Auth: `advanced.database.generateId: "uuid"` — nunca `"serial"`.
- Desvio só com justificativa na tarefa em `tasks/`.

## Soft-delete e auditoria de tabelas (obrigatório)

**Nunca hard-delete.** Proibido `DELETE` SQL / `db.delete()` / remoção física em Repositories e Services da aplicação.

“Excluir” = soft-delete: `ativo = false` e atualizar `updated_at` (e `updated_by` quando o campo existir).

**Toda tabela** (nova ou existente) deve conter:

| Campo        | Coluna       | Tipo                                      |
| ------------ | ------------ | ----------------------------------------- |
| `id`         | `id`         | uuid, PK, default random (ver seção IDs)  |
| `ativo`      | `ativo`      | boolean, default `true`, not null         |
| `createdAt`  | `created_at` | timestamp, default now, not null          |
| `updatedAt`  | `updated_at` | timestamp, default now, `$onUpdate`, not null |

Helpers em `packages/db/src/schema/columns.ts`: `idColumn()`, `softDeleteColumns`.

- Listagens/leituras de domínio filtram `ativo = true` por padrão (exceto auditoria/admin explícito).
- Service de exclusão: `SoftDeleteXService.ts` — nunca hard delete.
- Desvio só com justificativa na tarefa em `tasks/` (ex.: limitação de lib externa como Better Auth em `session`/`verification`).

## Frontend (Chakra UI)

Antes de criar ou alterar componentes/páginas em `apps/web`, ler e seguir a skill:

`.agents/skills/chakra-ui-builder/SKILL.md`

## Como criar uma tarefa

1. Ler este `AGENTS.md`.
2. Copiar `tasks/TEMPLATE.md` → `tasks/YYYYMMDD-slug.md`.
3. Preencher objetivo, escopo, camadas e skills.
4. Só então implementar, marcando o checklist.
5. Usar a skill `.agents/skills/create-task/SKILL.md`.

## Skills por contexto

| Contexto                | Skill                             |
| ----------------------- | --------------------------------- |
| Criar / executar tarefa | `create-task`                     |
| UI / componentes Chakra | `chakra-ui-builder` (obrigatório) |
| Auth Better Auth        | `better-auth-best-practices`      |
| Turborepo / pipeline    | `turborepo`                       |
