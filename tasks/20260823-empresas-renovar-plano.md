# Tarefa: Dias restantes e renovar plano na listagem de empresas

- **Status:** done
- **Data:** 2026-08-23
- **Slug:** `20260823-empresas-renovar-plano`

## Objetivo

Na listagem de empresas (super): mostrar dias restantes do plano e permitir renovar (recalcula `planExpiresAt = now + plan.durationDays`).

## Fora de escopo

- Histórico de renovações / billing
- Escolher quantidade de dias na renovação (usa sempre `durationDays` do plano atual)
- Somar dias no restante (renova a partir de agora)

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task`
- [x] `chakra-ui-builder`
- [ ] `better-auth-best-practices`
- [ ] `turborepo`

## Checklist backend

- [x] Contracts: `remainingDays` na response de empresa
- [x] `ListCompaniesService` / `FindCompanyService`: calcular dias restantes
- [x] `RenewCompanyPlanService` + controller + rota `POST /api/companies/:id/renew-plan`

## Checklist frontend

- [x] Coluna “Dias restantes” na tabela
- [x] Ação “Renovar” + confirmação
- [x] `companiesApi.renewPlan`

## Critérios de aceite

- [x] Listagem super mostra dias restantes (0 ou negativo = expirado na UI)
- [x] Renovar redefine validade para agora + dias do plano vinculado
- [x] Após renovar, listagem atualiza

## Progresso

- [x] Backend
- [x] Frontend
