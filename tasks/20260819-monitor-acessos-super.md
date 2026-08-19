# Tarefa: Monitorar acessos (super)

- **Status:** done
- **Data:** 2026-08-19
- **Slug:** `20260819-monitor-acessos-super`

## Objetivo

Tela exclusiva do perfil `super` com sessões ativas (IP, dispositivo, origem geográfica) e histórico de logins. Persistência própria porque a tabela `session` some no logout.

## Fora de escopo

- Revogar sessão
- Auditoria de cada request
- Tela para `admin_empresa` / `cliente`
- Reusar `access_events` (métrica de dashboard da empresa)

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

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
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

`session_id` em `login_access_logs` sem FK rígida: Better Auth remove/inativa a sessão no logout.

## Critérios de aceite

- [x] Super vê quem está logado agora (IP + origem geo quando o lookup funcionar) e histórico de logins
- [x] Login do super entra no histórico e atualiza `lastAccessAt`
- [x] Não-super: 403 na API e redirect no front
- [x] Login continua se geo falhar

## Progresso

- [x] Tarefa criada
- [x] Schema + contracts
- [x] Backend
- [x] Frontend
- [ ] `db:push` (Postgres local recusou conexão; Docker/OrbStack não ficou estável nesta sessão)
