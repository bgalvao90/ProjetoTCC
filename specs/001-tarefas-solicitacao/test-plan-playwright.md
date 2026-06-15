# Plano de Testes E2E com Playwright

## Objetivo

Atender ao requisito de entrega final de no minimo 10 casos Playwright por
desenvolvedor, cobrindo autenticacao, solicitacoes, orientacao e tarefas, com uma
evidencia visual versionavel para cada caso.

## Estrategia

- Runner: Playwright Test.
- Navegador: Chromium Desktop.
- Aplicacao: Expo Web em `http://127.0.0.1:8081`.
- API: mock stateful interceptado pelo Playwright.
- Isolamento: cada teste prepara seu proprio estado.
- Evidencias versionaveis: `evidencias/playwright/`.
- Relatorio navegavel local: `playwright-report/index.html`.

## Casos de teste

| ID | Caso | Resultado esperado | Evidencia |
|---|---|---|---|
| E2E-001 | Login do aluno | Home exibe nome e perfil Aluno | `01-login-aluno.png` |
| E2E-002 | Login do professor | Home exibe nome e perfil Professor | `02-login-professor.png` |
| E2E-003 | Lista de solicitacoes vazia | Empty state e acao de nova solicitacao | `03-lista-solicitacoes-vazia.png` |
| E2E-004 | Criacao de solicitacao | Detalhe exibe status Pendente | `04-solicitacao-criada.png` |
| E2E-005 | Solicitacao pendente somente leitura | Escritas bloqueadas enquanto pendente | `05-solicitacao-pendente-somente-leitura.png` |
| E2E-006 | Aceite da solicitacao | Status muda para EmAndamento | `06-solicitacao-aceita.png` |
| E2E-007 | Criacao de tarefa | Painel ativo exibe tarefa criada | `07-tarefa-criada.png` |
| E2E-008 | Inicio da tarefa | Status muda para Em progresso | `08-tarefa-em-progresso.png` |
| E2E-009 | Conclusao da tarefa | Tarefa sai do painel de ativas | `09-tarefa-concluida.png` |
| E2E-010 | Finalizacao da solicitacao | Status Finalizada e modo somente leitura | `10-solicitacao-finalizada.png` |

## Criterios de aprovacao

- Os 10 testes devem passar no Chromium.
- Cada teste deve gerar exatamente uma evidencia PNG.
- `npx tsc --noEmit` deve concluir sem erros.
- Nenhum teste com API mock comprova backend real, bancos ou SignalR.

## Execucao

```powershell
npm run test:e2e
npx tsc --noEmit
```
