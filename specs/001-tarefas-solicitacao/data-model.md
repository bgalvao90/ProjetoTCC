# Data Model: Tarefas em Solicitacoes

## TarefaStatus

| Valor | Nome | Proximo estado |
|---|---|---|
| 1 | Pendente | EmProgresso |
| 2 | EmProgresso | Concluida |
| 3 | Concluida | Nenhum |

Transicoes reversas e saltos sao invalidos.

## TarefaDto atual

| Campo | Tipo | Regra |
|---|---|---|
| `TarefaId` | number | Identificador unico |
| `SolicitacaoId` | number | Deve apontar para a solicitacao atual |
| `Titulo` | string | Obrigatorio, 1-180 caracteres |
| `Descricao` | string/null | Opcional, maximo 4000 caracteres |
| `StatusId` | TarefaStatus | Ciclo linear |
| `ResponsavelUsuarioId` | number/null | Opcional e imutavel apos criacao |
| `PossuiMidia` | boolean | Indica anexo |
| `MidiaId` | string/null | Um anexo no contrato atual |
| `DataCriacao` | ISO-8601 | Definida pelo backend |
| `DataAlteracao` | ISO-8601/null | Definida pelo backend |
| `DataConclusao` | ISO-8601/null | Preenchida ao concluir |

## Relacionamentos

- Solicitacao 1:N Tarefa.
- Usuario 1:N Tarefa como responsavel opcional.
- Tarefa 0:1 Midia no contrato atual.
- Aluno e professor da solicitacao sao os unicos participantes aceitos.

## Invariantes

- Solicitacao finalizada ou recusada torna tarefas somente leitura.
- Tarefa concluida e somente leitura.
- Responsavel nao muda apos criacao.
- Nao existe exclusao de tarefa.
- Backend e autoridade final de permissao, status e integridade.

## Campos futuros bloqueados por contrato

- `RowVersion`.
- Nome historico do responsavel.
- Auditoria de criador/alterador.
- Colecao de midias.
- Metadados de paginacao.
