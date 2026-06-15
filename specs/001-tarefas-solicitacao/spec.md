# Especificação Técnica: Sistema de Tarefas em Solicitações de Mentoria

## Feature Overview

### Descrição

O sistema de tarefas permite criar, visualizar, editar e gerenciar atividades vinculadas a uma solicitação de mentoria. As tarefas são criadas por alunos ou professores, possuem um responsável imutável, ciclo de vida de status linear e integram-se com o sistema de mídia e notificações em tempo real via SignalR.

### Objetivo

Facilitar o acompanhamento estruturado de atividades dentro de uma solicitação, proporcionando colaboração clara entre aluno e professor com histórico completo de auditoria.

### Públicos

- **Aluno**: Cria, visualiza, edita tarefas, altera status próprio ou de terceiros
- **Professor**: Cria, visualiza, edita tarefas, altera status próprio ou de terceiros
- **Sistema**: Valida, persiste, propaga mudanças em tempo real, registra auditoria

### Restrições

- Tab/Seção dentro de `SolicitacaoDetalheScreen`
- Sem endpoint DELETE de tarefas (persistência permanente)
- Solicitações finalizadas/recusadas: tarefas somente leitura
- Responsável imutável após criação

---

## Data & Domain

### Enumerações

#### TarefaStatus

| Id  | Nome        | Descrição                               |
| --- | ----------- | --------------------------------------- |
| 1   | Pendente    | Tarefa criada, aguardando início        |
| 2   | EmProgresso | Tarefa em execução                      |
| 3   | Concluida   | Tarefa finalizada com data de conclusão |

**Regra de Transição**: Pendente → EmProgresso → Concluida (linear, sem reversão)

### Data Transfer Objects (DTOs)

#### TarefaDto (Leitura)

```typescript
{
  id: string;                        // UUID
  solicitacaoId: string;             // FK referência
  titulo: string;                    // max 180 chars
  descricao: string;                 // max 4000 chars, markdown
  status: TarefaStatus;              // enum 1-3
  responsavelUsuarioId: string | null;  // null = sem atribuição
  responsavelNome: string | null;    // snapshot do nome
  midia: MidiaDto[];                 // array, pode estar vazio
  criadoEm: ISO8601;                 // UTC
  criadoPorUsuarioId: string;        // FK
  criadoPorNome: string;             // snapshot
  alteradoEm: ISO8601;               // UTC
  alteradoPorUsuarioId: string;      // FK do último
  alteradoPorNome: string;           // snapshot
  dataConclusao: ISO8601 | null;     // set quando status = Concluida
  rowVersion: number;                // otimistic concurrency
}
```

#### CriarTarefaRequest (POST)

```typescript
{
  titulo: string;                    // required, 1-180 chars
  descricao: string;                 // optional, 0-4000 chars
  responsavelUsuarioId: string | null;  // optional, FK validado
  midia: MidiaCreateRequest[];       // optional
}
```

#### AtualizarTarefaRequest (PUT)

```typescript
{
  titulo: string;                    // 1-180 chars
  descricao: string;                 // 0-4000 chars
  midia: MidiaCreateRequest[];       // replaces existing
  rowVersion: number;                // concurrency control
}
```

#### AlterarStatusTarefaRequest (PATCH)

```typescript
{
  novoStatus: TarefaStatus; // 1, 2 ou 3
  rowVersion: number; // concurrency control
}
```

#### ListarTarefasRequest (GET params)

```typescript
{
  solicitacaoId: string; // required
  pagina: number; // default 1
  tamanhoPagina: number; // default 20, max 100
  ordenarPor: "data" | "status"; // default "data"
}
```

#### TarefasPagedResponse

```typescript
{
  tarefas: TarefaDto[];
  totalRegistros: number;
  paginaAtual: number;
  totalPaginas: number;
}
```

### Relacionamentos

#### Tarefa ↔ Solicitacao

