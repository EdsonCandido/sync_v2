# Tarefa: Helios Solar System R3F → revertido

- **Status:** done
- **Data:** 2026-08-01
- **Slug:** `20260801-helios-solar-r3f`

## Objetivo (atualizado)

Remover a seção / stack R3F do sistema solar. Aplicar `ConstellationField` em página inteira (fixed). FAQ focado nos módulos do CRM, sem ITR.

## Fora de escopo

- Server / packages
- Consulta ITR pública (rota separada permanece)

## Apps / packages tocados

- [x] `apps/web`

## Critérios de aceite

- [x] Sistema solar / R3F removidos (deps three desinstaladas)
- [x] Constelação mouse na página inteira (`position: fixed`)
- [x] FAQ com perguntas por módulo (Dashboard, Clientes, Financeiro, Agenda, Vendas, Automação, Relatórios, Configurações) — sem ITR
- [x] Typecheck / Biome ok

## Progresso

- [x] Remover solar + deps
- [x] Wire constellation page-wide
- [x] FAQ módulos
