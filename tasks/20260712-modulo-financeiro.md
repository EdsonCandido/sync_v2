# Tarefa: Módulo Financeiro (MVP)

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-modulo-financeiro`

## Objetivo

Entregar módulo financeiro operacional: cadastros (categorias, centros de custo, bancos, fornecedores), Contas a Receber/Pagar (parcelamento, baixa, estorno, renegociação), dashboard de saúde financeira (KPIs + gráficos), anexos, histórico/auditoria, link Kanban, seeds padrão. Sem vendas e sem fluxo de caixa.

## Fora de escopo

- Sistema de vendas / origem venda
- Fluxo de caixa (módulo, previsto, gráficos de fluxo)
- Caixa Diário
- Conciliação bancária
- Notificações/alertas push/email
- Engine de relatórios avançados

## Apps / packages tocados

- [x] `apps/server`
- [x] `apps/web`
- [x] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [x] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [x] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [x] Schema em `packages/db` (se precisar de tabela)
- [x] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [x] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [x] `*Controller.ts` (classe; só HTTP)
- [x] `*.routes.ts` + registro em `routes/index.ts`
- [x] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [x] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [x] Componentes com Chakra UI v3 + tokens semânticos
- [x] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Anexos: upload via `req.file` (multer) no controller — boundary HTTP. Download body binário. Valores monetários em `doublePrecision` (padrão existente `company_payments`). Helpers HTTP compartilhados em `financeiroHttp.ts`. Services de anexo no mesmo arquivo `FinancialEntryAttachmentServices.ts` (3 use cases de anexo).

## Critérios de aceite

- [x] Cadastros CRUD: categorias, centros de custo, bancos, fornecedores
- [x] Contas a receber/pagar: criar (cliente/fornecedor opcional), parcelas, baixa parcial/total, estorno, renegociação, cancelar
- [x] Origem `avulsa` | `kanban` | `manual`; link opcional ao card Kanban
- [x] Anexos + histórico com user/IP/ação
- [x] Dashboard saúde financeira: KPIs + gráficos (sem fluxo)
- [x] Seeds padrão na company demo
- [x] Permissões `financeiro` read/edit

## Progresso

- [x] Task + schema + contracts/types
- [x] Cadastros API + seeds
- [x] Lançamentos ops + anexos + histórico
- [x] Dashboard API + UI
- [x] CRUDs web + link Kanban
- [x] Check + aceite