- **N:1**: Múltiplas tarefas por solicitação
- **Integridade**: DELETE em Solicitacao deve cascade (soft-delete tarefas ou bloquear)
- **Status Solicitacao afeta Tarefas**:
  - Finalizada/Recusada → todas as tarefas read-only
  - Ativa → tarefas editáveis normalmente

#### Tarefa → Usuario (Responsável)

- **Cardinality**: N:1 com nullable
- **Imutabilidade**: Responsável não muda após criação
- **Órfão**: Se usuário sair da solicitação (remover participante), `responsavelUsuarioId` fica null
  - UI exibe "Sem atribuição" ou badge "Responsável indisponível"

#### Tarefa → Midia

- **Cardinality**: N:M via MidiaDto[]
- **Validação**: Todos os `midiaId` devem existir e pertencer ao usuario criador
- **Exclusão**: Não cascata (mídia permanece órfã se tarefa deletada, mas tarefa não deleta)

#### Tarefa → Usuario (Auditoria)

- **criadoPor**: Imutável, registrado na criação
- **alteradoPor**: Atualizado a cada modificação (status, edição)

---

## Requisitos em EARS

### Criar Tarefa

**REQ-001: Criar tarefa com dados obrigatórios**

```
GIVEN: Usuário (aluno ou professor) está visualizando SolicitacaoDetalheScreen
   AND: Solicitação está com status Ativa
   AND: Usuário é participante da solicitação
WHEN: Usuário clica em "Nova Tarefa"
   AND: Preenche título (1-180 chars) e deixa descrição em branco
   AND: Deixa responsável vazio
   AND: Clica em salvar
THEN: Sistema cria tarefa com:
   - titulo preenchido
   - descricao = string vazia
   - responsavelUsuarioId = null
   - status = Pendente
   - criadoPor = usuário atual
   - criadoEm = timestamp UTC agora
   - rowVersion = 1
THEN: Tarefa aparece na lista de tarefas da solicitação
THEN: Usuário recebe notificação de sucesso
```

**REQ-002: Criar tarefa com todos os campos**

```
GIVEN: Usuário (aluno ou professor) está no formulário de nova tarefa
   AND: Um colega usuário existe na solicitação
WHEN: Usuário preenche:
   - titulo = "Preparar slides"
   - descricao = "## Conteúdo\n- Intro\n- Corpo\n- Conclusão"
   - responsavelUsuarioId = UUID do colega
   AND: Clica em salvar
THEN: Sistema cria tarefa com status = Pendente
THEN: responsavelNome é preenchido com snapshot do nome
THEN: Tarefa aparece ordenada por data de criação
THEN: SignalR notifica todos os participantes em tempo real
THEN: Colega responsável recebe push notification "Você foi atribuído a..."
```

**REQ-003: Criar tarefa com mídia**

```
GIVEN: Usuário está criando tarefa
   AND: Possui acesso a midiaService
WHEN: Usuário faz upload de arquivo e clica em salvar
   AND: midiaId é válido e pertence ao usuário criador
THEN: Sistema valida que midiaId existe via midiaService
THEN: Tarefa é criada com midia array contendo o arquivo
THEN: Arquivo é exibido na tarefa com preview apropriado
```

**REQ-004: Validar limite de caracteres ao criar**

```
GIVEN: Usuário está preenchendo formulário de tarefa
WHEN: Usuário tenta inserir titulo com 181 caracteres
THEN: Sistema valida e rejeita com erro "Título máximo 180 caracteres"
THEN: Campo recebe visual de erro

WHEN: Usuário tenta inserir descricao com 4001 caracteres
THEN: Sistema valida e rejeita com erro "Descrição máxima 4000 caracteres"
THEN: Campo recebe visual de erro
```

**REQ-005: Impedir criação em solicitação finalizada**

```
GIVEN: Solicitação tem status = Finalizada
   AND: Usuário tenta criar tarefa
WHEN: Usuário clica em "Nova Tarefa"
THEN: Botão fica desabilitado
THEN: Toast exibe mensagem "Solicitação finalizada - não é possível criar tarefas"
```

