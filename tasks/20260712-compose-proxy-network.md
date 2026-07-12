# Tarefa: Network proxy + NPM por nome de container

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-compose-proxy-network`

## Objetivo

Ligar `web` e `server` do sync_v2 na network externa `proxy` (mesmo padrão do NPM / projeto Helios antigo), com `container_name` estável para o Nginx Proxy Manager resolver por nome + porta interna.

## Fora de escopo

- Alterar stack do NPM no host
- Remover publish de portas host (`13000`/`13001`)
- CI/CD

## Apps / packages tocados

- [ ] `apps/server`
- [ ] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `docker-compose.yml`, `README.md`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)

## Checklist backend (se aplicável)

N/A (infra Docker).

## Checklist frontend (se aplicável)

N/A.

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] `web` e `server` com `container_name` fixo (`sync_v2-web`, `sync_v2-server`)
- [x] Ambos em networks `default` + `proxy` (`proxy` external)
- [x] Postgres só em `default`
- [x] README documenta forward NPM por nome:porta interna e `db:push` via `packages/db`

## Progresso

- [x] task-file
- [x] compose-proxy
- [x] readme-npm
