# Implementation Plan: Chat de Orientacao

**Feature**: `002-chat-orientacao` | **Date**: 2026-06-15 | **Spec**: [spec.md](spec.md)

## Summary

Evoluir solicitacoes para orientacoes colaborativas com uma tela unica de conversa,
linha do tempo tipada, multiplos alunos, anexos GridFS, tarefas com passos, links,
status controlado pelo professor, SignalR, push e auditoria.

## Technical Context

**Frontend**: React Native 0.81.5, Expo 54, React 19.1, TypeScript strict, Axios  
**Backend conhecido**: .NET, PostgreSQL, MongoDB e SignalR, em repositorio externo  
**Storage**: PostgreSQL para dominio/auditoria; MongoDB GridFS para binarios  
**Testing**: infraestrutura frontend pendente; testes .NET e integracao obrigatorios  
**Targets**: Android, iOS e Web  
**Constraints**: arquivos de ate 25 MB; somente professor gerencia status/participantes; encerradas sao read-only  
**Scale inicial**: um professor, multiplos alunos e timeline paginada por cursor

## Constitution Check

| Regra | Estado | Acao |
|---|---|---|
| Tipos em `src/types.ts` antes da logica | PASS planejado | Primeira fase frontend |
| Services propagam erros; screens tratam async | PASS planejado | Manter separacao |
| Componentes apresentacionais | PASS planejado | Extrair cards/composer |
| Named exports e TypeScript strict | PASS planejado | Obrigatorio |
| `theme.*` para estilos | PASS planejado | Redesenho usa tema |
| Arquivos core e `package.json` intocaveis | BLOCKED | Dependencias novas exigem aprovacao formal |
| Validacao Android e iOS | PENDING | Gate de release |

## Architecture

### Backend

1. Evoluir `Solicitacao` para colecao de participantes sem remover historico.
2. Introduzir timeline tipada e auditoria transacional no PostgreSQL.
3. Migrar arquivos para GridFS com upload streaming e metadados autorizados.
4. Evoluir tarefas para owner imutavel, passos estruturados, soft-delete e reabertura.
5. Publicar eventos SignalR apos persistencia e integrar push idempotente.

### Frontend

1. Centralizar novos contratos em `src/types.ts`.
2. Criar services para timeline, participantes, anexos, links e realtime.
3. Substituir `SolicitacaoDetalheScreen` por orquestrador da conversa.
4. Reutilizar componentes-base e criar componentes apresentacionais para itens tipados.
5. Manter tela somente leitura conforme status e permissao.

### Visual aprovado

- Cabecalho com titulo, participantes, status e menu de tres pontos.
- Timeline cronologica com mensagens, anexos, tarefas, links e eventos.
- Composer inferior com Markdown, anexo, tarefa e link.
- Cards de tarefa no historico e painel flutuante de tarefas ativas.
- Sem abas separadas de detalhes, tarefas e chat.

## Project Structure

```text
specs/002-chat-orientacao/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
|-- contracts/chat-orientacao-api.md
`-- checklists/requirements.md

src/
|-- types.ts
|-- services/
|   |-- orientacaoService.ts
|   |-- timelineService.ts
|   |-- anexoService.ts
|   |-- linkEstudoService.ts
|   `-- realtimeService.ts
|-- hooks/
|   |-- useTimeline.ts
|   `-- useOrientacaoRealtime.ts
|-- components/
|   |-- OrientacaoHeader.tsx
|   |-- TimelineItem.tsx
|   |-- MessageComposer.tsx
|   |-- TarefaTimelineCard.tsx
|   `-- TarefasAtivasPanel.tsx
`-- screens/
    |-- CriarSolicitacaoScreen.tsx
    `-- SolicitacaoDetalheScreen.tsx
```

## Delivery Phases

1. **Contratos e governanca**: obter API, aprovar dependencias e validar migracao.
2. **Dominio backend**: participantes, status, timeline, auditoria e concorrencia.
3. **Arquivos**: GridFS, streaming, formatos, download e substituicao.
4. **Chat realtime**: mensagens, leitura, edicao/remocao, SignalR e push.
5. **Tarefas e links**: passos, automacoes, painel e previews seguros.
6. **Redesenho frontend**: tela unica responsiva e somente leitura.
7. **Qualidade/release**: testes, seguranca, acessibilidade e smoke multiplataforma.

## Migration Strategy

- Preservar solicitacoes, mensagens, tarefas e midias existentes.
- Criar participante aluno a partir de `AlunoUsuarioId` atual.
- Criar owner de tarefa a partir do melhor dado auditavel disponivel; casos sem autor
  confirmado devem ser registrados como pendencia de migracao.
- Adaptar mensagens existentes para tipo Texto ou Arquivo.
- Manter endpoints antigos temporariamente apenas se necessario para rollout.

## Gates

- [ ] Repositorio backend disponivel e contrato real revisado.
- [ ] Aprovacao formal para alterar `package.json`.
- [ ] Estrategia de migracao testada com backup.
- [ ] Upload/download GridFS e autorizacao validados.
- [ ] SignalR, reconexao e push validados com dois usuarios.
- [ ] Protecao de Markdown, upload e preview de links validada.
- [ ] Type-check, testes e smoke Android/iOS/Web passando.

## Risks

| Risco | Mitigacao |
|---|---|
| Escopo amplo e acoplado | Entrega incremental por fases e contratos versionados |
| Migracao de aluno unico para participantes | Migration reversivel e testes com dados reais anonimizados |
| PostgreSQL e GridFS sem transacao comum | Estado de upload, compensacao e limpeza |
| SSRF em previews | Allowlist de esquemas e bloqueio de redes privadas |
| Conteudo ativo em Markdown/arquivos | Sanitizacao, validacao por assinatura e download seguro |
| Push duplicado ou sensivel | Idempotencia e payload minimo |