---

### Listar Tarefas

**REQ-006: Listar tarefas com paginação padrão**

```
GIVEN: Usuário visualiza SolicitacaoDetalheScreen
   AND: Solicitação possui 45 tarefas
WHEN: Aba/Seção de tarefas é exibida
THEN: Sistema carrega primeira página com 20 tarefas (padrão)
THEN: Tarefas são ordenadas por data de criação (crescente)
THEN: Total de páginas exibido = 3
THEN: Loader desaparece quando dados chegam
```

**REQ-007: Paginar tarefas manualmente**

```
GIVEN: Primeira página com 20 tarefas está exibida
   AND: Total de páginas = 5
WHEN: Usuário clica em "Próxima Página" ou botão de página 2
THEN: Sistema faz request com pagina=2, tamanhoPagina=20
THEN: Segunda página com tarefas 21-40 é exibida
THEN: Botão "Anterior" fica habilitado
THEN: Botão "Próxima" continua habilitado
```

**REQ-008: Listar tarefas vazia**

```
GIVEN: Solicitação foi criada mas sem tarefas
WHEN: Aba de tarefas é visualizada
THEN: EmptyState exibido: "Nenhuma tarefa criada"
THEN: Botão "Criar primeira tarefa" está disponível
THEN: Nenhum loader é mostrado
```

**REQ-009: Ordenação por status**

```
GIVEN: Solicitação possui tarefas com status misto
WHEN: Usuário clica em "Ordenar por Status"
THEN: Sistema reordena tarefas: Pendente, EmProgresso, Concluida
THEN: Dentro de cada grupo, ordenação por data se mantém
```

---

### Alterar Status de Tarefa

**REQ-010: Avançar status de Pendente para EmProgresso**

```
GIVEN: Tarefa com status = Pendente
   AND: Usuário é participante da solicitação
   AND: Solicitação está Ativa
WHEN: Usuário clica em tarefa
   AND: Seleciona status "Em Progresso"
   AND: Confirma alteração
THEN: Sistema valida transição (Pendente → EmProgresso é válida)
THEN: PATCH é enviado para backend com novoStatus=2
THEN: Tarefa atualiza para status = EmProgresso
THEN: alteradoEm = timestamp UTC agora
THEN: alteradoPor = usuário atual
THEN: SignalR notifica participantes da mudança em tempo real
THEN: Toast mostra "Status alterado com sucesso"
```

**REQ-011: Avançar para Concluída com timestamp**

```
GIVEN: Tarefa com status = EmProgresso
   AND: rowVersion = 5 (no cliente)
WHEN: Usuário altera para status = Concluida
THEN: Sistema registra dataConclusao = timestamp UTC agora
THEN: rowVersion é incrementado para 6
THEN: Tarefa exibe badge "Concluída em [data]"
THEN: TarefaDto.dataConclusao contém a data
THEN: Interface sugere tarefa como read-only (visual)
```

**REQ-012: Impedir reversão de status**

```
GIVEN: Tarefa com status = Concluida
WHEN: Usuário tenta clicar em "Retornar para EmProgresso"
THEN: Opção não aparece no dropdown/menu
THEN: Apenas status atual é exibido (read-only)
```

**REQ-013: Impedir alteração em solicitação finalizada**

```
GIVEN: Solicitação com status = Finalizada
   AND: Tarefa com status = Pendente
WHEN: Usuário tenta alterar tarefa
THEN: Todos os inputs ficam disabled
THEN: Botão "Salvar" é ocultado ou desabilitado
THEN: Toast exibe "Solicitação finalizada - edição não permitida"
```

**REQ-014: Permitir alteração de status por qualquer participante**

