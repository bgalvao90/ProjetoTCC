# Data Model: Chat de Orientacao

## Orientacao

| Campo | Regra |
|---|---|
| `SolicitacaoId` | Identificador existente |
| `ProfessorUsuarioId` | Unico professor gestor |
| `StatusId` | Pendente, EmAndamento, Pausada, Finalizada ou Recusada |
| `RowVersion` | Concorrencia otimista |
| `DataCriacao`, `DataAlteracao` | UTC |

## ParticipanteOrientacao

| Campo | Regra |
|---|---|
| `ParticipanteId` | Identificador |
| `SolicitacaoId`, `UsuarioId` | Par unico enquanto ativo |
| `Papel` | Professor ou Aluno |
| `Ativo` | Controla acesso atual |
| `AdicionadoPor`, `AdicionadoEm`, `RemovidoPor`, `RemovidoEm` | Auditoria |

Professor e unico. Alunos sao multiplos e possuem permissoes equivalentes.

## Mensagem

| Campo | Regra |
|---|---|
| `MensagemId`, `SolicitacaoId`, `AutorUsuarioId` | Identificacao |
| `Tipo` | Texto, Markdown, Arquivo, Tarefa, Status, LinkEstudo ou Sistema |
| `ConteudoMarkdown` | Fonte sanitizavel |
| `ReferenciaEntidadeId` | Tarefa, anexo ou link opcional |
| `CriadoEm`, `EditadoEm` | UTC |
| `RemovidoEm`, `RemovidoPor` | Soft-delete |
| `RowVersion` | Concorrencia |

Edicao/remocao pelo autor e permitida por 15 minutos. Eventos do sistema nao sao
editaveis por participantes.

## LeituraMensagem

Chave composta por `MensagemId` e `UsuarioId`, com `VisualizadaEm`. Deve permitir
calcular entregue/lido por participante sem alterar a mensagem.

## Anexo

| Campo | Regra |
|---|---|
| `AnexoId` | Identificador de dominio |
| `GridFsFileId` | Referencia ao arquivo no MongoDB |
| `NomeArquivo`, `ContentType`, `TamanhoBytes`, `Hash` | Metadados |
| `EntidadeOrigem`, `EntidadeId` | Solicitacao, mensagem ou tarefa |
| `VersaoAnteriorId` | Substituicao opcional |
| `CriadoPor`, `CriadoEm`, `RemovidoPor`, `RemovidoEm` | Auditoria |

Limite: 25 MB por arquivo. Multiplos anexos sao permitidos. Download exige
participacao ativa ou acesso historico autorizado.

## Tarefa

| Campo | Regra |
|---|---|
| `TarefaId`, `SolicitacaoId` | Identificacao |
| `Titulo`, `DescricaoMarkdown`, `Prazo` | Conteudo |
| `OwnerUsuarioId` | Criador e responsavel imutavel |
| `StatusId` | Pendente, EmProgresso ou Concluida |
| `CriadoEm`, `AlteradoEm`, `ConcluidoEm` | UTC |
| `RemovidoEm`, `RemovidoPor` | Soft-delete |
| `RowVersion` | Concorrencia |

## PassoTarefa

| Campo | Regra |
|---|---|
| `PassoTarefaId`, `TarefaId` | Identificacao |
| `Descricao`, `Ordem` | Conteudo estruturado |
| `Concluido` | Estado |
| `CriadoPor`, `CriadoEm`, `ConcluidoPor`, `ConcluidoEm` | Auditoria |
| `RemovidoEm`, `RemovidoPor` | Soft-delete |

Primeiro passo concluido inicia tarefa Pendente. Todos concluidos concluem tarefa.
Reabertura da tarefa deve desmarcar ao menos um passo ou exigir escolha explicita.

## LinkEstudo

URL, texto Markdown, preview sanitizado, `TarefaId` opcional, autor, datas,
soft-delete e token de concorrencia.

## EventoAuditoria

Registro imutavel com entidade, ID, acao, ator, timestamp, valores anteriores/novos
e correlacao da requisicao. Dados sensiveis e conteudo binario nao devem ser gravados.
