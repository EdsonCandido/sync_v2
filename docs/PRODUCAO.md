# Produção

Deploy no Ubuntu com Docker Compose e Nginx Proxy Manager (NPM).

Fluxo recorrente: `git pull` + `docker compose up -d --build`. Isolamento: `COMPOSE_PROJECT_NAME=sync_v2` no `.env` da raiz.

## Pré-requisitos

- Docker + Docker Compose no servidor
- Network externa `proxy` (a mesma do Nginx Proxy Manager)

```bash
docker network create proxy
```

`web` e `server` entram na network `proxy`. Postgres fica só na network interna do compose.

## Domínios (NPM)

Forward pelo **nome do container + porta interna**:

| Host | Forward NPM |
| ---- | ----------- |
| `https://sync.helioslabs.com.br` | `http://sync_v2-web:3001` |
| `https://api.sync.helioslabs.com.br` | `http://sync_v2-server:3000` |

DNS: ambos A/CNAME para o IP do servidor. SSL Let's Encrypt no NPM. Websocket on no proxy do web.

Rate limit (login + ITR público) usa o IP do cliente via `X-Forwarded-For` / `X-Real-IP`. No NPM, **não** remova esses headers. O server usa `trust proxy = 1` (um hop = NPM).

### Gzip / compressão

- O container `web` (`react-router-serve`) já aplica **gzip** via middleware `compression()` em HTML, JS, CSS e JSON.
- PNG/WebP da landing **não** devem ser gzipados de novo (já comprimidos); o middleware pula `image/*`.
- No NPM: deixe compressão do upstream passar. Se ativar gzip no NPM, evite recomprimir respostas que já venham com `Content-Encoding: gzip`.
- Conferir: `curl -sI -H 'Accept-Encoding: gzip' https://sync.helioslabs.com.br/ | grep -i content-encoding` → espera `gzip` no HTML.

Portas host `13001` / `13000` só para debug (`curl`); o NPM não precisa delas.

## Setup inicial

```bash
git clone <repo> /opt/sync_v2
cd /opt/sync_v2
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Editar senhas, `BETTER_AUTH_*`, `CORS_ORIGIN`, `BETTER_AUTH_URL`, `VITE_SERVER_URL`, `SEED_*`.

Produção típica:

```bash
# .env (raiz)
COMPOSE_PROJECT_NAME=sync_v2
VITE_SERVER_URL=https://api.sync.helioslabs.com.br
SEED_ON_START=true

# apps/server/.env
BETTER_AUTH_URL=https://api.sync.helioslabs.com.br
# Um ou mais origins (vírgula): https://a.com,https://b.com
CORS_ORIGIN=https://sync.helioslabs.com.br
# DATABASE_URL no container aponta para o serviço postgres (compose injeta):
# postgresql://postgres:...@postgres:5432/sync_v2
```

O `docker-compose.yml` sobrescreve `DATABASE_URL` do server para falar com o host `postgres` na rede interna. Ajuste `POSTGRES_PASSWORD` no `.env` da raiz (e o mesmo valor na URL se você montar `apps/server/.env` à mão fora do compose).

Subir:

```bash
docker compose up -d --build
# db:migrate via packages/db (Turbo na raiz esvazia DATABASE_URL)
docker compose exec -T server sh -c 'cd /app/packages/db && npm run db:migrate'
# se seed rodou antes do schema:
docker compose restart server
```

Após migrate com tabela de módulos por empresa nova:

```bash
docker compose exec server sh -c 'cd /app && npm run db:grant-all-company-modules -w server'
```

## Deploy recorrente

Na raiz do clone (`/opt/sync_v2`):

```bash
./deploy.sh
```

O script faz `git pull`, define `VITE_APP_VERSION` com o SHA curto do Git, `docker compose up -d --build` e `db:migrate` (SQL versionado em `packages/db/src/migrations`, sem prompt TTY). O SHA entra no build do `web` (`.git` não vai para a imagem).

Novas mudanças de schema em produção: `npm run db:generate -w @sync_v2/db` → commit do SQL → deploy.

## Seed

- Com `SEED_ON_START=true`, o entrypoint do `server` roda o bootstrap Helios antes da API (idempotente).
- Manual: `docker compose exec server sh -c 'cd /app && npm run db:seed -w server'`
- Backfill financeiro (categorias + centros) em **todas** as empresas ativas, idempotente:
  `docker compose exec server sh -c 'cd /app && npm run db:seed-financeiro-defaults -w server'`
- Cria: plano básico, empresa/cliente Helios, 3 usuários (`super` / `admin_empresa` / `cliente`), categorias, centros de custo, 1 banco.
- Variáveis: ver `apps/server/.env.example`.

Os scripts CLI usam `dist/*.mjs` (build do Docker). Sem `tsx` no container.

## Portas no host

| Serviço | Porta host padrão | Override |
| ------- | ----------------- | -------- |
| Web | `13001` | `WEB_HOST_PORT` |
| API | `13000` | `SERVER_HOST_PORT` |
| Postgres | `15432` (só `127.0.0.1`) | `POSTGRES_HOST_PORT` |

Postgres **não** fica exposto na internet — bind em `127.0.0.1`.

## Docker Compose (referência)

- Config: `docker-compose.yml` (Dockerfiles em `apps/*/Dockerfile`)
- Build: `npm run docker:build`
- Start: `npm run docker:up`
- Logs: `npm run docker:logs`
- Stop: `npm run docker:down`

Envs: `.env` na raiz + `apps/server/.env` + `apps/web/.env`.

`VITE_*` é bake no build do web — mudou a URL da API? Rebuild do `web`. `VITE_APP_VERSION` vem do `./deploy.sh` (SHA do Git).

## Desenvolvimento local

Para PC novo / `npm run dev`, use [LOCAL.md](LOCAL.md).
