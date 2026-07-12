# Tarefa: PDF financeiro premium

- **Status:** done
- **Data:** 2026-07-12
- **Slug:** `20260712-financeiro-pdf-premium`

## Objetivo

Redesenhar PDFs financeiros (Saúde + 12 relatórios) com layout premium (cards, KPIs, charts PNG, score e análise inteligente). Sem alterar UX do frontend.

## Fora de escopo

- Alterar UI web / páginas React de financeiro
- Novo filtro de datas na Saúde
- HTML/Puppeteer
- Remover informações agregadas existentes

## Apps / packages tocados

- [x] `apps/server`
- [ ] `apps/web`
- [ ] `packages/db`
- [ ] `packages/auth`
- [x] `packages/contracts`
- [ ] `packages/types`
- [ ] `packages/utils`

## Skills obrigatórias (ler antes de implementar)

- [x] `create-task` (este fluxo)
- [ ] `chakra-ui-builder` (se houver UI)
- [ ] `better-auth-best-practices` (se houver auth)
- [ ] `turborepo` (se houver pipeline/cache)

## Checklist backend (se aplicável)

Fluxo: Route → Controller → Service → Repository → Drizzle.

- [ ] Schema em `packages/db` (se precisar de tabela)
- [ ] Toda tabela nova: PK UUID (`idColumn()`), `ativo`, `created_at`, `updated_at` (sem hard-delete; sem serial)
- [x] Contracts/types em packages (só DTOs/tipos — sem regra de negócio)
- [ ] `*Repository.ts` (classe; só acesso a dados)
- [x] `*Service.ts` (uma classe por caso de uso)
- [ ] `*Controller.ts` (classe; só HTTP)
- [ ] `*.routes.ts` + registro em `routes/index.ts`
- [ ] Middleware em `middlewares/` (se precisar)
- [x] Nomes: `ClientController.ts`, `CreateClientService.ts`, etc.
- [x] IDs: UUID apenas (`createId()` / `idColumn()`; nunca serial)

## Checklist frontend (se aplicável)

- [ ] Leu `.agents/skills/chakra-ui-builder/SKILL.md`
- [ ] Componentes com Chakra UI v3 + tokens semânticos
- [ ] Responsivo (base + md no mínimo)

## Justificativa de desvio (só se necessário)

Deps `chart.js` + `chartjs-node-canvas` em `apps/server`: pdfkit não renderiza charts; PNG embutido via `doc.image` é o caminho mínimo sem Puppeteer. Score/análise = nova regra de negócio só em Services (não em packages).

### Fórmula do score (0–100)

| Dimensão | Peso | Base |
|----------|------|------|
| Liquidez | 25% | saldo bancos vs pagar (hoje + aberto) |
| Rentabilidade | 25% | margemPercent + sinal lucroMes |
| Fluxo | 20% | recebimentosMes / max(pagamentosMes, 1) |
| Inadimplência | 20% | inverso de inadimplencia / max(receitaLiquidaMes, 1) |
| Cobertura AR/AP | 10% | aberto receber vs aberto pagar |

Faixas: ≥80 Excelente, ≥60 Bom, ≥40 Atenção, &lt;40 Crítico.

## Critérios de aceite

- [x] PDF Saúde: score, cards, charts, AR/AP highlights, fluxo, análise, resumo final
- [x] 12 PDFs: KPI cards + charts (series/aging) + tabela compacta com todas as rows
- [x] Score e análise determinísticos documentados
- [x] Sem mudança de UX frontend
- [x] `npm run check` ok no escopo (tsc + biome nos arquivos tocados)

## Progresso

- [x] Task file
- [x] Theme + Primitives + ChartRenderer
- [x] Score + Analysis services + contracts
- [x] GenerateFinanceiroSaudePdfService rewrite
- [x] FinanceiroPdfHelper upgrade
- [x] Validação (tsc, biome, smoke PDF/chart)
