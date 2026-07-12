# Tarefa: CRUD Usuários + senhas por perfil

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-crud-usuarios`

## Objetivo

CRUD de usuários com módulo `usuarios` (ler/editar), escopo global para `super` e por empresa para `admin_empresa`/`cliente`, mais troca de senha (admin define sem senha atual; cliente exige senha atual).

## Fora de escopo

- Forgot-password por e-mail
- Desabilitar sign-up público
- Campo `blocked` na UI de usuários
- Acesso de `super` a `clientes` / `financeiro` / `kanban`

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [x] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [x] Schema em `packages/db` (se precisar de tabela) — reusa `user` / `account`
- [x] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
- [x] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `UserController.ts`, `CreateUserService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

1. Middleware dedicado `RequireUsuariosAccessMiddleware`: `super` passa só em `usuarios`; `RequireModuleAccessMiddleware` continua bloqueando super em `clientes`/`financeiro`/`kanban`.
2. Criação de usuário via `auth.api.signUpEmail` + update de campos domínio (padrão seed) — Better Auth ownership da credential.
3. Admin set password: hash Better Auth + update `account.password` (API nativa exige senha atual da sessão).

## Critérios de aceite

- [x] Módulo `usuarios` em APP_MODULES; grant ler/editar
- [x] Super: CRUD global; cria super/admin_empresa/cliente; empresas/planos/usuários só
- [x] Admin: só company; cria cliente; edita cliente+admin da company; empresa travada; senha+ativo
- [x] Cliente com grant: CRUD só cliente; sem senha/ativo de terceiros; troca própria senha com atual
- [x] Soft-delete; login rejeita `ativo=false`

## Progresso

- [x] Task file
- [x] Types + contracts
- [x] Backend authz + CRUD + senhas
- [x] Frontend CRUD + trocar senha
- [x] Seed
