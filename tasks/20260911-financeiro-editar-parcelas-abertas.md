# Tarefa: Propagar edição às parcelas em aberto

- **Status:** done
- **Data:** 2026-09-11
- **Slug:** `20260911-financeiro-editar-parcelas-abertas`

## Objetivo

Ao editar um lançamento financeiro que pertença a um grupo de parcelas com outras parcelas em aberto, perguntar se a alteração deve aplicar só na vigente ou nas demais em aberto, respeitando a lógica mensal de vencimento do create.

## Fora de escopo

- Alterar schema DB / migrations.
- Propagar `desconto` / `acrescimo` / `juros` / `multa` / `numero` para irmãs.
- Renegociação ou soft-delete em lote.
- Alterar parcelas já pagas ou canceladas.

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
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
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados) — reuso de `listOpenByGroup` / `update`
- [x] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP) — sem path novo
- [ ] `*.routes.ts` + registro em `routes/index.ts` — sem path novo
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `UpdateFinancialEntryService.ts`
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum desvio.

## Critérios de aceite

- [x] Edit sem grupo / só 1 aberta: salva direto, sem pergunta.
- [x] Com outras abertas: pergunta; “somente vigente” não mexe nas irmãs.
- [x] “Demais em aberto”: irmãs abertas recebem metadados + emissão/vencimentos com espaçamento mensal; pagas/canceladas intactas.
- [x] Lançamento pago/cancelado continua bloqueado no update.
- [x] Sem hard-delete; sem mudança de schema DB.

## Progresso

- [x] Branch `feat/financeiro-editar-parcelas-abertas` a partir de `main`
- [x] Flag `applyToOpenInstallments` no contract
- [x] Propagação no `UpdateFinancialEntryService`
- [x] Confirm no `FinancialEntryFormDialog` + API client
- [x] Critérios de aceite validados
