# Tarefa: Seed base limpa (3 usuários + financeiro mínimo)

- **Status:** done
- **Data:** 2026-07-13
- **Slug:** `20260713-seed-base-limpa`

## Objetivo

Ajustar o bootstrap Helios para deixar a base mínima: só 3 usuários (`super`, `admin_empresa`, `cliente`), cliente padrão, categorias financeiras, centros de custo, 1 banco default e 1 fornecedor avulso. Soft-delete do restante (sem hard-delete).

## Fora de escopo

- UI
- Reset total do Postgres (drop schema / migrate fresh)
- Soft-delete de kanban / módulos fora de empresas, financeiro e usuários

## Apps / packages tocados

- [x] `apps/server` (`seed.ts`)
- [ ] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `packages/env` (env opcional do fornecedor), `.env.example`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

- [x] Seed garante 3 usuários
- [x] Seed garante cliente padrão
- [x] Seed garante categorias + centros de custo + 1 banco
- [x] Seed cria fornecedor avulso
- [x] Soft-delete de usuários extras
- [x] Soft-delete de clientes / bancos / fornecedores / lançamentos extras da empresa seed
- [x] Sem hard-delete / `db.delete()`

## Justificativa de desvio (só se necessário)

Seed faz soft-delete em massa via Drizzle no script de bootstrap (fora do fluxo Route→Controller→Service). Aceitável: configuração de ambiente, não regra de negócio de runtime.

## Critérios de aceite

- [x] `npm run db:seed` deixa ativos só os 3 e-mails seed
- [x] Só empresa Helios ativa; cliente padrão + fornecedor avulso + 1 banco + 12 categorias + 6 centros
- [x] Lançamentos e dados de outras empresas ficam `ativo=false`
- [x] Reexecutar seed é idempotente

## Progresso

- [x] Branch `chore/20260713-seed-base-limpa`
- [x] Atualizar `seed.ts` + env
- [x] Rodar seed e validar
