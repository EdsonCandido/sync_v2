# Tarefa: Rate limit login + ITR público

- **Status:** done
- **Data:** 2026-08-12
- **Slug:** `20260812-rate-limit-login-itr`

## Objetivo

Proteger login (`/api/auth/sign-in/email`) e rotas públicas ITR (`/api/public/itr`) com rate limit por IP, usando o IP real do cliente atrás do Nginx Proxy Manager (`trust proxy` + `X-Forwarded-For`).

## Fora de escopo

- Rate limit no NPM (Custom Nginx Config).
- Redis / storage compartilhado multi-réplica.
- Rate limit em rotas autenticadas (CEP, geocode, etc.).
- Alterar UI de login / página ITR pública.

## Apps / packages tocados

- [x] `apps/server`
- [ ] `apps/web`
- [ ] `packages/db`
- [x] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `docs/PRODUCAO.md`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [ ] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
- [x] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [ ] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [ ] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [ ] Componentes com Chakra UI v3 + tokens semânticos
- [ ] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

- Rate limit do login fica em `packages/auth` (`rateLimit` + `ipAddressHeaders`) — config da lib Better Auth, sem regra de negócio de domínio (mesmo padrão de `trustedOrigins` / cookies).
- Storage memory: um container `server`; Redis fora de escopo.
- `PublicItrRateLimitMiddleware` encapsula `express-rate-limit` (middleware HTTP, não Service).

## Critérios de aceite

- [x] Login: 11ª tentativa no mesmo IP em 15 min → bloqueio Better Auth (429)
- [x] ITR público: 61ª req no mesmo IP em 15 min → 429 JSON
- [x] Atrás do NPM, chave do limite = IP do cliente (não IP do proxy), com `trust proxy` + headers
- [x] `GET /` e rotas autenticadas sem esse limiter

## Progresso

- [x] Branch `feat/rate-limit-login-itr`
- [x] `app.set("trust proxy", 1)` + Better Auth `ipAddressHeaders`
- [x] Better Auth `rateLimit` + `customRules` `/sign-in/email`
- [x] `express-rate-limit` + `PublicItrRateLimitMiddleware` nas rotas ITR
- [x] Nota em `docs/PRODUCAO.md`
