# Quickstart de Validacao: Tarefas

## Pre-requisitos

- API de staging acessivel.
- `.env.local` com `EXPO_PUBLIC_API_URL`.
- Dois usuarios participantes da mesma solicitacao: aluno e professor.
- Solicitacoes nos estados ativa, finalizada e recusada.

## Validacoes locais

```powershell
npx tsc --noEmit
npx expo export --platform android
```

Resultado esperado: ambos concluem sem erros.

## Cenarios smoke

1. Entrar como aluno e abrir uma solicitacao ativa.
2. Abrir a aba Tarefas e criar tarefa sem responsavel.
3. Criar tarefa atribuida ao professor.
4. Editar titulo e descricao; confirmar que responsavel permanece bloqueado.
5. Avancar `Pendente -> Em progresso -> Concluida`.
6. Confirmar que tarefa concluida fica somente leitura.
7. Entrar como professor e confirmar acesso e alteracao de tarefas.
8. Abrir solicitacao finalizada e recusada; confirmar somente leitura.
9. Usar usuario nao participante; confirmar acesso negado e ausencia de request.
10. Simular erros 401, 403, 404, 409 e 500 conforme contrato.

## Validacao de contrato

- Comparar requests/responses com `contracts/tarefas-api.md`.
- Registrar qualquer divergencia antes de alterar frontend.
- Nao habilitar retry de concorrencia ou SignalR sem validar seus contratos.

## Criterio de aprovacao

- Gates de producao de `plan.md` concluídos.
- Smoke test executado em Android e iOS.
- Nenhuma operacao permite alterar tarefa encerrada ou concluida.
- Nenhum erro deixa a UI travada em loading/busy.
