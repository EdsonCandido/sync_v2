# Tarefa: Deploy Docker + NPM + seed Helios

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-deploy-docker-npm`

## Objetivo

Preparar o monorepo para deploy em Ubuntu com `git pull` + `docker compose`, Nginx Proxy Manager (`sync` + `api.sync`), `COMPOSE_PROJECT_NAME`, e seed bootstrap Helios Labs (3 perfis + empresa/cliente + categorias + centros + 1 banco) automático no start.

## Fora de escopo

- CI/CD automático
- Domínio único com path `/api`
- Hardening de SO (ufw/fail2ban)

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web` (`.env.example`)
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `docker-compose.yml`, `.env.example` raiz, `packages/env`, README

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)

## Critérios de aceite

- [x] Compose usa env para URLs/portas; `COMPOSE_PROJECT_NAME=sync_v2`
- [x] Seed cria 3 users + Helios company/client + categorias + centros + 1 banco
- [x] Demo antiga removida do seed
- [x] `SEED_ON_START` roda seed no start do container
- [x] `.env.example` + README de deploy

## Progresso

- [x] compose-prod-env
- [x] seed-bootstrap-env
- [x] env-examples
- [x] readme-deploy
