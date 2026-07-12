# Tarefa: Landpage, login e schema de usuário

- **Status:** done
- **Data:** 2026-07-11
- **Slug:** `20260711-landpage-login-contato`

## Objetivo

Landpage de conversão em `/`, página de contato com toast (sem Kanban), login só Sign In (lembrar-me + stub esqueci senha), extensão do schema de usuário com perfil/auditoria, e regra global de soft-delete documentada no projeto.

## Fora de escopo

- Reset de senha real / envio de e-mail
- Persistência de leads / Kanban de contato
- CRUD admin de usuários
- Sign Up na UI pública

## Apps / packages tocados

- [ ] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [x] `packages/auth`
- [ ] `packages/contracts`
- [x] `packages/types`
- [ ] `packages/utils`
- [x] outro: `AGENTS.md`, `.cursor/rules`, `tasks/TEMPLATE.md`, skill create-task

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [x] Schema em `packages/db` (se precisar de tabela)
- [x] Toda tabela: `ativo`, `created_at`, `updated_at` (soft-delete)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [ ] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [ ] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Better Auth pode gerenciar ciclo de vida interno de `session`/`verification`. Código da aplicação nunca faz hard-delete.

`db:push` não concluiu neste ambiente (DB indisponível). Rodar `npm run db:push -w @sync_v2/db` quando Postgres estiver up.

## Critérios de aceite

- [x] Regras soft-delete documentadas em AGENTS.md + cursor rules + template/skill
- [x] Tabelas auth com `ativo` + datas; `user` com `perfil`, `created_by`, `updated_by`
- [x] `/` landpage conversão; `/contato` toast; `/login` só Sign In + lembrar-me + stub esqueci senha

## Progresso

- [x] Soft-delete rules + schema
- [x] Landpage + header
- [x] Contato
- [x] Login Sign In
