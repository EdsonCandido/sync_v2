# Tarefa: Botão Pesquisar com cor Helios

- **Status:** done
- **Data:** 2026-08-19
- **Slug:** `20260819-financeiro-botao-pesquisar`

## Objetivo

Deixar os botões "Pesquisar" do financeiro visíveis como ação secundária da marca (`colorPalette="helios"` + `variant="subtle"`), sem competir com o CTA de criar lançamento.

## Fora de escopo

- Inputs de busca em outras telas (clientes, categorias, etc.)
- Botão "Baixar PDF"
- Backend / contratos

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

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [ ] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [ ] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [ ] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [ ] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

## Critérios de aceite

- [x] Botão Pesquisar em contas a pagar/receber usa `colorPalette="helios"` e `variant="subtle"`
- [x] Botão Pesquisar em relatórios financeiros usa o mesmo padrão
- [x] CTA de criar lançamento permanece sólido Helios (peso visual maior)

## Progresso

- [x] Branch a partir de `main`
- [x] Estilo nos dois botões
- [x] Verificação no browser (sem MCP browser; HMR/lint + hierarquia de botões no código)
