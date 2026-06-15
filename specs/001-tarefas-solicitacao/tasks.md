# Tasks: Tarefas em Solicitacoes de Mentoria

**Input**: documentos em `specs/001-tarefas-solicitacao/`  
**Plano canonico**: `specs/001-tarefas-solicitacao/plan.md`  
**Status**: implementacao parcial; fechamento orientado a producao  
**Tests**: obrigatorios antes do release, conforme spec e gates do plano

## Formato

- `[P]`: pode executar em paralelo por afetar arquivos diferentes
- `[US1]`: criar e listar tarefas
- `[US2]`: editar, alterar status e aplicar permissoes
- `[US3]`: anexar e exibir midia
- `[US4]`: realtime e concorrencia
- `[US5]`: qualidade e release

## Phase 1: Setup e Contratos

**Purpose**: consolidar a fonte de verdade e remover ambiguidades que bloqueiam producao.

- [x] T001 Consolidar o plano tecnico canonico em specs/001-tarefas-solicitacao/plan.md
- [x] T002 [P] Documentar decisoes tecnicas em specs/001-tarefas-solicitacao/research.md
- [x] T003 [P] Documentar o modelo real em specs/001-tarefas-solicitacao/data-model.md
- [x] T004 [P] Documentar o contrato HTTP e SignalR conhecido em specs/001-tarefas-solicitacao/contracts/tarefas-api.md
- [x] T005 [P] Criar guia de validacao em specs/001-tarefas-solicitacao/quickstart.md
- [ ] T006 Validar em staging todos os endpoints e erros 400/401/403/404/500 e atualizar specs/001-tarefas-solicitacao/contracts/tarefas-api.md
- [ ] T007 Validar o HTTP 409, o formato de RowVersion e a estrategia de retry em specs/001-tarefas-solicitacao/contracts/tarefas-api.md
- [ ] T008 Validar hub, autenticacao, grupos e eventos SignalR em specs/001-tarefas-solicitacao/contracts/tarefas-api.md
- [x] T009 Registrar a decisao de paginacao real ou retirada do MVP em specs/001-tarefas-solicitacao/plan.md
- [ ] T010 Registrar aprovacao de governanca para alterar package.json com ferramentas de teste e SignalR em specs/001-tarefas-solicitacao/research.md

**Checkpoint**: contratos bloqueadores aprovados e versionados.

---

## Phase 2: Foundational

**Purpose**: foundation compartilhada por todas as historias.

- [x] T011 Centralizar TarefaStatus, TarefaDto, requests e ParticipanteTarefa em src/types.ts
- [x] T012 [P] Implementar validadores, formatacao, transicao e permissao em src/utils/tarefa.ts
- [x] T013 [P] Implementar CRUD conforme contrato real em src/services/tarefaService.ts
- [x] T014 Implementar estado local, loading, busy e propagacao de erros em src/hooks/useTarefas.ts
- [x] T015 [P] Expandir status visuais de tarefa em src/components/StatusBadge.tsx
- [x] T016 [P] Implementar selecao imutavel de responsavel em src/components/ResponsavelSelect.tsx
- [x] T017 [P] Implementar confirmacao de transicao linear em src/components/StatusSelector.tsx
- [x] T018 Ordenar tarefas deterministicamente por DataCriacao e TarefaId em src/hooks/useTarefas.ts
- [x] T019 Adicionar feedback acessivel de sucesso para criar, editar e alterar status em src/screens/TarefasScreen.tsx

**Checkpoint**: foundation funcional sem depender de realtime, paginacao ou retry.

---

## Phase 3: User Story 1 - Criar e Listar Tarefas (Priority: P1) MVP

**Goal**: participante cria tarefa e visualiza a lista da solicitacao.

**Independent Test**: entrar como aluno participante, criar tarefa sem responsavel e
com responsavel professor, recarregar a aba e confirmar dados, loading, erro e vazio.

### Tests for User Story 1

- [ ] T020 [P] [US1] Criar testes de contrato do CRUD conhecido em tests/contract/tarefaService.contract.test.ts
- [ ] T021 [P] [US1] Criar testes de validacao e criacao em tests/unit/tarefa.test.ts
- [ ] T022 [P] [US1] Criar testes do formulario de criacao em tests/components/TarefaForm.test.tsx
- [ ] T023 [P] [US1] Criar testes de lista, loading, erro e vazio em tests/components/TarefasScreen.test.tsx

### Implementation for User Story 1

