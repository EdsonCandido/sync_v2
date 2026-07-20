# Tarefa: Editar lançamento financeiro (UI)

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-editar-lancamento-financeiro`

## Objetivo

Permitir editar contas a pagar/receber no frontend, usando o `PUT /lancamentos/:id` já existente. Sem alterar `valorOriginal`, `kind` ou status.

## Fora de escopo

- Mudar `valorOriginal`, `kind`, status, parcelas ou renegociar na UI.
- Alterar `packages/contracts` ou services no server.
- Estornar pagamento / anexos no dialog de edição.

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

N/A — API de update já existe.

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Em contas a receber e a pagar: botão Editar em lançamentos `em_aberto` / `parcial` / `vencido`.
- [x] Dialog carrega dados e salva via PUT; lista atualiza.
- [x] Sem Editar (ou bloqueado) se `pago` / `cancelado`.
- [x] Create continua igual.

## Progresso

- [x] Task file criado
- [x] `FinancialEntryFormDialog` com mode create|edit
- [x] Botão Editar em `FinancialEntriesPage`