```
GIVEN: Aluno criou tarefa
   AND: Professor é participante
WHEN: Professor altera status da tarefa
THEN: Operação é permitida
THEN: alteradoPor = professor
THEN: SignalR notifica aluno da mudança

GIVEN: Professor criou tarefa
   AND: Aluno é participante
WHEN: Aluno altera status
THEN: Operação é permitida
THEN: Sistema valida permissão = participante
```

---

### Editar Tarefa

**REQ-015: Editar título e descrição**

```
GIVEN: Tarefa existente com status = Pendente
   AND: Usuário é participante da solicitação
WHEN: Usuário abre tarefa para editar
   AND: Altera titulo = "Novo título"
   AND: Altera descricao = "# Descrição markdown\n- item"
   AND: Clica em "Salvar"
THEN: Sistema valida novos valores (180 chars, 4000 chars)
THEN: PUT é enviado com rowVersion atual
THEN: Tarefa é atualizada com novos valores
THEN: alteradoEm = timestamp UTC agora
THEN: alteradoPor = usuário que editou
THEN: SignalR notifica mudança aos participantes
```

**REQ-016: Responsável não pode ser alterado**

```
GIVEN: Tarefa com responsavelUsuarioId = UUID-Professor
WHEN: Usuário tenta editar responsável
THEN: Campo responsável aparece disabled/read-only
THEN: Nenhuma alteração é permitida
```

**REQ-017: Editar mídia da tarefa**

```
GIVEN: Tarefa com 1 arquivo anexado
WHEN: Usuário remove o arquivo e faz upload de novo
THEN: Sistema atualiza midia array com novo arquivo
THEN: Validação: novo midiaId deve existir
THEN: Arquivos antigos referenciados não são deletados
THEN: Tarefa registra mudança em alteradoEm/alteradoPor
```

**REQ-018: Impedir edição em tarefa concluída**

```
GIVEN: Tarefa com status = Concluida
WHEN: Usuário tenta editar titulo ou descricao
THEN: Campos aparecem disabled
THEN: Nenhuma alteração é processada
THEN: UI exibe aviso "Tarefa concluída não pode ser editada"
```

---

### Validações de Concorrência

**REQ-019: Detectar conflito de rowVersion**

```
GIVEN: Usuário A carregou tarefa com rowVersion = 5
   AND: Usuário B alterou a mesma tarefa (rowVersion agora = 6)
WHEN: Usuário A tenta salvar com rowVersion = 5
THEN: Backend retorna erro HTTP 409 Conflict com mensagem
   "Tarefa foi modificada por outro usuário"
THEN: Cliente recarrega tarefa do servidor
THEN: UI exibe dialog: "Conflito de edição - tarefa foi alterada por [nome]. Deseja recarregar?"
THEN: Opções: "Recarregar" ou "Manter minha versão"
```

**REQ-020: Retry automático em conflito**

```
GIVEN: Usuário clicou em "Recarregar" após conflito
WHEN: Tarefa é recarregada (nova rowVersion = 6)
   AND: Usuário refaz a edição
   AND: Envia novamente com rowVersion = 6
THEN: Operação é bem-sucedida
THEN: Tarefa é atualizada com rowVersion = 7
THEN: Toast mostra "Tarefa atualizada com sucesso"
```

---

### Permissões

**REQ-021: Apenas participantes podem criar tarefas**

```
GIVEN: Usuário NÃO é participante da solicitação
WHEN: Tenta acessar formulário de criar tarefa
THEN: Sistema bloqueia acesso
THEN: ExceptionHandler trata erro como 403 Forbidden
THEN: UI exibe "Você não tem permissão para criar tarefas"
```

**REQ-022: Participantes podem editar qualquer tarefa (mesmo criada por outro)**

```
GIVEN: Aluno criou tarefa
   AND: Professor é participante
WHEN: Professor abre tarefa para editar
THEN: Campos são editáveis (exceto responsável)
THEN: Permissão é validada como: usuário é participante

GIVEN: Professor criou tarefa
   AND: Aluno é participante
WHEN: Aluno edita tarefa
THEN: Edição é permitida
```

