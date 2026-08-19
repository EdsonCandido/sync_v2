# Tarefa: Modal somente leitura para conta paga

- **Status:** done
- **Data:** 2026-08-19
- **Slug:** `20260819-financeiro-modal-conta-paga-readonly`

## Objetivo

Permitir abrir o modal de lançamento financeiro quando a conta estiver paga/baixada, apenas para visualizar detalhes, sem salvar nem baixar de novo.

## Fora de escopo

- Backend / contratos
- Estorno ou edição de lançamento pago
- Modal novo separado
- Conta com status `cancelado`

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

- [x] Lista de contas a pagar/receber: lançamento `pago` tem botão **Ver** e abre o modal
- [x] Modal em `pago`: campos travados, sem **Salvar**, footer só **Fechar**
- [x] Modal em `pago` mostra status, valores, liquidação e pagamentos
- [x] Lançamento em aberto/parcial/vencido continua com **Editar** e **Salvar**
- [x] **Baixar** continua oculto em `pago`

## Progresso

- [x] Tarefa criada
- [x] Botão Ver na lista
- [x] Dialog `mode="view"`
