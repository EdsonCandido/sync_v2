# Tarefa: Separar docs projeto / local / produção

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-docs-setup-split`

## Objetivo

Separar documentação em três arquivos: `README.md` (projeto), `docs/LOCAL.md` (dev), `docs/PRODUCAO.md` (deploy). Alinhar `.env.example` às portas reais do Compose/Vite para PC novo funcionar sem adivinhar portas.

## Fora de escopo

- Mudar Dockerfiles, stack ou comportamento de produção.
- Alterar código de aplicação além dos `.env.example`.

## Apps / packages tocados

- [ ] `apps/server`
- [ ] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `README.md`, `docs/`, `.env.example`, `apps/server/.env.example`, `apps/web/.env.example`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

N/A — só documentação e exemplos de env.

## Checklist frontend (se aplicável)

N/A

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] `README.md` descreve o projeto e linka `docs/LOCAL.md` + `docs/PRODUCAO.md`
- [x] `docs/LOCAL.md` cobre passo a passo: envs, network proxy, db:start, db:push, db:seed, npm run dev
- [x] `docs/PRODUCAO.md` cobre Ubuntu + Docker + NPM (conteúdo atual de produção)
- [x] `.env.example` do server usa porta `15432` e `CORS_ORIGIN` `5173` para local

## Progresso

- [x] Task file criado
- [x] `.env.example` alinhados
- [x] `README.md` reescrito
- [x] `docs/LOCAL.md` criado
- [x] `docs/PRODUCAO.md` criado
