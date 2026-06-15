# Feature Specification: Chat de Orientacao

**Feature**: `002-chat-orientacao`  
**Created**: 2026-06-15  
**Status**: Aprovada para planejamento e implementacao  
**Input**: Substituir os detalhes da solicitacao por uma conversa moderna que concentre mensagens, anexos, tarefas, links, status e participantes.

## Escopo e precedencia

Esta feature referencia a `001-tarefas-solicitacao` e substitui suas decisoes quando
houver divergencia sobre tarefas, midia, participantes, status e integracao com chat.
O historico e os artefatos da feature `001` permanecem preservados.

## User Scenarios & Testing

### User Story 1 - Conversar em uma orientacao aceita (Priority: P1)

Aluno e professor usam uma unica linha do tempo em tempo real para trocar texto,
Markdown, arquivos e eventos do sistema.

**Independent Test**: aceitar uma solicitacao, abrir a conversa em dois usuarios,
enviar mensagens e confirmar entrega, leitura e atualizacao em tempo real.

**Acceptance Scenarios**:

1. **Given** solicitacao Pendente, **When** professor aceita, **Then** status muda para EmAndamento e o chat fica disponivel.
2. **Given** orientacao EmAndamento, **When** participante envia texto ou Markdown, **Then** todos os participantes recebem a mensagem em tempo real.
3. **Given** mensagem recebida e aberta, **When** participante visualiza a conversa, **Then** a leitura fica registrada e o remetente ve o estado de visualizacao.
4. **Given** mensagem propria com menos de 15 minutos, **When** autor edita ou remove, **Then** a alteracao aparece para todos e fica auditada.
5. **Given** mensagem removida, **When** a conversa e exibida, **Then** aparece "Mensagem removida" no lugar do conteudo.

### User Story 2 - Compartilhar documentos (Priority: P1)

Participantes anexam multiplos documentos na criacao da solicitacao e durante a
orientacao, com download direto na conversa.

**Independent Test**: criar solicitacao com anexos, aceitar, anexar novos arquivos
no chat, baixar, substituir e remover logicamente um arquivo.

**Acceptance Scenarios**:

1. **Given** aluno criando solicitacao, **When** inclui arquivos validos de ate 25 MB cada, **Then** a solicitacao e criada com todos os anexos.
2. **Given** orientacao EmAndamento, **When** aluno ou professor anexa documento, **Then** o documento aparece no chat e pode ser baixado.
3. **Given** autor de um anexo, **When** remove ou substitui o arquivo, **Then** a acao fica auditada e o arquivo removido deixa de estar disponivel.
4. **Given** arquivo executavel ou maior que 25 MB, **When** usuario tenta enviar, **Then** o upload e rejeitado com mensagem clara.

### User Story 3 - Gerenciar tarefas dentro da conversa (Priority: P1)

Qualquer participante cria tarefas com descricao Markdown, prazo e passos
estruturados; o criador e o owner e responsavel imutavel.

**Independent Test**: criar tarefa com passos, concluir o primeiro passo, concluir
todos, reabrir e acompanhar todos os eventos no chat e painel flutuante.

**Acceptance Scenarios**:

1. **Given** orientacao EmAndamento, **When** participante cria tarefa, **Then** ele se torna owner e responsavel imutavel.
2. **Given** tarefa Pendente com passos, **When** qualquer participante conclui o primeiro passo, **Then** a tarefa muda automaticamente para EmProgresso.
3. **Given** todos os passos concluidos, **When** o ultimo passo e marcado, **Then** a tarefa muda automaticamente para Concluida.
4. **Given** tarefa sem passos, **When** participante altera o status, **Then** ela pode ser iniciada ou concluida manualmente.
5. **Given** tarefa Concluida, **When** participante tenta editar, **Then** a edicao fica bloqueada; apos reabertura, volta a ser editavel.
6. **Given** alteracao em tarefa ou passo, **When** operacao e salva, **Then** um evento automatico aparece no chat e o historico detalhado fica auditado.

### User Story 4 - Controlar status e participantes (Priority: P2)

