# Contrato Proposto: Chat de Orientacao

**Estado**: proposta para implementacao e validacao no backend. Nenhum endpoint novo
esta confirmado no contrato real atual.

## Solicitacao e participantes

```text
POST   /solicitacoes                              multipart: dados + anexos iniciais
GET    /solicitacoes/{id}
PUT    /solicitacoes/{id}/status                  body: { NovoStatusId, RowVersion }
GET    /solicitacoes/{id}/participantes
POST   /solicitacoes/{id}/participantes/alunos    body: { UsuarioId, RowVersion }
DELETE /solicitacoes/{id}/participantes/alunos/{usuarioId}
```

Somente professor altera status e alunos. `DELETE` de participante encerra a
participacao logicamente.

## Linha do tempo e mensagens

```text
GET    /solicitacoes/{id}/timeline?cursor=&limit=
POST   /solicitacoes/{id}/mensagens
PUT    /solicitacoes/{id}/mensagens/{mensagemId}
DELETE /solicitacoes/{id}/mensagens/{mensagemId}
POST   /solicitacoes/{id}/mensagens/leituras
```

Timeline deve retornar envelope paginado por cursor com itens tipados e ordenacao
estavel. Edicao/remocao deve validar autor e janela de 15 minutos.

## Anexos

```text
POST   /solicitacoes/{id}/anexos                  multipart/streaming
GET    /solicitacoes/{id}/anexos/{anexoId}/download
PUT    /solicitacoes/{id}/anexos/{anexoId}        substituicao
DELETE /solicitacoes/{id}/anexos/{anexoId}
```

Validar limite de 25 MB, MIME declarado, assinatura real, extensao, hash e
autorizacao. Executaveis sao bloqueados. ZIP e permitido com politica de seguranca.

## Tarefas e passos

```text
GET    /solicitacoes/{id}/tarefas?ativas=
POST   /solicitacoes/{id}/tarefas
PUT    /solicitacoes/{id}/tarefas/{tarefaId}
DELETE /solicitacoes/{id}/tarefas/{tarefaId}
PUT    /solicitacoes/{id}/tarefas/{tarefaId}/status
POST   /solicitacoes/{id}/tarefas/{tarefaId}/reabrir
POST   /solicitacoes/{id}/tarefas/{tarefaId}/passos
PUT    /solicitacoes/{id}/tarefas/{tarefaId}/passos/{passoId}
DELETE /solicitacoes/{id}/tarefas/{tarefaId}/passos/{passoId}
PUT    /solicitacoes/{id}/tarefas/{tarefaId}/passos/{passoId}/conclusao
GET    /solicitacoes/{id}/tarefas/{tarefaId}/historico
```

Owner e definido pelo token autenticado na criacao e nunca recebido como campo
editavel. Alteracoes geram item de timeline e auditoria na mesma operacao logica.

## Links

```text
POST   /solicitacoes/{id}/links
PUT    /solicitacoes/{id}/links/{linkId}
DELETE /solicitacoes/{id}/links/{linkId}
```

Preview deve ser gerado server-side com protecao SSRF. Vinculo com tarefa e opcional.

## SignalR

Hub proposto: `/hubs/projetotcc`.

Eventos minimos:

```text
TimelineItemCriado
TimelineItemAtualizado
MensagemLida
TarefaAtualizada
ParticipantesAtualizados
OrientacaoStatusAlterado
```

O servidor deve autorizar entrada no grupo da solicitacao. Reconexao deve ser seguida
de refetch por cursor; eventos nao substituem a API como fonte de verdade.

## Push

Backend deve registrar tokens por dispositivo, respeitar preferencias e evitar push
duplicado para usuario ativo. Push transporta apenas metadados, nunca conteudo sensivel.

## Erros obrigatorios

| Status | Uso |
|---|---|
| 400 | Validacao de dados, formato ou transicao |
| 401 | Nao autenticado |
| 403 | Nao participante ou acao sem permissao |
| 404 | Recurso inexistente ou removido |
| 409 | Conflito de concorrencia |
| 413 | Arquivo acima de 25 MB |
| 415 | Tipo de arquivo nao permitido |