**REQ-023: Participantes podem alterar status de qualquer tarefa**

```
GIVEN: Tarefa criada por um participante
   AND: Outro participante tenta alterar status
WHEN: Envia PATCH para alterar status
THEN: Backend valida: usuário é participante da solicitação
THEN: Transição é executada
THEN: rowVersion é incrementado
```

---

### Edge Cases

**REQ-024: Responsável órfão (participante removido)**

```
GIVEN: Tarefa com responsavelUsuarioId = UUID-Professor-A
   AND: Professor-A é removido da solicitação
WHEN: Responsável já não existe como participante
THEN: responsavelUsuarioId permanece como UUID-Professor-A (FK preservado)
THEN: UI exibe responsavelNome = null
THEN: UI renderiza "Sem atribuição" ou badge especial
THEN: Tarefa permanece editável/normal, apenas responsável não aparece
```

**REQ-025: MidiaId inválido ao criar**

```
GIVEN: Usuário tenta criar tarefa com midia
   AND: midiaId informado NÃO existe na base
WHEN: Clica em salvar
THEN: Backend valida e retorna erro 400 Bad Request
   "Mídia [id] não encontrada"
THEN: Cliente exibe erro no form
THEN: Tarefa não é criada
```

**REQ-026: MidiaId não pertence ao usuário**

```
GIVEN: Usuário A tenta criar tarefa com arquivo de Usuário B
   AND: midiaId existe mas pertence a outro usuário
WHEN: Tenta salvar
THEN: Backend rejeita: "Acesso à mídia negado"
THEN: Tarefa não é criada
THEN: UI mostra erro específico
```

**REQ-027: Paginação limite máximo**

```
GIVEN: Usuário tenta solicitar tamanhoPagina = 500
WHEN: Request é enviado com tamanhoPagina=500
THEN: Backend limita a 100 (máximo configurado)
THEN: Response retorna com 100 registros
THEN: totalPaginas é recalculado
```

**REQ-028: Paginação fora de range**

```
GIVEN: Solicitação tem 2 páginas de tarefas
WHEN: Usuário tenta acessar pagina=5
THEN: Backend retorna array vazio
THEN: totalRegistros, totalPaginas são consistentes
THEN: UI exibe EmptyState ou volta para última página
```

---

### Realtime com SignalR

**REQ-029: Notificação ao criar tarefa**

```
GIVEN: Usuário A cria tarefa em uma solicitação
   AND: Usuários B e C também visualizam a mesma solicitação
WHEN: Tarefa é criada com sucesso
THEN: Backend envia evento SignalR "TarefaCriada" para grupo da solicitação
THEN: Usuários B e C recebem evento em tempo real
THEN: Nova tarefa aparece na lista de B e C sem refresh manual
THEN: Push notification: "Nova tarefa criada: [titulo]"
```

**REQ-030: Notificação ao alterar status**

```
GIVEN: Tarefa com status = Pendente
   AND: Múltiplos usuários visualizam a solicitação
WHEN: Usuário A altera para EmProgresso
THEN: SignalR dispara evento "TarefaStatusAlterado"
THEN: Todos recebem atualização em tempo real
THEN: rowVersion local é sincronizado
THEN: UI atualiza visual do status
THEN: Push notification: "Tarefa [titulo] em progresso"
```

**REQ-031: Reconexão automática ao SignalR**

```
GIVEN: Usuário está visualizando tarefas
   AND: Conexão SignalR cai (rede instável)
WHEN: Reconexão é feita (automática após timeout)
THEN: Cliente tenta reconectar
THEN: Após sucesso, sincroniza estado (recarrega tarefas)
THEN: Usuário não perde dados (fila local)
THEN: Toast informativo: "Sincronizando..."
```

**REQ-032: Atualização concorrente via realtime**

