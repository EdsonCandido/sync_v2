# Desenvolvimento local

Guia para configurar o Sync num PC novo. Padrão: **Postgres no Docker**, web e API no host com `npm run dev`.

## Pré-requisitos

- Node.js (compatível com `packageManager` do monorepo: npm 10+)
- npm
- Docker Desktop **ligado** (daemon rodando — `docker ps` deve funcionar)
- Git

## 1. Clonar e instalar

```bash
git clone <repo> sync_v2
cd sync_v2
npm install
```

## 2. Arquivos de ambiente

```bash
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Ajuste senhas e `BETTER_AUTH_SECRET` (≥ 32 caracteres) em `apps/server/.env`.

### Valores locais esperados

| Arquivo | Variável | Valor local |
| ------- | -------- | ----------- |
| `.env` | `POSTGRES_PASSWORD` | `password` (ou o que você definir) |
| `.env` | `POSTGRES_HOST_PORT` | `15432` |
| `.env` | `SEED_ON_START` | `false` (seed manual no local) |
| `apps/server/.env` | `DATABASE_URL` | `postgresql://postgres:password@localhost:15432/sync_v2` |
| `apps/server/.env` | `BETTER_AUTH_URL` | `http://localhost:3000` |
| `apps/server/.env` | `CORS_ORIGIN` | `http://localhost:5173` |
| `apps/web/.env` | `VITE_SERVER_URL` | `http://localhost:3000` |

A porta **15432** é a publicação do Compose no host (`127.0.0.1`). Dentro do container o Postgres continua em `5432`.

Preencha os `SEED_*` em `apps/server/.env` (já vêm no `.env.example`) — e-mails e senhas do seed.

## 3. Rede Docker + Postgres

O `docker-compose.yml` declara a network externa `proxy` (mesma do Nginx Proxy Manager em produção). Crie uma vez:

```bash
docker network create proxy
```

Se a network já existir, o comando avisa e pode ignorar.

Sobe só o banco:

```bash
npm run db:start
```

Equivale a `docker compose up -d postgres`. Confirme com `docker ps` (container `sync_v2-postgres`).

Outros comandos:

| Script | Efeito |
| ------ | ------ |
| `npm run db:watch` | Postgres em foreground (logs) |
| `npm run db:stop` | Para o container |
| `npm run db:down` | Remove o serviço postgres do compose |

## 4. Schema

```bash
npm run db:push
```

O Drizzle lê `DATABASE_URL` de `apps/server/.env` (`packages/db/drizzle.config.ts`).

## 5. Seed

```bash
npm run db:seed
```

Idempotente. Cria:

- plano básico
- empresa / cliente Helios
- 3 usuários: `super`, `admin_empresa`, `cliente` (e-mails/senhas = `SEED_*`)
- categorias financeiras, centros de custo, 1 banco

Login no browser com um dos `SEED_*_EMAIL` / `SEED_*_PASSWORD`.

## 6. Rodar a aplicação

```bash
npm run dev
```

| App | URL |
| --- | --- |
| Web | http://localhost:5173 |
| API | http://localhost:3000 |

## Stack Docker completa (opcional)

Para subir web + server + postgres como containers (não é o fluxo padrão de dev):

1. Ajuste envs conforme [docs/PRODUCAO.md](PRODUCAO.md) / comentários do `.env` da raiz (`VITE_SERVER_URL=http://localhost:13000`, etc.).
2. `npm run docker:up`
3. Web host: `http://localhost:13001` · API host: `http://localhost:13000`

`VITE_*` entra no **build** da imagem web — mudou a URL da API? Rebuild do `web`.

## Problemas comuns

| Sintoma | Causa típica |
| ------- | ------------ |
| `docker.sock: no such file` | Docker Desktop ainda não subiu — espere e rode `docker ps` |
| `network proxy ... not found` | Falta `docker network create proxy` |
| `db:push` / seed não conecta | `DATABASE_URL` na porta errada (use `15432`, não `5432`) |
| CORS / login falha no browser | `CORS_ORIGIN` deve ser `http://localhost:5173` no `npm run dev` |
