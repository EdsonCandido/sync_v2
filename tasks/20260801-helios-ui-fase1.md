# Tarefa: Helios Labs UI — Fase 1

- **Status:** done
- **Data:** 2026-08-01
- **Slug:** `20260801-helios-ui-fase1`

## Objetivo

Entregar Design System Helios Labs (tokens/recipes), rebrand Sync→Helios Labs, landing conversiva, polish do shell CRM e dashboard home premium — widgets novos só com mock visual rico, sem API. UI-only.

## Fora de escopo

- Redesign profundo de clientes/kanban/financeiro CRUD
- DnD persistente / APIs novas
- Mudanças em `apps/server` ou packages
- Recipes completos de todos os componentes (Stepper, Accordion, Paginação, etc. — Fase 2)

## Apps / packages tocados

- [ ] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist frontend

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Theme em `src/theme/` + provider fino
- [x] Primitivos UI (HeliosCard, PageHeader, Empty/Skeleton, BrandMark, SolarGlow)
- [x] Rebrand Sync → Helios Labs
- [x] Landing conversiva + Footer
- [x] Shell Sidebar/Navbar polish
- [x] Dashboard home redesenhado + mocks DnD
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Critérios de aceite

- [x] `/` = landing Helios Labs completa, dark/light ok
- [x] Marca Sync sumiu das superfícies públicas + sidebar
- [x] Theme tokens em `src/theme/`; provider fino
- [x] Dashboard admin: dados reais redesenhados + mocks ricos + grid DnD local
- [x] Empty/loading/skeleton/error coerentes com DS
- [x] Zero mudança em `apps/server` / contracts / APIs
- [x] Typecheck `apps/web` passa; Biome limpo nos arquivos tocados

## Progresso

- [x] Task file
- [x] Design System
- [x] UI atoms
- [x] Rebrand
- [x] Landing
- [x] Shell
- [x] Dashboard real
- [x] Dashboard mocks
- [x] A11y + Biome

## Fases futuras

- Fase 2: recipes completos + redesign módulos (clientes, kanban chrome, financeiro)
- Fase 3: search global real, notificações API, persistência de layout DnD
