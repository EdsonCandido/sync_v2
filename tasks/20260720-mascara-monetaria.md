# Tarefa: Máscara monetária BRL nos inputs

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-mascara-monetaria`

## Objetivo

Aplicar máscara monetária brasileira (R$ 1.234,56) em todos os campos de input monetários da aplicação, com helper reutilizável e componente `MoneyInput`.

## Fora de escopo

- Alterar persistência/API (valores continuam `number`).
- Máscara em exibição já coberta por `formatMoney`.
- Campos numéricos não monetários (parcelas, prioridade, etc.).

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

N/A

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)
- [x] Helper `maskMoneyInput` / `parseMoneyInput` / `numberToMoneyInput`
- [x] Componente `MoneyInput`
- [x] Aplicar em valor original, baixa e saldo inicial

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Digitar em campo monetário formata como `R$ X.XXX,XX`
- [x] Submit envia `number` correto (centavos)
- [x] Edição pré-preenche valor já mascarado
- [x] Parcelas e outros numbers sem máscara monetária

## Progresso

- [x] Helpers em `apps/web/src/lib/money.ts`
- [x] `MoneyInput` em `apps/web/src/components/ui/money-input.tsx`
- [x] Wire em formulários financeiro