```
GIVEN: Usuário A está editando tarefa localmente (não salva ainda)
   AND: Usuário B altera a mesma tarefa e salva
WHEN: SignalR notifica Usuário A da mudança
THEN: Sistema faz merge inteligente ou avisa conflito
THEN: Oferece opções: "Recarregar" ou "Manter edição local"
```

---

### Auditoria

**REQ-033: Registrar criação de tarefa**

```
GIVEN: Tarefa é criada
WHEN: Operação é bem-sucedida
THEN: Sistema registra log com:
   - TarefaId
   - criadoPorUsuarioId
   - Timestamp UTC
   - Ação: "CRIADA"
   - Dados: titulo, descricao, responsavelUsuarioId
```

**REQ-034: Registrar edição de tarefa**

```
GIVEN: Tarefa é editada
WHEN: PUT é processada
THEN: Log registra:
   - TarefaId
   - alteradoPorUsuarioId
   - Timestamp UTC
   - Ação: "EDITADA"
   - Campos alterados: titulo, descricao, midia
   - Valores anterior/novo para rastreabilidade
```

**REQ-035: Registrar mudança de status**

```
GIVEN: Status é alterado
WHEN: PATCH é processada
THEN: Log registra:
   - TarefaId
   - alteradoPorUsuarioId
   - Timestamp UTC
   - Ação: "STATUS_ALTERADO"
   - statusAnterior → statusNovo
   - Se novo status = Concluida, registra dataConclusao
```

---

### Integração com Solicitação

**REQ-036: Tarefas ficam read-only quando solicitação é finalizada**

```
GIVEN: Solicitação ativa com tarefas
WHEN: Solicitação status = Finalizada
THEN: Todas as tarefas ficam read-only:
   - Botão "Nova Tarefa" disabled
   - Campos de edição disabled
   - Dropdown de status disabled
THEN: UI exibe aviso "Solicitação finalizada"
THEN: Usuários podem visualizar mas não modificar
```

**REQ-037: Tarefas ficam read-only quando solicitação é recusada**

```
GIVEN: Solicitação ativa com tarefas
WHEN: Solicitação status = Recusada
THEN: Mesma restrição que Finalizada (read-only total)
THEN: Tarefas não são deletadas
THEN: Histórico de auditoria permanece intacto
```

**REQ-038: Sincronizar status de solicitação ao carregar tarefas**

```
GIVEN: Cliente carrega tarefas
WHEN: Dados chegam do backend
THEN: Cliente verifica status atual da solicitação
THEN: Se status = Finalizada/Recusada, desabilita edição
THEN: Se status = Ativa, permite edição normal
```

---

### Integração com Chat (Futuro)

**REQ-039: Documentar estrutura de link para tarefas no chat**

```
GIVEN: Futuro: Usuário quer mencionar tarefa em mensagem de chat
WHEN: Sistema suportar #tarefa-[id] ou [Tarefa: titulo]
THEN: Link deve ser estruturado como:
   - Formato: "#task-[TarefaId]"
   - Ao clicar, redireciona para SolicitacaoDetalheScreen com tarefa destacada
   - Respeita permissões (não exibir se não é participante)
NOTA: Implementação em fase posterior
```

---

## Fluxos Críticos (EARS Passo a Passo)

### Fluxo 1: Criar e Atribuir Tarefa

```
GIVEN: Aluno visualiza SolicitacaoDetalheScreen
   AND: Solicitação está Ativa
   AND: Professor participa da solicitação
WHEN: Aluno clica "Nova Tarefa"
THEN: Formulário de criação é exibido
WHEN: Aluno preenche:
   titulo = "Fazer pesquisa"
   descricao = "Pesquisar sobre [tema]"
   responsavelUsuarioId = [UUID-Professor]
THEN: Campos validados localmente (length, format)
WHEN: Aluno clica "Salvar"
THEN: CriarTarefaRequest é enviada para backend
THEN: Backend valida:
   - Usuário é participante
   - Solicitação está Ativa
   - responsavelUsuarioId é válido e é participante
   - titulo/descricao estão em limites
THEN: Tarefa é criada com rowVersion=1, criadoPor=Aluno
THEN: dataConclusao = null (pois status = Pendente)
THEN: Response retorna TarefaDto completo
THEN: Cliente adiciona à lista de tarefas
THEN: SignalR dispara evento
THEN: Professor recebe push: "Você foi atribuído a: Fazer pesquisa"
THEN: Toast ao aluno: "Tarefa criada com sucesso"
```