- [x] T024 [US1] Implementar formulario de titulo, descricao e responsavel em src/components/TarefaForm.tsx
- [x] T025 [US1] Implementar card de tarefa e fallback de responsavel em src/components/TarefaCard.tsx
- [x] T026 [US1] Implementar criacao e atualizacao otimista pela resposta da API em src/hooks/useTarefas.ts
- [x] T027 [US1] Implementar lista, loading, erro, retry e empty state em src/screens/TarefasScreen.tsx
- [x] T028 [US1] Integrar a aba Tarefas em src/screens/SolicitacaoDetalheScreen.tsx
- [x] T029 [US1] Adicionar acao Criar primeira tarefa ao empty state em src/screens/TarefasScreen.tsx
- [x] T030 [US1] Recarregar tarefas ao retornar para a aba Tarefas em src/screens/SolicitacaoDetalheScreen.tsx
- [x] T031 [US1] Implementar paginacao contratual ou documentar limite operacional na UI em src/screens/TarefasScreen.tsx

**Checkpoint**: US1 funciona independentemente sem realtime.

---

## Phase 4: User Story 2 - Editar, Avancar Status e Aplicar Permissoes (Priority: P1)

**Goal**: participantes editam tarefas permitidas, avancam status linearmente e veem
modo somente leitura quando necessario.

**Independent Test**: editar titulo/descricao, confirmar responsavel bloqueado, avancar
ate Concluida e validar bloqueios para concluida, finalizada, recusada e nao participante.

### Tests for User Story 2

- [ ] T032 [P] [US2] Criar testes de transicao e permissao em tests/unit/tarefaPermissions.test.ts
- [ ] T033 [P] [US2] Criar testes do seletor de status em tests/components/StatusSelector.test.tsx
- [ ] T034 [P] [US2] Criar testes do card somente leitura em tests/components/TarefaCard.test.tsx
- [ ] T035 [P] [US2] Criar testes de participante e solicitacao encerrada em tests/components/TarefasPermissions.test.tsx

### Implementation for User Story 2

- [x] T036 [US2] Validar transicao linear antes da requisicao em src/services/tarefaService.ts
- [x] T037 [US2] Bloquear responsavel durante edicao em src/components/TarefaForm.tsx
- [x] T038 [US2] Bloquear edicao de tarefa concluida em src/screens/TarefasScreen.tsx
- [x] T039 [US2] Bloquear escritas em solicitacao finalizada ou recusada em src/screens/TarefasScreen.tsx
- [x] T040 [US2] Bloquear consulta e operacoes de usuario nao participante em src/screens/TarefasScreen.tsx
- [x] T041 [US2] Integrar abas Detalhes, Tarefas e Chat em src/screens/SolicitacaoDetalheScreen.tsx
- [x] T042 [US2] Exibir mensagem especifica ao abrir tarefa concluida em src/screens/TarefasScreen.tsx
- [x] T043 [US2] Revisar mensagens de erro 403 e solicitacao encerrada em src/utils/validation.ts

**Checkpoint**: US2 funciona independentemente sem concorrencia avancada.

---

## Phase 5: User Story 3 - Anexar e Exibir Midia (Priority: P2)

**Goal**: participante anexa um arquivo valido e visualiza seus metadados na tarefa.

**Independent Test**: selecionar arquivo, concluir upload, criar tarefa com `MidiaId`,
visualizar anexo e confirmar erro claro para midia invalida.

### Tests for User Story 3

- [ ] T044 [P] [US3] Criar testes do upload e falhas de midia em tests/unit/midiaTarefa.test.ts
- [ ] T045 [P] [US3] Criar testes do formulario com anexo em tests/components/TarefaMidiaForm.test.tsx

### Implementation for User Story 3

- [x] T046 [US3] Definir e documentar fluxo de selecao de arquivo sem violar package.json em specs/001-tarefas-solicitacao/contracts/tarefas-api.md
- [ ] T047 [US3] Integrar upload via midiaService e remover entrada manual de MidiaId em src/components/TarefaForm.tsx
- [ ] T048 [US3] Exibir nome, tipo e acao de abertura da midia em src/components/TarefaCard.tsx
- [ ] T049 [US3] Tratar falhas de upload e inconsistencias antes de criar tarefa em src/screens/TarefasScreen.tsx

**Checkpoint**: US3 pronta somente depois de upload real validado.

---

## Phase 6: User Story 4 - Realtime e Concorrencia (Priority: P2)

**Goal**: dois participantes recebem atualizacoes confirmadas e conflitos nao causam
sobrescrita silenciosa.

**Independent Test**: dois clientes na mesma solicitacao recebem criacao/atualizacao;
desconexao recarrega a lista; conflito 409 exibe escolha segura.

### Tests for User Story 4

- [ ] T050 [P] [US4] Criar testes dos eventos SignalR confirmados em tests/integration/tarefaRealtime.test.ts
- [ ] T051 [P] [US4] Criar testes de reconexao e refetch em tests/integration/tarefaReconnect.test.ts
- [ ] T052 [P] [US4] Criar testes de conflito 409 e retry limitado em tests/integration/tarefaConflict.test.ts

