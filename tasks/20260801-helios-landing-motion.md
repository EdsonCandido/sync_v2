# Tarefa: Helios landing — constelação + sistema solar

- **Status:** done
- **Data:** 2026-08-01
- **Slug:** `20260801-helios-landing-motion`

## Objetivo

Constelação interativa (pontos + linhas no mouse) no hero da landing, e seção animada de sistema solar entre Benefícios e Recursos — identidade Helios, UI-only, sem libs novas.

## Fora de escopo

- Login / contato / outras páginas públicas
- Mudanças em `apps/server` ou packages
- Three.js / particles.js / tsParticles

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
- [x] `ConstellationField` no hero (canvas vanilla)
- [x] `SolarSystemScene` + `LandingSolarSystem` entre Benefícios e Recursos
- [x] Componentes com Chakra UI v3 + tokens Helios
- [x] `prefers-reduced-motion` nos dois efeitos
- [x] Responsivo (base + md no mínimo)

## Critérios de aceite

- [x] Mouse no hero conecta pontos estilo constelação (cores Helios)
- [x] Entre Benefícios e Recursos: sistema solar animado coerente com DS
- [x] Reduced motion: sem animação contínua
- [x] Zero mudança server/contracts
- [x] Typecheck `apps/web` ok; Biome limpo nos arquivos tocados

## Progresso

- [x] Task file
- [x] ConstellationField
- [x] Wire hero
- [x] SolarSystemScene + LandingSolarSystem
- [x] Wire _index
- [x] A11y + Biome
