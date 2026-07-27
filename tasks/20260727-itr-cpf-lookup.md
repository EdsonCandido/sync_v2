# Tarefa: ITR autofill cliente por CPF

- **Status:** done
- **Data:** 2026-07-27
- **Slug:** `20260727-itr-cpf-lookup`

## Objetivo

No form de criar ITR, ao digitar CPF completo, buscar cliente da empresa e preencher nome/e-mail/telefone; se não existir, usuário preenche e o create cadastra o cliente.

## Fora de escopo

- Atualizar cadastro do cliente existente pelo form ITR.
- Busca fuzzy / autocomplete parcial.
- Mudança no create financeiro / docs.

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
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

## Critérios de aceite

- [x] CPF existente → form preenche e submit usa cliente existente (sem duplicar)
- [x] CPF novo → preenche manual e create cadastra cliente
- [x] Sem permissão `clientes` ainda funciona (rota sob `/api/itr`)

## Progresso

- [x] Contract + FindItrClientByDocumentService + rota
- [x] ItrFormDialog lookup + clientId
