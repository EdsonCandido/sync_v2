# Tarefa: Título do navegador no dashboard

- **Status:** done
- **Data:** 2026-08-23
- **Slug:** `20260823-titulo-navegador-dashboard`

## Objetivo

Após o login, a aba do navegador não deve mostrar a URL. Usar o formato `Helios Labs | <módulo/página>` em todas as rotas sob `/dashboard`.

## Fora de escopo

- Alterar títulos das páginas públicas (`— Helios Labs`).
- Alterar breadcrumb da navbar.

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
- [ ] `chakra-ui-builder` (se houver UI) — N/A (só meta/helper)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

N/A

## Checklist frontend (se aplicável)

- [ ] Leu `.agents/skills/chakra-ui-builder/SKILL.md` — N/A
- [ ] Componentes com Chakra UI v3 + tokens semânticos — N/A
- [ ] Responsivo (base + md no mínimo) — N/A

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Login → `/dashboard` mostra `Helios Labs | Início` (não a URL).
- [x] Navegar para Clientes/Kanban/etc. atualiza para `Helios Labs | <módulo>`.
- [x] Subrota financeiro (ex. contas a pagar) mostra label legível, não slug/URL.

## Progresso

- [x] Criar `apps/web/src/lib/document-title.ts`
- [x] Exportar `meta` em `apps/web/src/routes/dashboard.tsx`
