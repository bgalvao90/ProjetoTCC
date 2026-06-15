# Plano Tecnico: Tarefas em Solicitacoes de Mentoria

**Feature**: `001-tarefas-solicitacao`  
**Data**: 2026-06-14  
**Spec**: `specs/001-tarefas-solicitacao/spec.md`  
**Contrato backend observado**: `changes.md`  
**Status**: implementacao parcial validada; plano pronto para fechamento de producao

## Resumo

Entregar o gerenciamento de tarefas dentro de `SolicitacaoDetalheScreen`, permitindo
listar, criar, editar e avancar status de tarefas por participantes da solicitacao.
A implementacao deve seguir o contrato real documentado pelo backend e tratar como
gates de producao as divergencias ainda nao resolvidas de paginacao, concorrencia,
SignalR, midia e testes.

O frontend ja possui a foundation e a integracao principal. O trabalho restante deve
priorizar confirmacao contratual, observabilidade, testes automatizados e validacao
end-to-end antes de habilitar realtime ou retry de concorrencia.

## Estado Atual

### Implementado e validado

- Tipos centralizados de tarefa em `src/types.ts`.
- CRUD HTTP em `src/services/tarefaService.ts`.
- Validacao de titulo, descricao e transicao linear.
- Componentes de card, formulario, status e responsavel.
- Responsavel imutavel durante edicao.
- Permissao local para aluno/professor participantes.
- Tarefas somente leitura em solicitacao finalizada/recusada e quando concluidas.
- Aba de tarefas integrada aos detalhes da solicitacao.
- Loading, erro e empty state basicos.
- Type-check estrito e bundle Android aprovados.

### Pendente para producao

- Confirmar e documentar HTTP 409 e formato de `RowVersion`.
- Confirmar eventos, grupos e autenticacao SignalR.
- Paginacao removida do MVP inicial; reavaliar quando existir contrato backend.
- Midia removida do formulario do MVP; integrar upload/preview antes de reativar.
- Adicionar infraestrutura de testes, lint e coverage mediante aprovacao de governanca.
- Validar Android e iOS contra backend de staging.
- Resolver suporte web ou remover o script/plataforma web.

## Contexto Tecnico

**Linguagem/versao**: TypeScript `~5.9.2`, modo `strict`  
**Framework**: React `19.1.0`, React Native `0.81.5`, Expo `~54.0.33`  
**Roteamento**: Expo Router `~6.0.23`  
**HTTP/autenticacao**: Axios `^1.15.1` com JWT via interceptor  
**Persistencia cliente**: AsyncStorage apenas para sessao; sem cache de tarefas no MVP  
**Target**: Android e iOS; web atualmente bloqueada por dependencia ausente  
**Testes atuais**: inexistentes no frontend; type-check e bundle Android disponiveis  
**Performance**: lista de ate 100 tarefas sem travamentos perceptiveis; alvo de 60 fps  
**Restricoes**: nao alterar arquivos intocaveis nem instalar dependencias sem governanca  
**Escala MVP**: uma solicitacao, dois participantes e lista simples de tarefas

## Contrato Real Prioritario

Enquanto a API nao for alterada e validada, o frontend deve usar:

- IDs numericos para solicitacoes, usuarios e tarefas.
- `GET /solicitacoes/{solicitacaoId}/tarefas` retornando `TarefaDto[]`, sem paginacao.
- `POST /solicitacoes/{solicitacaoId}/tarefas` com `CriarTarefaRequest`.
- `PUT /solicitacoes/{solicitacaoId}/tarefas/{tarefaId}` para edicao.
- `PUT /solicitacoes/{solicitacaoId}/tarefas/{tarefaId}/status` com inteiro no body.
- Um unico `MidiaId` opcional.
- Eventos documentados `NovaTarefa` e `TarefaAtualizada` no hub `/hubs/projetotcc`.

`PATCH`, `TarefaStatusAlterado`, auditoria detalhada no DTO e `RowVersion` nao podem
ser implementados como contrato confirmado ate validacao do backend. Paginacao fica
fora do MVP inicial.

## Constitution Check

