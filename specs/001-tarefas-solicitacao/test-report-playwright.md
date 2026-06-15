# Relatorio de Execucao Playwright

## Resultado final

- Data: 2026-06-15
- Plataforma: Expo Web / Chromium
- Suite: `tests/e2e/orientacao-lifecycle.spec.ts`
- Status geral: **APROVADO**
- Casos aprovados: **10 de 10**
- Casos falhos: **0**
- Duracao total: **21,3 segundos**
- Type-check: **APROVADO** (`npx tsc --noEmit`)
- Comando: **APROVADO** (`npm run test:e2e`)

## Resultados e evidencias

| ID | Caso | Resultado | Evidencia |
|---|---|---|---|
| E2E-001 | Login do aluno | APROVADO | [Print](../../evidencias/playwright/01-login-aluno.png) |
| E2E-002 | Login do professor | APROVADO | [Print](../../evidencias/playwright/02-login-professor.png) |
| E2E-003 | Lista vazia | APROVADO | [Print](../../evidencias/playwright/03-lista-solicitacoes-vazia.png) |
| E2E-004 | Solicitacao criada | APROVADO | [Print](../../evidencias/playwright/04-solicitacao-criada.png) |
| E2E-005 | Pendente somente leitura | APROVADO | [Print](../../evidencias/playwright/05-solicitacao-pendente-somente-leitura.png) |
| E2E-006 | Solicitacao aceita | APROVADO | [Print](../../evidencias/playwright/06-solicitacao-aceita.png) |
| E2E-007 | Tarefa criada | APROVADO | [Print](../../evidencias/playwright/07-tarefa-criada.png) |
| E2E-008 | Tarefa em progresso | APROVADO | [Print](../../evidencias/playwright/08-tarefa-em-progresso.png) |
| E2E-009 | Tarefa concluida | APROVADO | [Print](../../evidencias/playwright/09-tarefa-concluida.png) |
| E2E-010 | Solicitacao finalizada | APROVADO | [Print](../../evidencias/playwright/10-solicitacao-finalizada.png) |

## Ambiente e limites

- API real configurada: `http://192.168.100.2:8080`.
- A API real estava indisponivel; foi usado backend mock stateful.
- A suite comprova navegacao e integracao do frontend.
- Backend real, bancos, SignalR, push e auditoria exigem validacao separada.
- O relatorio HTML local fica em `playwright-report/index.html`.
- O resultado JSON local fica em `test-results/results.json`.

## Conclusao

O requisito minimo de 10 casos Playwright com evidencias foi atendido. Todos os
casos sao independentes, reproduziveis e possuem prints prontos para entrega no
repositorio GitHub.
