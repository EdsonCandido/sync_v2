# Tarefa: Parcelas dividir/repetir e irmãs no edit

- **Status:** done
- **Data:** 2026-08-19
- **Slug:** `20260819-parcelas-dividir-repetir`

## Objetivo

No lançamento de contas a pagar/receber, perguntar se o valor divide ou se repete nas parcelas (com preview). No modal de edição de conta parcelada, listar as parcelas do grupo e trocar a conta no mesmo modal. Após salvar o create, não abrir edição.

## Fora de escopo

- Renegociação.
- Alterar quantidade ou modo de parcelas no save do edit.
- Nova tabela de parcelas.
- Abrir modal de edit após o create.
- Dialog extra “Ver parcelas” na lista.

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Nenhum.

## Critérios de aceite

- [x] Parcelas > 1 no create: pergunta dividir vs repetir; preview bate com o server.
- [x] Após salvar: lista atualiza; modal de edit não abre sozinho.
- [x] Edit de parcela: vê irmãs no mesmo modal; clique troca para aquela conta sem fechar o modal.
- [x] Conta sem grupo: edit igual hoje, sem bloco de irmãs.
- [x] 1 parcela no create: sem radio de modo.

## Progresso

- [x] Contract `parcelamentoModo`
- [x] CreateFinancialEntryService dividir/repetir
- [x] listByGroup + ListFinancialEntryGroupService + GET grupo
- [x] Form create: radio + preview
- [x] Form edit: lista de irmãs e troca no modal