| Regra | Estado | Evidencia/acao |
|---|---|---|
| Typed-first | PASS | Contratos em `src/types.ts`; `npx tsc --noEmit` aprovado |
| Separation of concerns | PASS | Components, screens, services, hooks e utils separados |
| Composition over inheritance | PASS | Componentes-base reutilizados |
| Error handling first | PASS parcial | Screens usam `try/catch` e `getErrorMessage`; adicionar feedback de sucesso |
| No breaking changes to core | PASS | Nenhum arquivo intocavel alterado |
| Named exports | PASS | Novos modulos usam named exports |
| Theme como fonte de estilos | PASS parcial | Novos arquivos usam `theme`; revisar componentes-base antigos |
| Testado Android + iOS | FAIL gate | Android bundle aprovado; iOS e dispositivos ainda pendentes |

**Gate pre-producao**: nenhum deploy antes de resolver os itens FAIL e os contratos
marcados como bloqueados.

## Estrutura e Arquivos Afetados

### Documentacao da feature

```text
specs/001-tarefas-solicitacao/
|-- spec.md
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- tasks.md
|-- contracts/
|   `-- tarefas-api.md
`-- checklists/requirements.md

.specify/plans/001-tarefas-solicitacao/
|-- plan.md       # legado; nao usar como fonte primaria apos este plano
`-- tasks.md      # ponte para o checklist canonico
```

### Codigo diretamente afetado

```text
src/
|-- types.ts
|-- api/client.ts
|-- services/
|   |-- tarefaService.ts
|   |-- solicitacaoService.ts
|   `-- midiaService.ts
|-- hooks/useTarefas.ts
|-- utils/
|   |-- tarefa.ts
|   `-- validation.ts
|-- components/
|   |-- StatusBadge.tsx
|   |-- StatusSelector.tsx
|   |-- ResponsavelSelect.tsx
|   |-- TarefaCard.tsx
|   `-- TarefaForm.tsx
`-- screens/
    |-- TarefasScreen.tsx
    `-- SolicitacaoDetalheScreen.tsx

app/
|-- solicitacoes/[id].tsx
`-- chat/[id].tsx
```

### Arquivos intocaveis que condicionam o plano

```text
App.tsx
app.json
index.ts
package.json
tsconfig.json
src/contexts/AuthContext.tsx
```

## Design da Solucao

### Fluxo de leitura

1. `SolicitacaoDetalheScreen` carrega a solicitacao e resolve os participantes.
2. A aba Tarefas renderiza `TarefasScreen`.
3. `TarefasScreen` valida participacao antes de habilitar `useTarefas`.
4. `useTarefas` chama `tarefaService.listar`.
5. A tela renderiza loading, erro, vazio ou `TarefaCard`.

### Fluxo de escrita

1. `TarefaForm` valida titulo, descricao, responsavel e modo somente leitura.
2. `TarefasScreen` orquestra criacao/edicao e trata erros com `Alert.alert`.
3. `tarefaService` repete validacoes puras e envia o contrato real.
4. `useTarefas` atualiza a tarefa retornada no estado local.
5. Em erro, a lista local nao e alterada.

### Status

- Transicao permitida: `Pendente -> EmProgresso -> Concluida`.
- Toda mudanca exige confirmacao.
- Tarefa concluida nao pode ser editada.
- Solicitacao finalizada ou recusada bloqueia todas as escritas.
- O backend continua sendo a autoridade final de permissao e transicao.

### Responsavel

- Pode ser aluno, professor ou vazio na criacao.
- Fica desabilitado durante edicao.
- Se o ID nao corresponder aos participantes atuais, a UI exibe "Sem atribuicao".
- Para preservar nome historico, o backend deve futuramente expor snapshot de nome.

### Midia

- Contrato atual suporta um `MidiaId`.
- Antes de producao, substituir entrada manual por upload via `midiaService.upload`.
- Exibir nome/tipo/preview apenas quando o contrato `MidiaDto` estiver disponivel.
- Falha entre MongoDB e PostgreSQL exige compensacao ou rotina de limpeza no backend.

## Fases de Fechamento

### Fase A - Contratos bloqueadores

1. Validar API real em staging para todos os endpoints.
2. Confirmar se conflito retorna HTTP 409 e qual dado permite retry.
3. Confirmar SignalR: cliente permitido, autenticacao JWT, join de grupo e eventos.
4. Manter paginacao fora do MVP ate existir contrato backend.
5. Registrar decisoes em `contracts/tarefas-api.md`.

### Fase B - Hardening frontend

1. Manter midia indisponivel no formulario ate integrar upload sem entrada manual.
2. Adicionar mensagens de sucesso e conflito.
3. Impedir submits duplicados e manter botoes ocupados.
4. Ordenar tarefas de forma deterministica.
5. Recarregar lista ao retornar para a aba e apos reconexao futura.
6. Melhorar acessibilidade, labels e alvos de toque.

### Fase C - Realtime e concorrencia

Executar somente apos Fase A:

1. Aprovar alteracao de `package.json` para cliente SignalR.
2. Implementar listeners somente para eventos confirmados.
3. Recarregar lista apos reconexao; nao fazer merge silencioso durante edicao.
4. Implementar dialog de conflito e retry limitado somente com `RowVersion` exposta.
5. Registrar telemetria de reconexao e conflitos.

### Fase D - Qualidade e release

1. Aprovar infraestrutura de testes sem violar governanca.
2. Cobrir utils, service, hook, componentes e fluxos de permissao.
3. Executar testes de integracao contra staging.
4. Validar bundle Android e iOS.
5. Executar smoke test em dois usuarios simultaneos.
6. Liberar por feature flag ou rollout controlado, se disponivel.

## Riscos Adicionais e Mitigacoes

| Risco | Severidade | Mitigacao |
|---|---|---|
| Spec e backend possuem contratos incompatíveis | Critica | Contrato real versionado e teste de staging antes de implementar itens avancados |
| `RowVersion` existe no banco mas nao no DTO | Alta | Bloquear retry/409 no cliente ate exposicao contratual |
| SignalR nao instalado e `package.json` intocavel | Alta | Decisao formal de governanca antes da dependencia |
| Sem testes/lint/coverage frontend | Alta | Aprovar toolchain e criar quality gate em CI |
| Script web sem `react-native-web` | Media | Instalar com aprovacao ou remover web do escopo/configuracao |
| Nome de responsavel orfao nao preservado | Media | Backend expor snapshot; fallback atual "Sem atribuicao" |
| `MidiaId` manual causa UX ruim e IDs invalidos | Alta | Integrar upload e validacao antes do release |
| Postgres e MongoDB sem transacao comum | Alta | Compensacao/retry e monitoramento backend |
| Lista simples pode degradar com muitas tarefas | Media | Definir limite MVP e implementar paginacao contratual |
| Spec Kit dividido em dois diretorios | Media | Tornar `specs/001...` canonico e regenerar tasks a partir dele |
| Permissao local depende de IDs presentes na solicitacao | Media | Backend como autoridade; testar respostas incompletas |
| Falta de feedback de sucesso | Baixa | Adicionar feedback acessivel apos operacoes |

## Gates de Producao

- [ ] Contrato real de API aprovado e versionado.
- [ ] Nenhuma divergencia aberta entre spec e backend para o escopo liberado.
- [x] Upload de midia integrado ou removido explicitamente do MVP.
- [ ] Estrategia de SignalR decidida; polling/manual refresh documentado como fallback.
- [ ] Estrategia de concorrencia decidida; sem retry cego.
- [ ] Testes automatizados essenciais passando.
- [ ] Type-check, bundle Android e bundle iOS passando.
- [ ] Smoke test com aluno e professor em staging.
- [ ] Erros 400, 401, 403, 404, 409 e 500 verificados.
- [ ] Sem logs sensiveis, tokens ou IDs de midia expostos indevidamente.

## Validacao Pos-Design da Constitution

O desenho continua aderente a typed-first, separacao de responsabilidades,
composicao, tratamento de erros e preservacao dos arquivos core. As unicas excecoes
potenciais sao instalar SignalR e infraestrutura de testes; ambas exigem aprovacao
formal porque alteram `package.json`, atualmente intocavel.

## Definicao de Pronto

A feature esta pronta para producao quando os gates acima estiverem concluídos, os
cenarios de `quickstart.md` passarem em staging e o checklist de tarefas refletir
somente contratos efetivamente implementados.