Professor controla o ciclo da orientacao e pode adicionar ou remover alunos, que
possuem as mesmas permissoes do aluno principal.

**Independent Test**: aceitar, pausar, reativar, finalizar, reabrir e recusar
solicitacoes; adicionar e remover aluno e verificar autorizacao.

**Acceptance Scenarios**:

1. **Given** solicitacao Pendente, **When** professor aceita ou recusa, **Then** ocorre transicao valida e um evento de sistema e registrado.
2. **Given** orientacao EmAndamento, **When** professor pausa, **Then** historico permanece visivel e novas interacoes ficam bloqueadas.
3. **Given** orientacao Pausada, **When** professor reativa, **Then** status volta para EmAndamento e novas interacoes sao liberadas.
4. **Given** orientacao EmAndamento ou Pausada, **When** professor confirma finalizacao, **Then** a orientacao fica Finalizada e somente leitura.
5. **Given** orientacao Finalizada, **When** professor reabre, **Then** status volta para EmAndamento.
6. **Given** aluno adicional incluido pelo professor, **When** ele acessa a orientacao, **Then** possui as mesmas permissoes dos demais alunos.

### User Story 5 - Compartilhar links de estudo (Priority: P2)

Participantes publicam links em Markdown com preview seguro e associacao opcional a
uma tarefa.

**Independent Test**: publicar link com e sem tarefa, visualizar preview, editar e
remover dentro de 15 minutos.

**Acceptance Scenarios**:

1. **Given** orientacao EmAndamento, **When** participante publica URL valida, **Then** o chat exibe Markdown e preview com titulo, descricao e imagem disponiveis.
2. **Given** link de estudo, **When** autor associa uma tarefa, **Then** o vinculo aparece no card do link e da tarefa.
3. **Given** URL interna, local ou insegura, **When** preview e solicitado, **Then** o sistema bloqueia o acesso e preserva o link como texto seguro.

### User Story 6 - Receber notificacoes (Priority: P2)

Participantes recebem notificacoes internas em tempo real e push para mensagens,
arquivos, tarefas, prazos e mudancas de status relevantes.

**Independent Test**: deixar um participante fora da conversa, gerar eventos e
confirmar push sem duplicacao quando ele retornar.

## Status e transicoes

| Status | Comportamento |
|---|---|
| Pendente | Aguarda decisao do professor; chat indisponivel |
| EmAndamento | Chat e operacoes liberadas |
| Pausada | Historico visivel; escritas bloqueadas; professor pode reativar |
| Finalizada | Somente leitura; professor pode reabrir |
| Recusada | Somente leitura e sem reabertura |

Transicoes permitidas:

```text
Pendente -> EmAndamento | Recusada
EmAndamento -> Pausada | Finalizada
Pausada -> EmAndamento | Finalizada
Finalizada -> EmAndamento
```

## Requirements

### Functional Requirements

