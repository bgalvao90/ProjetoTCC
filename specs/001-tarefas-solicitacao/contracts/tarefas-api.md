# Contrato API e Realtime: Tarefas

## Status do documento

Contrato conhecido a partir de `changes.md`. Todos os itens marcados como
**A validar** precisam ser testados em staging antes do release.

## HTTP

### Criar

`POST /solicitacoes/{solicitacaoId}/tarefas`

Body:

```json
{
  "SolicitacaoId": 1,
  "Titulo": "Preparar apresentacao",
  "Descricao": "Criar os slides",
  "ResponsavelUsuarioId": 2,
  "MidiaId": null
}
```

Retorno conhecido: `201 Created` + `TarefaDto`.

### Listar

`GET /solicitacoes/{solicitacaoId}/tarefas`

Retorno conhecido: `200 OK` + `TarefaDto[]`.

O MVP inicial nao oferece paginacao porque o endpoint nao retorna metadados ou
parametros paginados confirmados.

### Obter

`GET /solicitacoes/{solicitacaoId}/tarefas/{tarefaId}`

Retorno conhecido: `200 OK` + `TarefaDto`.

### Atualizar

`PUT /solicitacoes/{solicitacaoId}/tarefas/{tarefaId}`

Body: `CriarTarefaRequest`, preservando responsavel no frontend.

### Alterar status

`PUT /solicitacoes/{solicitacaoId}/tarefas/{tarefaId}/status`

Body: inteiro JSON (`2` ou `3`), nao objeto.

## Erros a validar

| Caso | Status esperado | Estado |
|---|---|---|
| Nao autenticado | 401 | A validar |
| Nao participante | 403 | A validar |
| Solicitacao encerrada | 400 ou 403 | A validar |
| Tarefa inexistente | 404 | A validar |
| Midia invalida | 400 | A validar |
| Conflito de concorrencia | 409 | Bloqueado: formato desconhecido |

## SignalR

- Hub documentado: `/hubs/projetotcc`.
- Autenticacao documentada: JWT via `access_token` em query string.
- Eventos conhecidos:
  - `NovaTarefa`
  - `TarefaAtualizada`
- Payload conhecido:

```json
{
  "TarefaId": 10,
  "SolicitacaoId": 1,
  "Titulo": "Preparar apresentacao",
  "StatusId": 1,
  "ResponsavelUsuarioId": 2
}
```

**A validar**: metodo de entrada no grupo, nome do grupo, reconexao, evento separado
de status e comportamento de autorizacao.

## Midia no frontend

O backend aceita um `MidiaId`, mas o frontend nao possui seletor de arquivo aprovado.
Por seguranca e usabilidade, o MVP inicial nao mostra entrada manual de identificador.
A funcionalidade deve permanecer indisponivel ate existir fluxo de selecao e upload
via `midiaService.upload`.