### Fluxo 2: Alterar Status com Conflito de Concorrência

```
GIVEN: Tarefa com status = Pendente, rowVersion = 3
   AND: Usuário A carregou tarefa
   AND: Usuário B alterou a tarefa (agora rowVersion = 4)
WHEN: Usuário A tenta mudar status para EmProgresso
THEN: Envia PATCH com rowVersion = 3 (desatualizado)
THEN: Backend valida rowVersion e retorna 409 Conflict
   Mensagem: "Tarefa foi modificada. rowVersion esperada: 4, recebida: 3"
THEN: Cliente intercepta erro 409
THEN: Dialog exibido ao usuário A:
   "Esta tarefa foi alterada por [Usuário B]. Deseja recarregar?"
WHEN: Usuário A clica "Recarregar"
THEN: GET para refetch tarefa
THEN: TarefaDto retorna com rowVersion = 4
THEN: Cliente atualiza estado local
THEN: Usuário A tenta novamente mudar status
WHEN: PATCH é enviada com rowVersion = 4
THEN: Backend processa sem conflito
THEN: rowVersion incrementado para 5
THEN: Toast: "Status alterado com sucesso"
THEN: SignalR notifica mudança
```

### Fluxo 3: Edição em Solicitação Finalizada

```
GIVEN: Solicitação é finalizada
   AND: Tarefas existem com status misto
   AND: Usuário tenta editar tarefa
WHEN: Usuário abre tarefa
THEN: GET é enviado
THEN: Backend retorna TarefaDto com indicador de solicitacao.status = Finalizada
THEN: Cliente desabilita todos os campos editáveis
THEN: "Salvar" botão é ocultado
WHEN: Usuário tenta alterar status
THEN: Dropdown de status fica disabled
THEN: Nenhuma alteração é processada
THEN: Toast: "Solicitação finalizada - edição não permitida"
```

### Fluxo 4: Sincronização Realtime com Múltiplos Usuários

```
GIVEN: Aluno e Professor visualizam a mesma solicitação
   AND: Lista de tarefas carregada
WHEN: Aluno cria nova tarefa
THEN: POST é enviada e processada
THEN: Backend envia SignalR: TarefaCriada { id, titulo, status }
   para grupo "solicitacao-[SolicitacaoId]"
THEN: Professor recebe evento sem fazer refresh
THEN: Nova tarefa aparece na lista do Professor
THEN: Push notification enviada
WHEN: Segundos depois, Professor altera status da nova tarefa
THEN: PATCH é enviada e processada
THEN: Backend envia SignalR: TarefaStatusAlterado { id, novoStatus, alteradoPor }
THEN: Aluno recebe evento
THEN: Status é atualizado na UI do Aluno sem refresh
THEN: rowVersion é sincronizado
THEN: Ambos veem "alterado por [Professor]" e timestamp
```

### Fluxo 5: Responsável Órfão

```
GIVEN: Tarefa com responsavelUsuarioId = UUID-Professor-A
   AND: Professor-A é removido da solicitação
WHEN: Backend processa remoção
THEN: Tarefa não é deletada
THEN: responsavelUsuarioId mantém UUID-Professor-A (FK íntegro)
THEN: responsavelNome = null (invalid reference)
WHEN: Cliente carrega tarefa
THEN: TarefaDto.responsavelNome = null
THEN: UI renderiza badge/label "Sem atribuição"
WHEN: Usuário visualiza tarefa
THEN: Campo responsável exibe "Sem atribuição (removido)"
THEN: Tarefa continua funcional, editável, status alterável
THEN: Responsável NÃO pode ser atribuído automaticamente
```

