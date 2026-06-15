# Research: Chat de Orientacao

## Decisoes aprovadas

| Tema | Decisao |
|---|---|
| Experiencia | Tela unica de conversa substitui detalhes, tarefas e chat separados |
| Tarefas | Cards no historico e painel flutuante de tarefas ativas |
| Passos | Estruturados no banco; Markdown permanece na descricao |
| Owner | Criador e owner/responsavel imutavel |
| Mensagens | Edicao e remocao pelo autor por 15 minutos |
| Exclusao | Soft-delete com auditoria |
| Arquivos | Multiplos, ate 25 MB cada, armazenados em MongoDB GridFS |
| ZIP | Permitido, sujeito a validacao de seguranca |
| Links | Markdown, preview seguro e tarefa opcional |
| Participantes | Um professor e multiplos alunos com permissoes equivalentes |
| Gestao | Apenas professor altera status e participantes |
| Notificacoes | SignalR interno e push |

## Decisoes tecnicas

### Linha do tempo tipada

Mensagens, tarefas, links e eventos do sistema devem possuir tipos explicitos. Uma
linha do tempo tipada evita inferir comportamento a partir de texto e permite
autorizacao, renderizacao e auditoria consistentes.

### Arquivos

O contrato principal deve usar upload multipart ou streaming. Base64 aumenta o
tamanho e nao e adequado ao limite aprovado. GridFS evita o limite de documento do
MongoDB e suporta arquivos maiores que documentos comuns.

### Markdown

Markdown deve ser armazenado como fonte e renderizado com sanitizacao. Imagens
remotas, HTML arbitrario e esquemas de URL inseguros devem ser bloqueados.

### Preview de links

Preview e uma operacao server-side sujeita a SSRF. Deve aceitar apenas HTTP/HTTPS
publicos, bloquear redes privadas/loopback, limitar redirects, tamanho e tempo.

### Auditoria e exclusao

Soft-delete preserva rastreabilidade, mas download e conteudo removido devem deixar
de ser expostos aos participantes comuns. Auditoria detalhada permanece restrita.

### Concorrencia

Tarefas, passos, participantes e status precisam de token de concorrencia exposto
no contrato. Conflitos devem retornar HTTP 409 e exigir recarregamento consciente.

## Divergencias com 001-tarefas-solicitacao

- Tarefas deixam de ser uma aba e passam a integrar o chat.
- Owner/responsavel passa a ser o criador imutavel.
- Tarefas podem ser removidas logicamente e reabertas.
- Tarefas concluidas nao podem ser editadas antes de reabrir.
- Passos estruturados passam a controlar status automaticamente.
- Midia passa de um `MidiaId` para multiplos anexos.
- Solicitacao passa de um aluno para multiplos alunos.

## Bloqueios conhecidos

- O repositorio da API nao esta neste workspace.
- Contratos atuais nao suportam a maior parte do escopo novo.
- `package.json` e intocavel pela constituicao sem autorizacao formal.
- Nao ha infraestrutura de testes frontend configurada.
- Push notifications e politica de retencao precisam de contrato operacional.
