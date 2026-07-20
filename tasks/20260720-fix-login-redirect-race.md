# Tarefa: Fix race redirect pós-login

- **Status:** done
- **Data:** 2026-07-20
- **Slug:** `20260720-fix-login-redirect-race`

## Objetivo

Corrigir race em que `onSuccess` do login navega para `/dashboard` antes do atom de session atualizar; o guard bounce para `/login` e o header depois mostra autenticado.

## Fora de escopo

- Alterar cookies `sameSite` / `secure` em `packages/auth`
- Mudanças no guard de `dashboard.tsx` além do necessário
- Novas features de auth

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
- [ ] `chakra-ui-builder` (se houver UI)
- [x] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

N/A — só frontend auth client.

## Checklist frontend (se aplicável)

- [ ] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

## Critérios de aceite

- [x] Login → fica em `/dashboard` (sem bounce pra `/login`)
- [x] Abrir `/login` já autenticado → redirect automático pra `/dashboard`
- [x] Header e área logada coerentes (ambos veem session)

## Progresso

- [x] `SignInForm`: await `refetch` antes de navigate + redirect se session
- [x] `SignUpForm`: mesmo padrão
- [x] Typecheck web OK
