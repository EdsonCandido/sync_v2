# Tarefa: ITR data vencimento + reupload docs

- **Status:** done
- **Data:** 2026-07-27
- **Slug:** `20260727-itr-vencimento-e-docs`

## Objetivo

Na criação do ITR, exigir `dataVencimento` para o lançamento financeiro cair no mês certo. Na edição, permitir alterar observações e refazer upload de declaração/recibo/anexos (substituindo declaração/recibo).

## Fora de escopo

- Editar valor ou data financeira após criado.
- Mudar cliente, status kanban ou schema DB novo.
- Migrar lançamentos ITR já criados no mês errado.

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
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

## Critérios de aceite

- [x] Criar ITR com vencimento em julho → lançamento aparece em julho
- [x] Criar com declaração/recibo/anexos continua ok
- [x] Editar: mudar observações; substituir declaração/recibo; adicionar/remover anexos
- [x] Sem hard-delete; IDs UUID

## Progresso

- [x] Contracts: `dataVencimento` obrigatório; `updateItrProcessSchema`; kind no upload
- [x] CreateItrProcessService: remover `month + 1`
- [x] UpdateItrProcessService + PATCH
- [x] UploadItrFileService com kind + replace
- [x] Form create: campo data vencimento
- [x] Dialog detalhe: obs + reupload por kind
