# Tarefa: Seed usuário super

- **Status:** done
- **Data:** 2026-07-11
- **Slug:** `20260711-seed-super-user`

## Objetivo

Script de seed com configurações iniciais: usuário `perfil=super` via Better Auth. Credenciais só em variáveis de ambiente.

## Fora de escopo

- Seed de outras entidades / empresas
- Desabilitar Sign Up público
- UI de onboarding

## Apps / packages tocados

- [x] `apps/server`
- [ ] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `packages/env`, root `package.json`, `.env.example`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

- [x] Env: `SEED_SUPER_NAME`, `SEED_SUPER_EMAIL`, `SEED_SUPER_PASSWORD`
- [x] Script seed idempotente (`auth.api.signUpEmail` + update `perfil=super`)
- [x] Script npm `db:seed`

## Critérios de aceite

- [x] Sem credenciais hardcoded no código-fonte
- [x] `npm run db:seed` cria (ou garante) usuário super a partir do `.env`
- [x] Reexecutar seed não duplica usuário

## Progresso

- [x] Env + seed + scripts
