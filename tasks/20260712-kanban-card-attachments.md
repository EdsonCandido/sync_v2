# Tarefa: Kanban — anexos em cards (BYTEA)

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-kanban-card-attachments`

## Objetivo

Permitir N anexos por card do Kanban: upload multipart, conteúdo binário no Postgres (`bytea`), listagem no detalhe, download autenticado e soft-delete.

## Fora de escopo

- Disco local / S3 / CDN / preview inline
- Virus scan
- Anexos no create-card (antes do card ter id)
- Contador de anexos no card do board

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

Upload via `req.file` (multer memoryStorage) no controller — boundary HTTP, não regra de negócio. Download devolve body binário (`Content-Disposition`) em vez de JSON.

## Critérios de aceite

- [x] Upload N arquivos no card (edit); bytes + metadados no Postgres; lista no detalhe sem `content` no JSON
- [x] Download autenticado devolve arquivo original a partir do BYTEA
- [x] Soft-delete some da lista; sem hard-delete
- [x] Mesmas regras de acesso do card; UUID + `ativo`/`created_at`/`updated_at`
- [x] Histórico com evento `attachment`

## Progresso

- [x] Schema + push DB
- [x] Backend API
- [x] Frontend UI
- [x] Aceite
