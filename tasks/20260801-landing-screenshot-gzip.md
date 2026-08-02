# Tarefa: Landing screenshot + gzip

- **Status:** done
- **Data:** 2026-08-01
- **Slug:** `20260801-landing-screenshot-gzip`

## Objetivo

Usar `tela_admin` na seção Demo da landing e otimizar entrega (WebP + gzip de assets textuais no serve/build).

## Fora de escopo

- Trocar stack de serve (nginx puro / SSR off)
- Novas libs de UI
- Mudanças em `apps/server` ou packages de domínio

## Apps / packages tocados

- [x] `apps/web`
- [ ] `apps/server`
- [ ] `packages/*`
- [x] outro: `docs/PRODUCAO.md` (gzip no NPM)

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (UI landing)
- [ ] `better-auth-best-practices`
- [ ] `turborepo`

## Checklist frontend

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Screenshot na `LandingDemo` (WebP + fallback PNG)
- [x] Vite: assets não inline; report compressed size
- [x] Serve produção: gzip documentado (`react-router-serve` + NPM)
- [x] Responsivo (base + md)

## Critérios de aceite

- [x] Landing Demo mostra dashboard real (não placeholder)
- [x] Imagem otimizada (WebP ~37K + PNG fallback)
- [x] Gzip ativo em produção (Node `compression()` + nota NPM)
- [x] Typecheck ok nos arquivos tocados

## Progresso

- [x] Task file
- [x] Otimizar imagem
- [x] Plugar na LandingDemo
- [x] Configs gzip/vite/docs
- [x] Aceite

## Justificativa de desvio

Nenhum desvio de arquitetura. Gzip on-the-fly já existe em `@react-router/serve` (`compression()`); reforçamos docs/vite e entrega da imagem. PNG/WebP não se beneficiam de gzip adicional.