- **FR-001**: Cada solicitacao deve possuir uma unica conversa, liberada ao ser aceita.
- **FR-002**: A conversa deve ordenar cronologicamente mensagens, arquivos, tarefas, links e eventos de sistema.
- **FR-003**: O sistema deve atualizar a conversa em tempo real e sincronizar apos reconexao.
- **FR-004**: O sistema deve registrar leitura por participante.
- **FR-005**: O autor pode editar ou remover sua mensagem em ate 15 minutos.
- **FR-006**: Remocao de mensagem, arquivo e tarefa deve ser logica e auditada.
- **FR-007**: Aluno e professor podem anexar multiplos arquivos na criacao e depois dela.
- **FR-008**: Cada arquivo deve ter no maximo 25 MB.
- **FR-009**: Formatos aceitos: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, CSV, PNG, JPG/JPEG, WEBP, GIF e ZIP; executaveis devem ser bloqueados.
- **FR-010**: Arquivos devem ser armazenados no MongoDB usando armazenamento apropriado para arquivos grandes e disponibilizados para download autorizado.
- **FR-011**: Participantes podem criar tarefas; o criador e owner e responsavel imutavel.
- **FR-012**: Participantes podem editar tarefas abertas, concluir passos, alterar status manual de tarefas sem passos, remover logicamente e reabrir tarefas.
- **FR-013**: Tarefas concluidas devem ficar bloqueadas para edicao ate serem reabertas.
- **FR-014**: Passos devem ser itens estruturados, ordenaveis e marcaveis individualmente.
- **FR-015**: Primeiro passo concluido muda tarefa Pendente para EmProgresso; todos concluidos mudam para Concluida.
- **FR-016**: Descricao de tarefa e mensagens devem suportar Markdown seguro: titulos, listas, checklist visual, links, codigo e imagens autorizadas.
- **FR-017**: Toda alteracao de tarefa deve gerar evento na conversa e entrada de auditoria.
- **FR-018**: Links de estudo podem ser publicados por qualquer participante e associados opcionalmente a tarefa.
- **FR-019**: Preview de link deve bloquear acesso a destinos internos, locais e inseguros.
- **FR-020**: Apenas professor pode alterar status da orientacao e gerenciar alunos participantes.
- **FR-021**: Todos os alunos participantes possuem as mesmas permissoes.
- **FR-022**: Finalizacao exige confirmacao e orientacao encerrada permanece acessivel em somente leitura.
- **FR-023**: O menu de tres pontos no cabecalho deve mostrar apenas acoes autorizadas para o perfil e status atual.
- **FR-024**: A interface deve oferecer painel flutuante de tarefas ativas sem criar aba separada.
- **FR-025**: O sistema deve emitir notificacoes internas e push para eventos relevantes.
- **FR-026**: O sistema deve manter auditoria de mensagens, anexos, tarefas, passos, participantes e status.
- **FR-027**: Autorizacao deve ser validada no backend para toda leitura, escrita e download.
- **FR-028**: A experiencia deve funcionar em Android, iOS e Web.

### Key Entities

- **Solicitacao/Orientacao**: titulo, tema, professor, participantes, status e datas.
- **ParticipanteOrientacao**: usuario, papel, data de entrada/saida e auditoria.
- **Mensagem**: tipo, autor, conteudo Markdown, referencias, leitura e exclusao logica.
- **Anexo**: metadados, referencia GridFS, autor, versao e exclusao logica.
- **Tarefa**: owner/responsavel imutavel, descricao Markdown, prazo, status e auditoria.
- **PassoTarefa**: descricao, ordem, conclusao, autor e datas.
- **LinkEstudo**: URL, preview seguro e tarefa opcional.
- **EventoAuditoria**: acao, ator, entidade, valores e data.

## Edge Cases

- Upload interrompido nao deve criar referencia de arquivo incompleta.
- ZIP e arquivos permitidos ainda devem ser verificados por assinatura real e politica de seguranca.
- Dois participantes alterando a mesma tarefa devem receber conflito verificavel, sem sobrescrita silenciosa.
- Usuario removido perde acesso imediatamente, mas seu conteudo historico permanece identificado.
- Push nao deve duplicar notificacao para usuario ativo na conversa.
- Preview indisponivel nao deve impedir a publicacao segura do link.

## Success Criteria

- **SC-001**: Dois participantes veem novas mensagens e eventos sem atualizacao manual em ate 3 segundos em condicoes normais.
- **SC-002**: 100% das operacoes de escrita e download rejeitam usuarios nao participantes.
- **SC-003**: Arquivos validos de ate 25 MB podem ser enviados e baixados sem uso de Base64 no contrato principal.
- **SC-004**: Alteracoes de status, tarefas e participantes possuem trilha de auditoria verificavel.
- **SC-005**: Orientacoes Pausadas, Finalizadas e Recusadas bloqueiam todas as escritas nao permitidas.
- **SC-006**: Os fluxos criticos passam em Android, iOS e Web com dois usuarios simultaneos.

## Assumptions

- O backend sera alterado no repositorio proprio, que ainda nao esta disponivel neste workspace.
- GridFS sera usado para arquivos, mantendo metadados e autorizacao na camada de dominio.
- Dependencias de SignalR, seletor de arquivos, Markdown, push e testes exigem aprovacao para alterar `package.json`.
- A politica de retencao temporal da auditoria sera permanente ate decisao posterior.
