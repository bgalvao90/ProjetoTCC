# Instrucoes do Projeto para o Codex

## Spec Kit

- Trate `.specify/memory/constitution.md` como a fonte principal de regras do projeto.
- Antes de implementar uma feature, leia sua especificacao, plano e tarefas em `specs/`.
- Para a feature `001-tarefas-solicitacao`, use `specs/001-tarefas-solicitacao/plan.md` como plano tecnico canonico.
- Para a feature `001-tarefas-solicitacao`, use `specs/001-tarefas-solicitacao/tasks.md` como checklist executavel canonico.
- Continue o trabalho a partir das tarefas pendentes, respeitando dependencias e a ordem definida em `tasks.md`.
- Marque uma tarefa como concluida somente depois de implementar e validar seus entregaveis.
- Quando a especificacao divergir do backend existente ou de um contrato confirmado, priorize o contrato real e documente a divergencia.
- Nao altere requisitos, a constituicao ou decisoes arquiteturais sem autorizacao do usuario.

## Implementacao

- Siga a separacao definida pela constituicao: tipos em `src/types.ts`, regras em `src/services/`, orquestracao em `src/screens/`, apresentacao em `src/components/` e rotas em `app/`.
- Use named exports e mantenha TypeScript em modo strict.
- Trate operacoes assincronas nas screens e hooks; services devem propagar erros.
- Use `getErrorMessage()` para mensagens de erro e `theme.*` para estilos.
- Nao altere os arquivos declarados intocaveis na constituicao.

## Validacao

- Execute o type-check e os testes disponiveis depois das alteracoes.
- Nao marque tarefas de integracao com backend ou SignalR como concluidas sem evidencia verificavel.
- Ao finalizar, informe tarefas concluidas, validacoes executadas e bloqueios encontrados.
