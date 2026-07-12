# Tarefa: Dashboard layout (sidebar + navbar)

- **Status:** done
- **Data:** 2026-07-11
- **Slug:** `20260711-dashboard-layout`

## Objetivo

Shell do dashboard com sidebar de módulos estáticos, topbar com menu do usuário (sair + stubs de senha/info) e home só com mensagem de boas-vindas.

## Fora de escopo

- Backend de permissões / troca de senha / update de perfil
- Conteúdo real de Clientes/Kanban/Financeiro/Empresas
- Mudanças em `packages/*` ou `apps/server`

## Apps / packages tocados

- [ ] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
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
- [ ] Toda tabela nova: `ativo`, `created_at`, `updated_at` (sem hard-delete)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
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

## Critérios de aceite

- [x] Layout dashboard com sidebar + navbar (sem Header público)
- [x] Home `/dashboard` só com boas-vindas
- [x] Módulos estáticos: Clientes, Kanban, Financeiro, Empresas (placeholders)
- [x] Menu usuário: Sair funcional; Trocar senha e Exibir informações com Dialog stub

## Progresso

- [x] Task file
- [x] Componentes shell
- [x] Rotas nested
- [x] Root header hide
- [x] Menu + dialogs
