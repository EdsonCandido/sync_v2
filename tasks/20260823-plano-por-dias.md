# Tarefa: Plano por quantidade de dias

- **Status:** done
- **Data:** 2026-08-23
- **Slug:** `20260823-plano-por-dias`

## Objetivo

Mover a validade do plano de datas absolutas (`startDate`/`endDate`) para `durationDays` no catálogo. Ao vincular plano à empresa, calcular `planExpiresAt = now + durationDays`. Login valida só pela expiração da empresa.

## Fora de escopo

- Billing, histórico de renovações, trial no primeiro login
- Módulos embutidos em planos
- Propagar alteração de `durationDays` para empresas já vinculadas
- Botão dedicado “renovar plano”

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
- [x] `chakra-ui-builder` (UI)
- [ ] `better-auth-best-practices` (se houver auth)
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

Nenhum.

## Critérios de aceite

- [x] Super cria/edita plano com nome + N dias (input); sem início/fim
- [x] Ao criar empresa (ou trocar plano), `planExpiresAt` = agora + dias do plano
- [x] Login de usuário da empresa respeita essa expiração
- [x] Empresa não pede quantidade de dias
- [x] Migração/backfill de planos existentes com `durationDays`

## Progresso

- [x] Schema + contracts + seed
- [x] Services backend
- [x] Frontend planos
- [x] db:push / validação
