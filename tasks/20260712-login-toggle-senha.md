# Tarefa: Toggle ver senha no login

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-login-toggle-senha`

## Objetivo

Permitir que o usuário mostre/oculte a senha no formulário de login (`SignInForm`).

## Fora de escopo

- Alterar fluxo de autenticação / Better Auth.
- Formulário de cadastro (`SignUpForm`), salvo se reutilizar o mesmo padrão no futuro.
- Recuperação de senha.

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

## Justificativa de desvio (só se necessário)

—

## Critérios de aceite

- [x] Campo senha no login tem botão para mostrar/ocultar
- [x] Botão acessível (`aria-label`)
- [x] Por padrão a senha permanece oculta (`type="password"`)

## Progresso

- [x] Adicionar toggle de visibilidade em `sign-in-form.tsx`