---

## Casos de Teste (Verificáveis)

### Teste 1: Criar Tarefa Simples

```
Pré-condição: Solicitação Ativa, usuário é participante
Ação: POST /solicitacoes/{id}/tarefas com { titulo: "Tarefa 1" }
Esperado:
  - Status HTTP 201 Created
  - TarefaDto com status = Pendente
  - rowVersion = 1
  - criadoPor = usuário logado
  - dataConclusao = null
```

### Teste 2: Validação de Comprimento

```
Pré-condição: Formulário de criar tarefa
Ação: Submeter titulo com 181 caracteres
Esperado:
  - Validação local rejeita (antes de enviar)
  - Erro exibido: "Máximo 180 caracteres"
  - Request não é enviada
```

### Teste 3: Conflito de Rowversion

```
Pré-condição: Tarefa carregada com rowVersion=3
Ação:
  1. Outro usuário altera tarefa (rowVersion→4)
  2. Enviamos PATCH com rowVersion=3
Esperado:
  - Status HTTP 409 Conflict
  - Mensagem de erro com rowVersion esperada
  - Cliente refetch e retry automático
```

### Teste 4: Readonly após Finalização

```
Pré-condição: Solicitação Finalizada
Ação: Tentar POST /solicitacoes/{id}/tarefas
Esperado:
  - Status HTTP 403 Forbidden
  - Mensagem: "Solicitação não permite novas tarefas"
```

### Teste 5: Realtime Sync

```
Pré-condição: Dois clientes (A e B) conectados via SignalR
Ação: Cliente A cria tarefa
Esperado:
  - Cliente A vê tarefa localmente imediatamente
  - SignalR event "TarefaCriada" é dispatched
  - Cliente B recebe evento e atualiza lista
  - Cliente B vê nova tarefa sem refresh
```

---

## Integração com Stack Existente

### Services a Usar

- **midiaService**: Validar e gerenciar anexos
- **authService**: Obter usuário logado
- **solicitacaoService**: Verificar status da solicitação
- **professorService**: Validar participação (se necessário)
- **usuarioService**: Resolv nomes de usuários

### Hooks Customizados Sugeridos

- `useTarefas(solicitacaoId)`: Fetch com paginação
- `useTarefaForm()`: Gerenciar form state e validações
- `useTarefaRealtime(solicitacaoId)`: SignalR subscription

### Padrões

- Error handling via `getErrorMessage()`
- Theme.ts para cores/tamanhos
- Types centralizados em `src/types.ts`
- Components em `src/components/`
- Lógica em `src/services/tarefasService.ts` (novo)

---

## Suposições Documentadas

1. **Responsável Imutável**: Não há endpoint para alterar responsável após criação
2. **Sem Deleção**: Soft-delete por design (permanência de auditoria)
3. **Status Linear**: Sem reversão, sem estados intermediários
4. **Paginação Padrão**: 20 registros, máximo 100
5. **Timestamp UTC**: Todas as datas em UTC
6. **RowVersion Numeric**: Inteiro incrementado a cada mudança
7. **SignalR Reconexão**: Automática, com sincronização pós-reconexão
8. **Markdown Suportado**: Descrição permite markdown, renderizado no cliente
9. **Validação Dupla**: Cliente (UX) + Servidor (segurança)
10. **Push Notifications**: Via serviço já existente, integrado

---

## Próximas Fases (Out of Scope)

- [ ] Mencionar tarefas em mensagens de chat (#task-[id])
- [ ] Relatórios de tarefas por professor
- [ ] Filtros avançados (por responsável, período)
- [ ] Templates de tarefas recorrentes
- [ ] Comentários/sub-tarefas
- [ ] Integração com calendário
