# Tarefa: CRUD Empresas + Planos + Login + CEP/Mapa

- **Status:** done
- **Data:** 2026-07-11
- **Slug:** `20260711-crud-empresas`

## Objetivo

Implementar módulo completo de Empresas (CRUD) e Planos (API mínima), exclusivo para `perfil=super`, com validação de login por empresa/plano, proxy CEP (ViaCEP) e geocoding (Nominatim), mapa Leaflet no formulário.

## Fora de escopo

- Upload real de `logo`
- Tela CRUD completa de Planos (só API + seed)
- Acesso ADMIN/cliente a Empresas/Planos
- Edição da própria empresa por ADMIN neste módulo
- JWT custom / auth paralela ao Better Auth
- Desabilitar sign-up público

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [x] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [x] `packages/utils`
- [x] outro: `packages/env`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
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

1. `createAuth(options?)` factory em `packages/auth`; instância com hooks de login criada em `apps/server` para regra de negócio (empresa/plano) não ficar no package.
2. Auth Better Auth = cookie session (não JWT). Validação pós-senha via hooks.
3. Soft-delete usa `ativo` (AGENTS), não `active`.
4. CEP/geocode são HTTP externos nos Services (sem Repository) — não há persistência intermediária.
5. Better Auth 1.6: `hooks.after` é handler único (`createAuthMiddleware`), não array `{matcher,handler}` (formato só de plugins).

## Critérios de aceite

- [x] Tabelas `plans` e `companies`; `user.companyId` nullable
- [x] CRUD empresas + API plans só SUPER (403 demais)
- [x] Login: SUPER ignora validações; demais checam empresa/plano ativos e `endDate`
- [x] `GET /api/cep/:cep` e `POST /api/geocode` proxy (frontend nunca ViaCEP/Nominatim)
- [x] Seed: Plano Básico, Empresa Demo, admin@empresa.com, super@admin.com
- [x] UI Empresas só SUPER (menu + redirect); list/search/paginação/CRUD + CEP + Leaflet

## Progresso

- [x] Task file
- [x] Schema + push
- [x] Auth hooks + middlewares
- [x] Backend CRUD
- [x] Seeds
- [x] Frontend