### Implementation for User Story 4

- [ ] T053 [US4] Adicionar cliente SignalR aprovado e scripts de teste aprovados em package.json
- [ ] T054 [US4] Implementar conexao autenticada e listeners confirmados em src/hooks/useTarefas.ts
- [ ] T055 [US4] Implementar reconexao com refetch e estado de sincronizacao em src/hooks/useTarefas.ts
- [ ] T056 [US4] Adicionar RowVersion ao contrato somente apos validacao em src/types.ts
- [ ] T057 [US4] Detectar HTTP 409 e preservar erro original em src/services/tarefaService.ts
- [ ] T058 [US4] Implementar dialog Recarregar ou Manter edicao em src/screens/TarefasScreen.tsx
- [ ] T059 [US4] Implementar retry limitado somente com RowVersion confirmada em src/hooks/useTarefas.ts

**Checkpoint**: US4 nao pode iniciar antes de T007, T008 e T010.

---

## Phase 7: User Story 5 - Qualidade e Release (Priority: P1)

**Goal**: comprovar que o escopo liberado e seguro para producao em Android e iOS.

**Independent Test**: executar quickstart, suites automatizadas e smoke test com aluno
e professor em staging sem erros bloqueadores.

### Tests and Release for User Story 5

- [ ] T060 [US5] Configurar runner, React Native Testing Library, lint e coverage aprovados em package.json
- [ ] T061 [P] [US5] Criar fixtures e mocks compartilhados em tests/fixtures/tarefas.ts
- [ ] T062 [P] [US5] Criar testes de regressao dos erros 400/401/403/404/409/500 em tests/integration/tarefaErrors.test.ts
- [x] T063 [P] [US5] Criar testes end-to-end dos cenarios smoke em tests/e2e/orientacao-lifecycle.spec.ts
- [ ] T064 [US5] Executar e registrar type-check, lint, testes e coverage em specs/001-tarefas-solicitacao/quickstart.md
- [ ] T065 [US5] Validar bundle Android e iOS e registrar resultados em specs/001-tarefas-solicitacao/quickstart.md
- [ ] T066 [US5] Executar smoke test com aluno e professor em staging e registrar resultados em specs/001-tarefas-solicitacao/quickstart.md
- [ ] T067 [US5] Revisar acessibilidade, labels e alvos de toque em src/components/TarefaForm.tsx
- [ ] T068 [US5] Revisar logs, tokens e exposicao de identificadores em src/api/client.ts
- [ ] T069 [US5] Atualizar gates concluidos e decisao de release em specs/001-tarefas-solicitacao/plan.md

**Checkpoint**: release somente quando todos os gates do plano estiverem concluídos.

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 inicia imediatamente; T006-T010 bloqueiam funcionalidades avancadas.
- Phase 2 esta concluida; US1 e US2 podem ser validadas.
- US1 e US2 sao o MVP funcional atual e podem ser fechadas em paralelo.
- US3 depende da decisao de upload e do contrato de midia.
- US4 depende obrigatoriamente de T007, T008, T010 e aprovacao para `package.json`.
- US5 depende do escopo de release decidido e da aprovacao da infraestrutura de testes.

### User Story Dependencies

- US1: independente apos Foundation.
- US2: independente apos Foundation e reutiliza dados de US1.
- US3: depende de US1 e do contrato de midia.
- US4: depende de US1/US2 e dos contratos de concorrencia/realtime.
- US5: valida todas as historias selecionadas para release.

### Parallel Opportunities

- T006, T007 e T008 podem ser investigadas em paralelo.
- T006, T007, T008 e T010 continuam como gates para funcionalidades avancadas.
- Testes marcados `[P]` de cada historia podem ser escritos em paralelo.
- US3 e validacao contratual de US4 podem avançar em paralelo.
- T061, T062 e T063 podem ser executadas em paralelo apos T060.

## Implementation Strategy

### MVP seguro

1. Fechar T006 e validar as tarefas restantes de US1/US2.
2. Executar testes e smoke do escopo CRUD/status/read-only.
3. Liberar sem realtime, retry automatico e midia caso esses contratos permaneçam bloqueados.

### Incremental

1. Release CRUD + status + permissoes.
2. Adicionar midia apos validar upload.
3. Adicionar realtime apos validar SignalR.
4. Adicionar concorrencia somente com RowVersion confirmada.

## Notes

- Nenhuma tarefa deve inventar contrato ausente.
- Alteracoes em `package.json` exigem aprovacao formal registrada em T010.
- O backend permanece autoridade final de permissao e integridade.
- Toda tarefa concluida deve ser validada antes de mudar para `[x]`.
