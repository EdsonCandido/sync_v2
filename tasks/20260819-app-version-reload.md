# Tarefa: Forçar última versão após deploy

- **Status:** done
- **Data:** 2026-08-19
- **Slug:** `20260819-app-version-reload`

## Objetivo

Expor a versão do build do web, avisar usuários com aba aberta após deploy e recarregar em 5 segundos. Mostrar a versão atual na UI.

## Fora de escopo

- Endpoint de versão na API (`apps/server`)
- Service worker / PWA
- Botão para adiar o reload

## Apps / packages tocados

- [ ] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [ ] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`
- [x] outro: `deploy.sh`, `docker-compose.yml`, `docs/PRODUCAO.md`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Não aplicável — versão é do bundle do web.

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Sem Route → Controller → Service no server: o id precisa ser o do build do frontend no mesmo origin.

## Critérios de aceite

- [x] `./deploy.sh` na raiz: `git pull`, SHA em `VITE_APP_VERSION`, `compose up --build`, `db:push`
- [x] Deploy com SHA novo: aba aberta recebe toast e recarrega em 5s
- [x] Versão visível no dashboard e no header público
- [x] `GET /version.json` com `Cache-Control: no-store`
- [x] `npm run dev` não recarrega em loop

## Progresso

- [x] Tarefa criada
- [x] `VITE_APP_VERSION` no Docker / compose / env / docs
- [x] `deploy.sh`
- [x] Rota `/version.json`
- [x] Watcher + rótulo na UI
