# Tasks: Chat de Orientacao

**Input**: documentos em `specs/002-chat-orientacao/`  
**Plano canonico**: `specs/002-chat-orientacao/plan.md`  
**Status**: pronta para iniciar; contratos backend e governanca bloqueiam codigo avancado

## Phase 1: Contratos e Governanca

- [ ] T001 Disponibilizar e revisar o repositorio real da API contra `contracts/chat-orientacao-api.md`
- [ ] T002 [P] Registrar contratos atuais de solicitacoes, mensagens, midias, tarefas, SignalR e push
- [ ] T003 Definir migration reversivel de aluno unico para `ParticipanteOrientacao`
- [ ] T004 Definir migration de mensagens, tarefas e midias existentes sem perda de historico
- [ ] T005 Registrar aprovacao para alterar `package.json` com SignalR, seletor de arquivos, Markdown, push e testes
- [ ] T006 Definir politica operacional de retencao, acesso a auditoria e limpeza de arquivos

**Checkpoint**: nenhum contrato inventado e dependencias aprovadas.

## Phase 2: Foundation Backend

- [ ] T007 [P] Implementar status e transicoes aprovadas da orientacao
- [ ] T008 [P] Implementar `ParticipanteOrientacao` com professor unico e multiplos alunos
- [ ] T009 Implementar autorizacao central por participante, papel e status
- [ ] T010 [P] Implementar auditoria imutavel e soft-delete compartilhado
- [ ] T011 Implementar concorrencia otimista e respostas HTTP 409
- [ ] T012 Implementar timeline tipada paginada por cursor
- [ ] T013 Criar e validar migrations e testes de rollback

## Phase 3: Anexos GridFS [US2]

- [ ] T014 [P] Implementar upload streaming/GridFS com limite de 25 MB
- [ ] T015 [P] Validar MIME, assinatura, extensao, ZIP e bloqueio de executaveis
- [ ] T016 Implementar multiplos anexos na criacao da solicitacao
- [ ] T017 Implementar anexos no chat, download autorizado, substituicao e soft-delete
- [ ] T018 Implementar compensacao e limpeza para falhas entre PostgreSQL e MongoDB
- [ ] T019 Criar testes de contrato, integracao, autorizacao e limites de anexos

## Phase 4: Chat, Realtime e Push [US1] [US6]

- [ ] T020 Implementar mensagens tipadas com Markdown sanitizado
- [ ] T021 Implementar edicao/remocao pelo autor dentro de 15 minutos
- [ ] T022 Implementar leituras por participante
- [ ] T023 Implementar eventos de sistema para status, participantes e conteudo removido
- [ ] T024 Implementar SignalR autorizado, grupos, eventos e reconexao com refetch
- [ ] T025 Implementar registro de dispositivos e push idempotente com payload minimo
- [ ] T026 Criar testes de dois usuarios, reconexao, leitura, janela de edicao e push

## Phase 5: Tarefas e Links [US3] [US5]

- [ ] T027 Evoluir tarefa para owner/responsavel criador imutavel, prazo e soft-delete
- [ ] T028 Implementar passos estruturados, ordenacao e auditoria
- [ ] T029 Implementar automacao Pendente -> EmProgresso -> Concluida por passos
- [ ] T030 Implementar status manual para tarefa sem passos e reabertura
- [ ] T031 Bloquear edicao de tarefa concluida ate reabertura
- [ ] T032 Emitir eventos de tarefa e passos na timeline
- [ ] T033 Implementar links Markdown, tarefa opcional e preview protegido contra SSRF
- [ ] T034 Criar testes de tarefas, concorrencia, historico e links seguros

## Phase 6: Frontend Foundation

- [ ] T035 Centralizar novos DTOs e enums em `src/types.ts`
- [ ] T036 [P] Implementar services de orientacao, timeline, anexos e links em `src/services/`
- [ ] T037 [P] Implementar `src/services/realtimeService.ts` apos T005 e T024
- [ ] T038 Implementar hooks de timeline e realtime em `src/hooks/`
- [ ] T039 Implementar validacoes e permissoes puras em `src/utils/`
- [ ] T040 Criar testes de services, hooks, validacoes e contratos frontend

## Phase 7: Tela Unica de Orientacao [US1-US5]

- [ ] T041 [P] Implementar `OrientacaoHeader` e menu autorizado em `src/components/`
- [ ] T042 [P] Implementar componentes tipados da timeline em `src/components/`
- [ ] T043 [P] Implementar composer Markdown, anexos, tarefas e links em `src/components/`
- [ ] T044 [P] Implementar painel flutuante de tarefas ativas em `src/components/`
- [ ] T045 Integrar anexos iniciais em `src/screens/CriarSolicitacaoScreen.tsx`
- [ ] T046 Substituir detalhes/abas pela conversa em `src/screens/SolicitacaoDetalheScreen.tsx`
- [ ] T047 Aplicar somente leitura para Pendente, Pausada, Finalizada e Recusada
- [ ] T048 Remover rota/tela de chat separada somente apos validar compatibilidade e migracao
- [ ] T049 Criar testes de componentes e fluxos da tela unica

## Phase 8: Qualidade e Release

- [ ] T050 Executar migration em staging com backup e rollback comprovado
- [ ] T051 Validar autorizacao, Markdown, upload, ZIP, SSRF, downloads e auditoria
- [ ] T052 Validar SignalR e push com professor e dois alunos
- [ ] T053 Executar type-check, testes backend/frontend e contratos
- [ ] T054 Validar Android, iOS e Web, incluindo acessibilidade e responsividade
- [ ] T055 Executar todos os fluxos de `quickstart.md` e registrar evidencias
- [ ] T056 Atualizar gates e decisao de release em `plan.md`

## Dependencies

- T001-T006 bloqueiam mudancas contratuais e dependencias.
- T007-T013 bloqueiam todas as historias backend.
- T014-T034 devem ser validadas na API antes da integracao frontend correspondente.
- T037 depende de aprovacao em T005 e contrato SignalR validado em T024.
- T048 ocorre apenas apos a tela unica estar validada e dados antigos acessiveis.

## Implementation Strategy

1. Fechar contratos, governanca e migrations.
2. Entregar foundation backend e anexos.
3. Entregar chat realtime e tarefas.
4. Substituir a experiencia frontend.
5. Liberar apenas apos seguranca e smoke multiplataforma.

Nenhuma tarefa deve ser marcada como concluida sem implementar e validar seus
entregaveis. Integracoes com backend, SignalR, GridFS e push exigem evidencia.
