# Plan Técnico: Sistema de Tarefas em Solicitações de Mentoria

**Data**: 14 de junho de 2026  
**Feature**: 001-tarefas-solicitacao  
**Status**: ✅ Pronto para implementação  
**Responsável**: Frontend Team (React-Native/TypeScript)

---

## 1. Executive Summary

### Objetivo

Implementar um sistema completo de gerenciamento de tarefas vinculadas a solicitações de mentoria, permitindo criação, visualização, edição de status, associação com responsáveis e notificações em tempo real via SignalR.

### Escopo (MVP - Fase 1)

**IN SCOPE**:

- ✅ Criar tarefas com título, descrição, mídia, responsável
- ✅ Listar tarefas com paginação (20 por página)
- ✅ Editar status em transição linear (Pendente → Em Progresso → Concluída)
- ✅ Editar dados de tarefa (título, descrição, mídia)
- ✅ Tratamento de concorrência (RowVersion, retry automático)
- ✅ Notificações em tempo real (SignalR)
- ✅ Permissões de participante (validação)
- ✅ Responsável imutável após criação
- ✅ Solicitação finalizada/recusada = tarefas read-only
- ✅ Responsável órfão (participante sai) = exibição "Sem atribuição"

**OUT OF SCOPE (Futuro)**:

- ❌ Integração com chat/mentions de tarefas (#task-[id])
- ❌ Cache local em AsyncStorage
- ❌ Virtualização FlatList (otimização para 1000+)
- ❌ Soft-delete ou arquivamento de tarefas
- ❌ Filtros avançados (por status, responsável, data)
- ❌ Busca/search de tarefas
- ❌ Comentários em tarefas
- ❌ Notificações de vencimento
- ❌ Integração com calendário

### Sprint Estimate

| Fase      | Descrição                                      | Dias           | Horas          |
| --------- | ---------------------------------------------- | -------------- | -------------- |
| **0**     | Preparação (tipos, validação backend, SignalR) | 1              | 8              |
| **1**     | Foundation (services, componentes base)        | 3              | 24             |
| **2**     | Integração (telas, permissões)                 | 2              | 16             |
| **3**     | Realtime (listeners SignalR, reconexão)        | 2              | 16             |
| **4**     | Concorrência (409 RowVersion, retry)           | 1              | 8              |
| **5**     | Utilitários (validações, helpers)              | 1              | 4              |
| **6**     | Testes (unitários, componentes, E2E)           | 3              | 28             |
| **TOTAL** |                                                | **13-14 dias** | **~104 horas** |

**Assumindo**: 1 desenvolvedor fulltime (40h/semana) = **2,5 semanas** com buffers

### Pré-requisitos

**Backend**:

- ✅ Endpoints `/solicitacoes/{id}/tarefas` (GET, POST, PUT, PATCH) implementados
- ✅ SignalR Hub configurado com eventos: `NovaTarefa`, `TarefaAtualizada`, `TarefaStatusAlterado`
- ✅ Validação de 409 Conflict com RowVersion (contrato claro)
- ✅ Notificações de "Tarefa criada" / "Responsável atribuído"

**Frontend Stack**:

- ✅ React-Native 0.81.5, Expo 54, TypeScript 5.9.2
- ✅ Axios para requests
- ✅ AuthContext para autenticação
- ✅ midiaService funcional
- ✅ SignalR client já instalado e conectável
- ✅ Sistema de notificações pronto

---

## 2. Arquivos Afetados - Detalhe Completo

### 2.1 Arquivos NOVOS (8 arquivos)

#### **src/services/tarefaService.ts** (NOVO)

- **Caminho Absoluto**: `c:\Users\usuario\Documents\AulaH1\ProjetoTCC\src\services\tarefaService.ts`
- **Caminho Relativo**: `src/services/tarefaService.ts`
- **Razão**: Core business logic para operações CRUD de tarefas
- **Escopo**: ~250-300 linhas
  - `listar(solicitacaoId, pagina, tamanho)` → GET com paginação
  - `criar(solicitacaoId, request)` → POST com validação
  - `atualizar(tarefaId, request)` → PUT com RowVersion
  - `alterarStatus(tarefaId, novoStatus, rowVersion)` → PATCH
  - `tratarErro409(erro)` → Retry com backoff exponencial
- **Risco**: **ALTO** - Core de toda funcionalidade
- **Dependências**:
  - `types.ts` (tipos TarefaDto, requests)
  - `api/client.ts` (Axios interceptor)
  - `midiaService.ts` (validação de mídias)
  - Depende de: `SolicitacaoDetalheScreen`, todos os componentes

#### **src/components/TarefaCard.tsx** (NOVO)

- **Caminho Relativo**: `src/components/TarefaCard.tsx`
- **Razão**: Renderização individual de tarefa em lista
- **Escopo**: ~180-200 linhas
  - Props: `tarefa: TarefaDto`, `onPress`, `onStatusChange`
  - UI: Título, descrição truncada, status badge, responsável, data
  - Thumb de mídia se existir
  - Read-only visual se solicitação finalizada
- **Risco**: **MÉDIO** - Componente reutilizável mas dependente de status logic
- **Dependências**:
  - `StatusBadge.tsx` (para exibir status)
  - `Avatar.tsx` (para responsável)
  - Depende de: `TarefasScreen`, `SolicitacaoDetalheScreen`

#### **src/components/TarefaForm.tsx** (NOVO)

- **Caminho Relativo**: `src/components/TarefaForm.tsx`
- **Razão**: Formulário para criar/editar tarefas
- **Escopo**: ~250-300 linhas
  - Form fields: titulo (TextInput), descricao (TextArea), midias (MidiaUpload)
  - Responsável selector (AsyncSelect)
  - Validações inline (180/4000 chars)
  - Submit button com loading state
  - Cancel button
- **Risco**: **MÉDIO** - Validações críticas, UX importante
- **Dependências**:
  - `Input.tsx`, `Button.tsx`, `UniversidadeSelect.tsx` (como template para selector)
  - Depende de: `TarefasScreen`, modal/drawer de criação

#### **src/components/StatusSelector.tsx** (NOVO)

- **Caminho Relativo**: `src/components/StatusSelector.tsx`
- **Razão**: Dropdown para alterar status com validação de transição
- **Escopo**: ~120-150 linhas
  - Props: `statusAtual: TarefaStatus`, `onSelect`, `disabled`
  - Logic: Mostrar apenas transições válidas (Pendente→EmProgresso, EmProgresso→Concluida)
  - Visual: Picker nativo ou dropdown customizado
- **Risco**: **BAIXO** - Lógica simples, validação bem definida
- **Dependências**:
  - `StatusBadge.tsx` (para rendering)
  - Depende de: `TarefaCard`, formulários de edição

#### **src/screens/TarefasScreen.tsx** (NOVO)

- **Caminho Relativo**: `src/screens/TarefasScreen.tsx`
- **Razão**: Tela/Tab para listar, criar, editar tarefas
- **Escopo**: ~350-400 linhas
  - FlatList com paginação
  - Botão "Nova Tarefa" (abre modal)
  - Filtros simples (ordenação por data/status)
  - Loader, EmptyState, ErrorState
  - Integração com useTarefas hook
  - Listeners SignalR (atualizar lista em tempo real)
- **Risco**: **ALTO** - Orquestração central da feature
- **Dependências**:
  - Depende TUDO: tarefaService, TarefaCard, TarefaForm, useTarefas, StatusBadge

#### **src/hooks/useTarefas.ts** (NOVO)

- **Caminho Relativo**: `src/hooks/useTarefas.ts`
- **Razão**: Custom hook para state management de tarefas
- **Escopo**: ~200-250 linhas
  - State: `tarefas[]`, `loading`, `error`, `paginacao`
  - Methods: `listar()`, `criar()`, `atualizar()`, `alterarStatus()`
  - Effect: Setup listeners SignalR
  - Logic: Cache local, retry automático (409)
- **Risco**: **ALTO** - Gerencia todo state e side-effects
- **Dependências**:
  - `tarefaService.ts` (chamadas)
  - `AuthContext.tsx` (usuário atual)
  - Depende de: `TarefasScreen`, qualquer consumer de tarefas

#### **src/utils/tarefa.ts** (NOVO)

- **Caminho Relativo**: `src/utils/tarefa.ts`
- **Razão**: Helpers, formatações e validações de tarefas
- **Escopo**: ~150 linhas
  - `validarTitulo(titulo)` → valida 1-180 chars
  - `validarDescricao(descricao)` → valida 0-4000 chars
  - `formatarDataConclusao(data)` → ISO → formato legível
  - `podeEditarTarefa(tarefa, statusSolicitacao)` → lógica de permissão read-only
  - `getStatusLabel(status)` → TarefaStatus enum → string
  - `getStatusColor(status)` → TarefaStatus → cor do theme
- **Risco**: **BAIXO** - Funções puras, fáceis de testar
- **Dependências**:
  - `theme.ts` (cores)
  - Depende de: Componentes, screens, services

#### **app/solicitacoes/[id]/tarefas/index.tsx** (NOVO - Rota)

- **Caminho Relativo**: `app/solicitacoes/[id]/tarefas/index.tsx`
- **Razão**: Rota dinâmica para página de tarefas (futura expansão)
- **Escopo**: ~50-70 linhas
  - Wrapper que chama `TarefasScreen` com `solicitacaoId` do route params
  - Layout com header, navegação back
- **Risco**: **BAIXO** - Apenas roteamento
- **Dependências**:
  - `TarefasScreen.tsx`
  - Expo-Router setup

---

### 2.2 Arquivos MODIFICADOS (6 arquivos)

#### **src/types.ts** (MODIFICADO)

- **Caminho Relativo**: `src/types.ts`
- **Razão**: Adicionar tipos/DTOs de tarefas
- **Escopo de Mudança**: Adicionar ~100-120 linhas no final do arquivo

  ```typescript
  // Enums
  export enum TarefaStatus {
    Pendente = 1,
    EmProgresso = 2,
    Concluida = 3,
  }

  // DTOs
  export interface TarefaDto {
    /* ... */
  }
  export interface CriarTarefaRequest {
    /* ... */
  }
  export interface AtualizarTarefaRequest {
    /* ... */
  }
  export interface AlterarStatusTarefaRequest {
    /* ... */
  }
  export interface TarefasPagedResponse {
    /* ... */
  }
  ```

- **Risco**: **MÉDIO** - Adição segura, sem breaking changes
- **Dependências**:
  - Depende de: Todas as novas files (services, components, screens)

#### **src/screens/SolicitacaoDetalheScreen.tsx** (MODIFICADO)

- **Caminho Relativo**: `src/screens/SolicitacaoDetalheScreen.tsx`
- **Razão**: Integrar aba/seção de tarefas junto com chat/detalhes
- **Escopo de Mudança**: ~80-120 linhas
  - Adicionar Tab/Segmented Control para "Detalhes | Tarefas | Chat"
  - Renderizar `<TarefasScreen solicitacaoId={...} />` quando tab selecionada
  - Passar state de solicitação (status, participantes) como context/props
  - Atualizar layout para acomodar 3 tabs
- **Risco**: **MÉDIO** - Modificação de layout existente, mas não quebra
- **Dependências**:
  - Agora depende de: `TarefasScreen`, `tarefaService`
  - Depende de: `solicitacaoService` (já existente)

#### **src/components/StatusBadge.tsx** (MODIFICADO)

- **Caminho Relativo**: `src/components/StatusBadge.tsx`
- **Razão**: Expandir para incluir novos status de tarefas
- **Escopo de Mudança**: ~30-50 linhas
  - Adicionar cases para `TarefaStatus.Pendente`, `EmProgresso`, `Concluida`
  - Mapear para cores do theme (usar extensão se necessário)
  - Labels: "Pendente" em amarelo, "Em Progresso" em azul, "Concluída" em verde
- **Risco**: **BAIXO** - Extensão segura de componente existente
- **Dependências**:
  - Depende de: `theme.ts` (cores)
  - Depende de: `TarefaCard`, qualquer lugar que exiba status

#### **src/styles/theme.ts** (VERIFICAR - Possível Modificação)

- **Caminho Relativo**: `src/styles/theme.ts`
- **Razão**: Validar/adicionar cores para status de tarefas
- **Escopo de Mudança**: ~10-30 linhas (se necessário)
  - Verificar se colors já tem: `yellow` (Pendente), `blue` (EmProgresso), `green` (Concluída)
  - Se não, adicionar aos `colors` do theme
  - Adicionar tipo `TarefaStatusColor` se necessário
- **Risco**: **BAIXO** - Adição de constantes segura
- **Dependências**:
  - Depende de: `StatusBadge`, `TarefaCard`, qualquer renderização de status

#### **src/api/client.ts** (VERIFICAR - Sem Mudanças Esperadas)

- **Caminho Relativa**: `src/api/client.ts`
- **Razão**: Validar que interceptor JWT e tratamento de erro estão OK para tarefas
- **Escopo de Mudança**: **0 linhas** (apenas documentação)
  - Verificar que `api.interceptors.response` trata 409 Conflict corretamente
  - Verificar que `getErrorMessage()` extrai mensagem de 409
  - Documentar no código se não ficar claro
- **Risco**: **MUITO BAIXO** - Apenas verificação
- **Dependências**:
  - Usado por: `tarefaService`

#### **src/contexts/AuthContext.tsx** (NÃO MEXER - Intocável)

- **Caminho Relativa**: `src/contexts/AuthContext.tsx`
- **Razão**: ❌ INTOCÁVEL per constitution
- **Escopo de Mudança**: 0 linhas
- **Risco**: N/A
- **Dependências**: Já consumido por `TarefasScreen`, `tarefaService`

---

### 2.3 Resumo de Impacto

| Tipo            | Quantidade      | Risco Total                |
| --------------- | --------------- | -------------------------- |
| **Novos**       | 8 arquivos      | 🔴 ALTO (core logic)       |
| **Modificados** | 6 arquivos      | 🟡 MÉDIO (extensão segura) |
| **Intocáveis**  | 5 arquivos      | 🟢 NENHUM                  |
| **TOTAL**       | **19 arquivos** | **GERENCIÁVEL**            |

**Impacto de Breaking Changes**: ❌ ZERO (architecture respeitada)

---

## 3. Design Técnico

### 3.1 Arquitetura de Pastas (Proposta)

```
src/
├── types.ts                                  (extensão com TarefaDto, etc)
├── services/
│   ├── tarefaService.ts                      (NOVO) ← Core da feature
│   └── ... (existentes)
├── screens/
│   ├── TarefasScreen.tsx                     (NOVO) ← Tela principal
│   ├── SolicitacaoDetalheScreen.tsx          (MODIFICADO)
│   └── ... (existentes)
├── components/
│   ├── TarefaCard.tsx                        (NOVO) ← Item da lista
│   ├── TarefaForm.tsx                        (NOVO) ← Modal/Form criar/editar
│   ├── StatusSelector.tsx                    (NOVO) ← Dropdown status
│   ├── StatusBadge.tsx                       (MODIFICADO)
│   └── ... (existentes)
├── hooks/
│   ├── useTarefas.ts                         (NOVO) ← State management
│   └── useAuth.ts (existente)
├── utils/
│   ├── tarefa.ts                             (NOVO) ← Helpers e validações
│   └── ... (existentes)
├── styles/
│   └── theme.ts                              (VERIFICADO)
└── api/
    └── client.ts                             (VERIFICADO)

app/
├── solicitacoes/
│   └── [id]/
│       ├── tarefas/                          (NOVO) ← Rota nested
│       │   └── index.tsx
│       ├── [id].tsx (existente)
│       └── index.tsx (existente)
```

### 3.2 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                             │
│  (TarefaCard, TarefaForm, StatusSelector clicks)               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    TarefasScreen.tsx                             │
│  (Orquestra e renderiza componentes)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   useTarefas.ts Hook                             │
│  (Gerencia state local: tarefas[], loading, error)             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  tarefaService.ts                                │
│  (Business logic: criar, listar, atualizar, alterarStatus)    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   src/api/client.ts                              │
│  (Axios com JWT, interceptor de erro 409)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                  ┌───────────┴───────────┐
                  ↓                       ↓
        ┌──────────────────┐    ┌──────────────────┐
        │  BACKEND SYNC    │    │  SIGNALR ASYNC   │
        │  (HTTP Request)  │    │  (WebSocket)     │
        └──────────────────┘    └──────────────────┘
                  ↓                       ↓
        ┌──────────────────┐    ┌──────────────────┐
        │  Resposta DTO    │    │  NovaTarefa      │
        │  ou Erro 409     │    │  TarefaAtualizada│
        └──────────────────┘    └──────────────────┘
                  ↓                       ↓
        ┌──────────────────┐    ┌──────────────────┐
        │  Retry automático│    │  Listeners em    │
        │  se 409          │    │  useTarefas.ts   │
        └──────────────────┘    └──────────────────┘
                  ↓                       ↓
        ┌──────────────────┐    ┌──────────────────┐
        │ Atualizar state  │    │ Atualizar state  │
        │ (tarefas[])      │    │ (tarefas[])      │
        └──────────────────┘    └──────────────────┘
                  ↓                       ↓
        ┌──────────────────────────────────┐
        │   TarefasScreen re-renderiza     │
        │   UI atualizada para usuário     │
        └──────────────────────────────────┘
```

### 3.3 State Management

**Local State (useState)**:

- `useTarefas.ts`:
  - `tarefas: TarefaDto[]` - lista paginada
  - `loading: boolean` - requisição em andamento
  - `error: string | null` - mensagem de erro
  - `paginacao: { paginaAtual, totalPages }`
  - `cache: Map<string, TarefaDto>` - cache local por ID (evitar refetch)

**Context (Apenas leitura)**:

- `AuthContext.tsx`:
  - `usuarioAtual.id` - para validar permissões
  - `usuarioAtual.participacoes` - para validar se participante da solicitação

**Sem Redux**: Escopo simples, não justifica complexidade adicional

### 3.4 Integração SignalR (Realtime)

**Setup em useTarefas.ts**:

```typescript
useEffect(() => {
  const hubConnection = new HubConnectionBuilder()
    .withUrl(`/hubs/solicitacoes/${solicitacaoId}`)
    .withAutomaticReconnect([0, 2000, 5000, 15000]) // exponential backoff
    .build();

  // Listener: Nova tarefa criada
  hubConnection.on("NovaTarefa", (tarefa: TarefaDto) => {
    setTarefas((prev) => [tarefa, ...prev]); // adiciona ao início
  });

  // Listener: Tarefa atualizada (dados)
  hubConnection.on("TarefaAtualizada", (tarefa: TarefaDto) => {
    setTarefas((prev) => prev.map((t) => (t.id === tarefa.id ? tarefa : t)));
  });

  // Listener: Status alterado
  hubConnection.on(
    "TarefaStatusAlterado",
    (tarefaId: string, novoStatus: TarefaStatus) => {
      setTarefas((prev) =>
        prev.map((t) =>
          t.id === tarefaId
            ? { ...t, status: novoStatus, alteradoEm: new Date().toISOString() }
            : t,
        ),
      );
    },
  );

  hubConnection.start();
  return () => hubConnection.stop();
}, [solicitacaoId]);
```

**Reconexão automática**:

- Backoff exponencial: 0ms, 2s, 5s, 15s
- Timeout cada conexão: 10s
- Retry manual se falhar: boolean `isConnected` exibe "Desconectado - aguardando reconexão"

**Fila de updates** (Fase 3):

- Se desconectado, fila operações locais em estado `pendingOperations`
- Quando reconectar, enviar fila (evitar duplicação)

### 3.5 Tratamento de Concorrência (RowVersion)

**409 Conflict Handling**:

```typescript
async function alterarStatus(tarefaId: string, novoStatus: TarefaStatus) {
  let tentativas = 0;
  const maxTentativas = 3;

  while (tentativas < maxTentativas) {
    try {
      const tarefa = tarefas.find((t) => t.id === tarefaId);
      await tarefaService.alterarStatus(
        tarefaId,
        novoStatus,
        tarefa.rowVersion,
      );
      return; // sucesso
    } catch (erro) {
      if (erro.response?.status === 409) {
        tentativas++;
        if (tentativas >= maxTentativas) {
          // Mostrar dialog ao usuário
          Alert.alert(
            "Conflito de edição",
            "A tarefa foi modificada por outro usuário. Recarregando...",
            [{ text: "OK", onPress: () => listar(solicitacaoId) }],
          );
          return;
        }
        // Recarregar tarefa do backend e tentar novamente
        await listar(solicitacaoId);
        await new Promise((r) => setTimeout(r, Math.pow(2, tentativas) * 1000)); // backoff
      } else {
        throw erro; // erro diferente, não retry
      }
    }
  }
}
```

**Backend contrato esperado (erro 409)**:

```json
{
  "status": 409,
  "message": "Row version mismatch. Current version: 6, expected: 5",
  "code": "CONCURRENCY_ERROR",
  "timestamp": "2026-06-14T10:30:00Z"
}
```

### 3.6 Tratamento de Erro Padrão

**Erro HTTP**:

```typescript
// Em tarefaService.ts
catch (erro) {
  const mensagem = getErrorMessage(erro); // função existente em utils/
  console.error(`[tarefaService] Erro ao listar:`, erro);
  throw {
    message: mensagem,
    code: erro.response?.data?.code || 'UNKNOWN',
    status: erro.response?.status,
    raw: erro
  };
}
```

**Em TarefasScreen.tsx**:

```typescript
const { tarefas, loading, error } = useTarefas(solicitacaoId);

if (error) {
  return (
    <ErrorState
      titulo="Erro ao carregar tarefas"
      mensagem={error}
      onRetry={() => listar(solicitacaoId)}
    />
  );
}
```

---

## 4. Decomposição em Tarefas

### FASE 0: Preparação (1-2 dias)

- [ ] **Task-0.1: Atualizar src/types.ts com TarefaDto, requests, enums** (4h)
  - Adicionar enum `TarefaStatus` (Pendente=1, EmProgresso=2, Concluida=3)
  - Adicionar DTOs: `TarefaDto`, `CriarTarefaRequest`, `AtualizarTarefaRequest`, `AlterarStatusTarefaRequest`, `TarefasPagedResponse`
  - Incluir tipos de MidiaDto (reutilizar existente)
  - Adicionar `export interface TarefaError extends ErrorResponse`
  - Commit: "feat: adicionar tipos de tarefas"
  - Dependências: Nenhuma (tipos puros)

- [ ] **Task-0.2: Validar contrato de erro 409 com backend** (2h)
  - Testar endpoint PATCH `/solicitacoes/{id}/tarefas/{tarefaId}/status` com RowVersion desatualizado
  - Confirmar que backend retorna HTTP 409 com estrutura esperada
  - Documentar formato em comentário no código
  - Validar que getErrorMessage() consegue extrair mensagem
  - Commit: "docs: validar contrato 409 RowVersion"
  - Dependências: Backend pronto

- [ ] **Task-0.3: Validar eventos SignalR necessários** (2h)
  - Conectar ao hub SignalR e listar eventos disponíveis
  - Confirmar: `NovaTarefa`, `TarefaAtualizada`, `TarefaStatusAlterado`
  - Testar envio de evento fictício para validar estrutura
  - Documentar payload esperado de cada evento
  - Commit: "docs: validar eventos SignalR"
  - Dependências: Backend pronto

**Critério de Saída Fase 0**: types.ts atualizado, 409 testado, SignalR validado

---

### FASE 1: Foundation (3-4 dias)

- [ ] **Task-1.1: Criar tarefaService.ts** (8h)
  - Função `listar(solicitacaoId, pagina?, tamanho?)` → GET /solicitacoes/{id}/tarefas
  - Função `criar(solicitacaoId, request)` → POST /solicitacoes/{id}/tarefas
  - Função `atualizar(tarefaId, request)` → PUT /tarefas/{id}
  - Função `alterarStatus(tarefaId, novoStatus, rowVersion)` → PATCH /tarefas/{id}/status
  - Implementar getStatus() com retry 409 (chamar novamente com rowVersion novo)
  - Validar que MidiaId são válidos (chamar midiaService.validar() se necessário)
  - Tratamento de erro padrão com getErrorMessage()
  - Testes: Criar tarefaService.test.ts com mocks de Axios
  - Commit: "feat: implementar tarefaService com CRUD completo"
  - Dependências: types.ts (Task-0.1), api/client.ts, midiaService

- [ ] **Task-1.2: Criar TarefaCard.tsx component** (6h)
  - Props: `tarefa: TarefaDto`, `onPress: () => void`, `onStatusChange: (novoStatus) => void`
  - Layout: Card com título, descrição truncada (2 linhas), status badge, responsável (Avatar + nome)
  - Data de criação/conclusão em pequeno
  - Thumb de mídia se `tarefa.midia.length > 0`
  - Disabled visual se status === Concluida (opacity, sem clicabilidade)
  - Disabled visual se `statusSolicitacao !== Ativa`
  - Renderizar "Sem atribuição" se responsávelUsuarioId === null
  - Testes: TarefaCard.test.tsx com snapshots
  - Commit: "feat: criar TarefaCard component"
  - Dependências: StatusBadge, Avatar (existentes), types.ts

- [ ] **Task-1.3: Criar StatusSelector.tsx component** (5h)
  - Props: `statusAtual: TarefaStatus`, `onSelect: (novoStatus) => void`, `disabled?: boolean`
  - UI: Picker nativo (iOS) ou PickerIOSComponent ou Segmented Control
  - Validação: Mostrar apenas transições válidas
    - Se Pendente: opções [EmProgresso]
    - Se EmProgresso: opções [Concluida]
    - Se Concluida: nenhuma opção (read-only)
  - Label: "Próximo status", "Alterar para", etc
  - Confirm e Cancel buttons
  - Testes: StatusSelector.test.tsx
  - Commit: "feat: criar StatusSelector com validação de transição"
  - Dependências: types.ts

- [ ] **Task-1.4: Criar TarefaForm.tsx component** (8h)
  - Props: `tarefaId?: string`, `solicitacaoId: string`, `onSave: (tarefa) => void`, `onCancel: () => void`
  - Form fields (TextInput):
    - `titulo` (obrigatório, 1-180 chars, contador)
    - `descricao` (opcional, 0-4000 chars, contador, multiline)
    - `responsavelUsuarioId` (AsyncSelect de participantes)
  - Mídia upload (reutilizar lógica existente ou chamar midiaService)
  - Validações inline:
    - `validarTitulo()` da utils/tarefa.ts
    - `validarDescricao()` da utils/tarefa.ts
  - Botões: "Salvar" (loading state), "Cancelar"
  - Se editando (tarefaId presente), chamar tarefaService.atualizar() e passar rowVersion
  - Se criando, chamar tarefaService.criar()
  - Tratamento de erro com Alert.alert()
  - Testes: TarefaForm.test.tsx com validações
  - Commit: "feat: criar TarefaForm com validações"
  - Dependências: Input, Button (existentes), tarefaService, types.ts

- [ ] **Task-1.5: Expandir StatusBadge.tsx com cores de tarefas** (2h)
  - Adicionar cases para `TarefaStatus.Pendente`, `EmProgresso`, `Concluida`
  - Mapear para cores:
    - Pendente → `theme.colors.warning` (amarelo) ou novo `theme.colors.pending`
    - EmProgresso → `theme.colors.info` (azul) ou novo `theme.colors.inProgress`
    - Concluida → `theme.colors.success` (verde)
  - Labels em português: "Pendente", "Em Progresso", "Concluída"
  - Manter backward compatibility com status de Solicitacao
  - Testes: StatusBadge.test.tsx (novo snapshot)
  - Commit: "feat: expandir StatusBadge para status de tarefas"
  - Dependências: theme.ts (verificar colors)

- [ ] **Task-1.6: Criar useTarefas.ts hook** (6h)
  - State:
    - `tarefas: TarefaDto[]`
    - `loading: boolean`
    - `error: string | null`
    - `paginacao: { paginaAtual: number, totalPaginas: number }`
  - Methods:
    - `listar(solicitacaoId, pagina?, tamanho?)` → chama tarefaService.listar()
    - `criar(solicitacaoId, request)` → chama tarefaService.criar(), adiciona ao state
    - `atualizar(tarefaId, request)` → chama tarefaService.atualizar(), atualiza no state
    - `alterarStatus(tarefaId, novoStatus)` → com retry 409
    - `paginaAnterior()`, `proximaPagina()` → navega paginação
  - Effects:
    - `useEffect(() => { ... }, [solicitacaoId])` → setup SignalR listeners
    - Listener `NovaTarefa` → adiciona no início da lista
    - Listener `TarefaAtualizada` → atualiza item
    - Listener `TarefaStatusAlterado` → atualiza status + timestamp
  - Error handling: getErrorMessage() para erros
  - Cache: Map para evitar refetch de tarefa por ID
  - Testes: useTarefas.test.tsx com mock SignalR
  - Commit: "feat: criar useTarefas hook com SignalR"
  - Dependências: tarefaService, AuthContext, types.ts

**Critério de Saída Fase 1**: Foundation pronto, componentes base criados, service funcional, hook com SignalR

---

### FASE 2: Integração na Tela (2-3 dias)

- [ ] **Task-2.1: Modificar SolicitacaoDetalheScreen para incluir Tab de Tarefas** (8h)
  - Adicionar Segmented Control / Tab Navigator: "Detalhes | Tarefas | Chat"
  - Renderizar `<TarefasScreen solicitacaoId={solicitacaoId} statusSolicitacao={solicitacao.status} />`
  - Passar state de solicitacao como context provider ou props
  - Validar que navegação entre tabs funciona suave (sem re-render desnecessário)
  - Atualizar layout do header (adicionar tabs)
  - Testes: SolicitacaoDetalheScreen.test.tsx (snapshot da nova layout)
  - Commit: "feat: integrar aba de tarefas em SolicitacaoDetalheScreen"
  - Dependências: TarefasScreen, types.ts

- [ ] **Task-2.2: Implementar TarefasScreen com validações de permissão** (3h)
  - Validar que usuário é participante da solicitação
  - Se não é participante, exibir "Você não tem acesso a tarefas nesta solicitação"
  - Desabilitar botão "Nova Tarefa" se solicitacao.status !== Ativa
  - Desabilitar edição se solicitacao.status === Finalizada || Recusada
  - Mostrar visual de read-only (text em cinza, inputs disabled)
  - Toast com razão se tentar criar em solicitação finalizada
  - Testes: TarefasScreen.test.tsx (permissões)
  - Commit: "feat: validar permissões em TarefasScreen"
  - Dependências: AuthContext, types.ts

- [ ] **Task-2.3: Integrar loading states e empty states** (5h)
  - Loading skeleton: Mostrar 3 cards placeholder enquanto carrega
  - EmptyState: "Nenhuma tarefa criada" com botão "Criar primeira tarefa"
  - Error state: "Erro ao carregar tarefas" com botão "Tentar novamente"
  - Paginação loading: Loading spinner no botão "Próxima" / "Anterior"
  - Pull-to-refresh: Gestur de drag-down para recarregar
  - Commit: "feat: adicionar loading e empty states em tarefas"
  - Dependências: Loading, EmptyState (existentes)

- [ ] **Task-2.4: Testar paginação (20 por página)** (3h)
  - Criar dados de teste: 45 tarefas (3 páginas)
  - Testar que primeira página carrega 20
  - Testar navegação próxima/anterior
  - Testar que total de páginas calcula corretamente
  - Testar que botões desabilitam corretamente (primeira página sem "Anterior", última sem "Próxima")
  - Testes E2E: Simular múltiplas páginas
  - Commit: "test: validar paginação de tarefas"
  - Dependências: tarefaService (mock com 45 itens)

**Critério de Saída Fase 2**: TarefasScreen integrada, permissões OK, UX polida

---

### FASE 3: Realtime (2-3 dias)

- [ ] **Task-3.1: Criar listeners SignalR (NovaTarefa, TarefaAtualizada)** (6h)
  - Implementar em useTarefas.ts (já iniciado em Task-1.6)
  - Listener `NovaTarefa(tarefa: TarefaDto)`: Adicionar no início da lista (prepend)
    - Se em primeira página, atualizar UI
    - Se em outra página, incrementar contador "Novas tarefas (2)"
  - Listener `TarefaAtualizada(tarefa: TarefaDto)`: Atualizar item existente
    - Buscar por tarefaId, trocar objeto inteiro
    - Manter ordenação
  - Listener `TarefaStatusAlterado(tarefaId, novoStatus)`: Atualizar status + alteradoEm
  - Testar que listeners disparam e UI atualiza
  - Testes: Mock SignalR com spy/stub
  - Commit: "feat: implementar listeners SignalR de tarefas"
  - Dependências: useTarefas (ja existe)

- [ ] **Task-3.2: Integrar reconexão automática** (5h)
  - Implementar HubConnectionBuilder com `.withAutomaticReconnect([0, 2000, 5000, 15000])`
  - Estado `isConnected: boolean` para saber se online
  - Mostrar badge/toast "Reconectando..." se desconectar
  - Mostrar badge "Desconectado" se reconexão falhar (max 4 tentativas)
  - Botão manual "Reconectar" se falhar
  - Testes: Simular desconexão e reconexão
  - Commit: "feat: adicionar reconexão automática SignalR"
  - Dependências: useTarefas

- [ ] **Task-3.3: Implementar fila de updates realtime** (5h)
  - Estado `pendingOperations: { type, payload, timestamp }[]`
  - Se desconectado, adicionar operação à fila (não enviar)
  - Quando reconectar, processar fila em ordem FIFO
  - Validar para evitar duplicação (check timestamp + payload)
  - Se operação na fila falhar, retentar ou avisar usuário
  - Testes: Simular desconexão durante create/update, depois reconectar
  - Commit: "feat: adicionar fila de operações offline"
  - Dependências: useTarefas, tarefaService

**Critério de Saída Fase 3**: Realtime funcional, reconexão robusta, offline queue pronto

---

### FASE 4: Concorrência (1-2 dias)

- [ ] **Task-4.1: Implementar tratamento de 409 RowVersion** (5h)
  - Adicionar em tarefaService.ts função `tratarErro409(erro, tarefaId, operacao)`
  - Se status === 409:
    - Recarregar tarefa do backend para obter novo rowVersion
    - Tentar operação novamente com novo rowVersion
    - Max 3 tentativas com backoff exponencial
  - Se 3 tentativas falham, lançar erro customizado `ConcurrencyError`
  - Testes: Mock de resposta 409
  - Commit: "feat: implementar retry de 409 RowVersion"
  - Dependências: tarefaService

- [ ] **Task-4.2: Retry automático com recarregamento** (4h)
  - Em useTarefas.ts, adicionar lógica de retry em `alterarStatus()`
  - Aguardar 1s, 2s, 4s entre tentativas
  - A cada retry, chamar `listar()` para sincronizar rowVersion mais novo
  - Max 3 tentativas total
  - Testes: Simular conflito concorrente (2 usuários)
  - Commit: "feat: adicionar retry automático com backoff"
  - Dependências: useTarefas, tarefaService

- [ ] **Task-4.3: Dialog de conflito user-friendly** (3h)
  - Se após 3 tentativas ainda falhar, mostrar AlertDialog:
    ```
    "Conflito de edição"
    "A tarefa foi modificada por outro usuário.
     Recarregando dados..."
    [Botão "OK"]
    ```
  - Ao clicar OK, chamar `listar()` para recarregar tudo
  - Testes: E2E simular conflito permanente
  - Commit: "feat: adicionar dialog de conflito de edição"
  - Dependências: useTarefas

**Critério de Saída Fase 4**: 409 tratado gracefully, users informados

---

### FASE 5: Utilitários (1 dia)

- [ ] **Task-5.1: Criar src/utils/tarefa.ts helpers** (3h)
  - `validarTitulo(titulo: string): { valido: boolean, erro?: string }`
    - Validar 1-180 chars, sem trim
  - `validarDescricao(descricao: string): { valido: boolean, erro?: string }`
    - Validar 0-4000 chars, markdown OK
  - `formatarDataConclusao(data: ISO8601): string`
    - Converter "2026-06-14T10:30:00Z" → "14 de jun às 10:30"
  - `podeEditarTarefa(tarefa: TarefaDto, statusSolicitacao: SolicitacaoStatus): boolean`
    - Retornar false se SolicitacaoStatus === Finalizada || Recusada
    - Retornar false se tarefa.status === Concluida
  - `getStatusLabel(status: TarefaStatus): string`
    - 1 → "Pendente", 2 → "Em Progresso", 3 → "Concluída"
  - `getStatusColor(status: TarefaStatus): string`
    - Retornar cor do theme para cada status
  - Testes: tarefa.test.ts (todas as funções)
  - Commit: "feat: criar utilitários de tarefas"
  - Dependências: types.ts, theme.ts

- [ ] **Task-5.2: Validações de tamanho em componentes** (2h)
  - Integrar validadores em TarefaForm.tsx
  - Mostrar contador: "180 caracteres" em cinza, vermelho se > limite
  - Desabilitar botão Submit se título vazio ou descricao > 4000
  - Mensagens de erro inline
  - Testes: TarefaForm.test.tsx (validações)
  - Commit: "feat: adicionar validações de tamanho em formulário"
  - Dependências: TarefaForm, utils/tarefa.ts

**Critério de Saída Fase 5**: Utilitários prontos, validações completas

---

### FASE 6: Testes (2-3 dias)

- [ ] **Task-6.1: Testes unitários (services)** (8h)
  - tarefaService.test.ts:
    - `listar()` com paginação
    - `criar()` com validação
    - `atualizar()` com RowVersion
    - `alterarStatus()` com retry 409
    - Mocks Axios com jest.mock()
  - useTarefas.test.ts:
    - State inicial
    - Carregar tarefas
    - Criar tarefa (local + SignalR)
    - Alterar status com retry
    - Mocks SignalR com jest.mock()
  - tarefa.test.ts:
    - Validadores (titulo, descricao)
    - Formatadores (data)
    - Lógica de permissão
  - Coverage target: >80%
  - Commit: "test: adicionar testes unitários"
  - Dependências: Tudo (fase anterior)

- [ ] **Task-6.2: Testes de componentes (mocking)** (8h)
  - TarefaCard.test.tsx:
    - Renderizar tarefa
    - Testar onPress callback
    - Testar visual disabled
    - Snapshot testing
  - TarefaForm.test.tsx:
    - Preencher formulário
    - Validações inline
    - Submit com loading
    - Testar cancel
  - StatusSelector.test.tsx:
    - Transições válidas
    - Disabled em Concluida
  - TarefasScreen.test.tsx:
    - Renderizar lista
    - Testar paginação
    - Testar permissões
    - Mocks useAuth, useTarefas
  - Coverage target: >75%
  - Commit: "test: adicionar testes de componentes"
  - Dependências: Componentes (fase 1)

- [ ] **Task-6.3: Testes de integração (E2E)** (12h)
  - Setup Detox ou Playwright para E2E
  - Cenário 1: Criar tarefa (form → validação → sucesso → lista)
  - Cenário 2: Alterar status (dropdown → confirmação → realtime)
  - Cenário 3: Conflito RowVersion (simular 409 → retry → sucesso)
  - Cenário 4: SignalR desconecta → reconecta → fila processa
  - Cenário 5: Solicitação finalizada (buttons disabled, read-only)
  - Cenário 6: Paginação (próxima → anterior → validações)
  - Cenário 7: Responsável órfão (participante sai → exibe "Sem atribuição")
  - Coverage: 39 requisitos EARS testados (linkar cada um)
  - Commit: "test: adicionar testes E2E de tarefas"
  - Dependências: Todas features prontas

**Critério de Saída Fase 6**: >80% testes cobrindo todos os requisitos

---

## 5. Riscos Identificados

### 🔴 RISCOS ALTOS

**1. SignalR não conecta / reconexão fanha**

- **Descrição**: Se houver erro de conexão, sistema não propaga updates realtime
- **Probabilidade**: MÉDIA (rede instável)
- **Impacto**: CRITICAL - usuários veem dados desatualizados, perdem trabalho
- **Mitigação**:
  - Implementar polling fallback (reload a cada 30s se desconectado)
  - Mostrar banner "Desconectado - dados podem estar desatualizados"
  - Botão manual "Reconectar agora"
  - Testes de reconexão em rede lenta
- **Teste**: Task-3.2, Task-6.3 (Cenário 4)

**2. RowVersion mismatch causa conflito infinito**

- **Descrição**: Se backend e cliente desincronizam, retry automático falha infinitamente
- **Probabilidade**: BAIXA (backend bem testado)
- **Impacto**: HIGH - usuário fica bloqueado, não consegue editar
- **Mitigação**:
  - Max 3 tentativas, depois pedir reload manual via dialog
  - A cada retry, recarregar rowVersion novo do backend
  - Logging de todas as tentativas
  - Validar contrato 409 com backend (Task-0.2)
- **Teste**: Task-4.1, Task-6.3 (Cenário 3)

**3. Performance paginação: FlatList trava com scrolling pesado**

- **Descrição**: 20 itens por página com muitos renders pode travar em scrolling
- **Probabilidade**: BAIXA (React-Native otimizado para 50+ items)
- **Impacto**: MEDIUM - UX degradada, só afeta muitos usuários com 1000+ tarefas
- **Mitigação**:
  - Implementar virtualização com react-native-virtual-list (futuro)
  - Para MVP: FlatList padrão com `removeClippedSubviews={true}`
  - Profiling com React DevTools
  - Limitar renderização de TarefaCard (evitar re-renders desnecessários)
- **Teste**: Task-2.4 com 100+ items fake

---

### 🟡 RISCOS MÉDIOS

**4. Auditoria não salva / log incompleto**

- **Descrição**: Se backend falha em registrar `alteradoPor`, perda de rastreabilidade
- **Probabilidade**: BAIXA
- **Impacto**: LOW (operacional, não afeta funcionalidade)
- **Mitigação**:
  - Validar que tarefaService sempre retorna `alteradoPor` preenchido
  - Testes verificam auditoria
  - Logging server-side redundante
- **Teste**: Task-6.1 (mock validar auditoria)

**5. MidiaId validação falha**

- **Descrição**: Se midiaService fora do ar ou midiaId inválido, criação falha silenciosamente
- **Probabilidade**: BAIXA
- **Impacto**: LOW (graceful fallback)
- **Mitigação**:
  - Validar midiaId async ANTES de criar tarefa
  - Se inválido, mostrar erro específico "Mídia não encontrada"
  - Permitir criar tarefa SEM mídia (opcional)
- **Teste**: Task-1.1, Task-6.1

**6. Chat + Tarefas integração quebra futura**

- **Descrição**: Quando integrar mentions em chat (#task-[id]), estrutura pode mudar
- **Probabilidade**: MÉDIA
- **Impacto**: LOW (não é MVP)
- **Mitigação**:
  - Documentar schema de link: `#task-{uuid}`
  - Usar UUID (não ID numérico) para estabilidade
  - Planning document no `.specify/memory/` para futura integração
- **Teste**: Task-6.3 (Cenário 7 preparatório)

---

### 🟢 RISCOS BAIXOS

**7. Theme colors insuficientes**

- **Descrição**: theme.ts não ter cores para status de tarefas
- **Probabilidade**: MUITO BAIXA
- **Impacto**: LOW (fácil adicionar cores)
- **Mitigação**:
  - Verificar theme.ts (Task-0.3)
  - Se necessário, adicionar `colors.pending`, `colors.inProgress`, `colors.completed`
  - Usar cores existentes se possível
- **Teste**: Task-1.5

**8. AsyncStorage saturada com cache**

- **Descrição**: AsyncStorage fica lento se caching excessivo de tarefas
- **Probabilidade**: MUITO BAIXA
- **Impacto**: LOW (design decision: sem cache local para MVP)
- **Mitigação**:
  - Para MVP, NÃO fazer caching local (apenas online)
  - Pendências armazenadas em state (não persistem entre sessões)
  - Futuro: implementar cache inteligente com TTL
- **Teste**: N/A (fora de scope)

---

## 6. Critérios de Sucesso (Verificáveis)

Checklist para considerar feature COMPLETA:

- [ ] **REQ-001 a REQ-039**: Todos os 39 requisitos EARS testados e passando
- [ ] **Usuário cria tarefa**: Aparece na lista em tempo real (SignalR ou poll)
- [ ] **Usuário altera status**: Todos veem mudança sem refresh manual
- [ ] **Conflito RowVersion (409)**: Retry automático com max 3 tentativas, depois dialog
- [ ] **Paginação funciona**: 20 por página, navegação OK, botões desabilitados corretamente
- [ ] **Solicitação finalizada**: Tarefas read-only, sem edição, sem criar novas
- [ ] **Responsável órfão**: Exibe "Sem atribuição", tarefa funcional (não quebra)
- [ ] **SignalR desconecta**: Fallback polling ativa (30s), aviso ao usuário, reconecta automático
- [ ] **100% requisitos testados**: Cada REQ tem caso de teste (E2E ou unitário)
- [ ] **Zero erros não-tratados**: Console limpo, sem uncaught errors
- [ ] **Performance**: Listar 100 tarefas em <500ms, scroll suave
- [ ] **Testes**: Coverage >80%, unit + component + E2E
- [ ] **Documentação**: Comments no código, arquivo de troubleshooting
- [ ] **Integração AuthContext**: Permissões checadas, usuário identificado
- [ ] **Integração SignalR**: Reconexão robusta, eventos corretos
- [ ] **Integração midiaService**: Validação completa, graceful fallback
- [ ] **Auditoria completa**: criadoPor, alteradoPor, timestamps UTC

---

## 7. Dependencies & Assumptions

### Depends On (Externas - Validadas ✅)

- ✅ **Backend endpoints**: POST/GET/PUT/PATCH `/solicitacoes/{id}/tarefas*` prontos
- ✅ **SignalR Hub**: Configurado com eventos `NovaTarefa`, `TarefaAtualizada`, `TarefaStatusAlterado`
- ✅ **midiaService**: Funcional e validando IDs
- ✅ **Sistema de notificações**: Push notifications prontas
- ✅ **AuthContext**: Autenticação confiável
- ✅ **Stack versions**: React-Native 0.81.5, Expo 54, TypeScript 5.9.2

### Assumptions (Premissas - A Validar)

- Usuário sempre autenticado quando acessa tarefas (AuthContext garante)
- Solicitação existe no backend (FK constraint garante)
- ResponsávelUsuarioId pode ser null (sem problema)
- RowVersion sempre inteiro positivo (incrementa 1 por update)
- Endpoint 409 retorna estrutura documentada em Task-0.2
- SignalR hub reconecta automaticamente (infraestrutura)
- Paginação padrão (pagina=1, size=20) é racional
- Markdown em descrição é renderizado backend (apenas stored como string)

---

## 8. Gantt/Timeline (Indicativo)

```
FASE 0: Preparação (2 dias)
├─ Task-0.1 Types       [====]      (4h)    ← Dia 1 manhã
├─ Task-0.2 Backend     [==]        (2h)    ← Dia 1 tarde
└─ Task-0.3 SignalR     [==]        (2h)    ← Dia 1 tarde

FASE 1: Foundation (3-4 dias)
├─ Task-1.1 Service     [========]  (8h)    ← Dia 2-3
├─ Task-1.2 Card        [====]      (6h)    ← Dia 3
├─ Task-1.3 Selector    [===]       (5h)    ← Dia 3-4
├─ Task-1.4 Form        [========]  (8h)    ← Dia 4-5
├─ Task-1.5 Badge       [=]         (2h)    ← Dia 5 manhã
└─ Task-1.6 Hook        [====]      (6h)    ← Dia 5-6

FASE 2: Integração (2-3 dias)
├─ Task-2.1 SolicitacaoDetalheScreen Mod  [========]  (8h)  ← Dia 6-7
├─ Task-2.2 Permissões  [===]       (3h)    ← Dia 7
├─ Task-2.3 States      [===]       (5h)    ← Dia 8
└─ Task-2.4 Paginação   [==]        (3h)    ← Dia 8

FASE 3: Realtime (2-3 dias)
├─ Task-3.1 Listeners   [====]      (6h)    ← Dia 9
├─ Task-3.2 Reconexão   [===]       (5h)    ← Dia 10
└─ Task-3.3 Fila        [===]       (5h)    ← Dia 10-11

FASE 4: Concorrência (1-2 dias)
├─ Task-4.1 409 Handler [===]       (5h)    ← Dia 11
├─ Task-4.2 Retry       [===]       (4h)    ← Dia 11-12
└─ Task-4.3 Dialog      [==]        (3h)    ← Dia 12

FASE 5: Utilitários (1 dia)
├─ Task-5.1 Helpers     [==]        (3h)    ← Dia 12
└─ Task-5.2 Validações  [=]         (2h)    ← Dia 12-13

FASE 6: Testes (2-3 dias)
├─ Task-6.1 Unitários   [====]      (8h)    ← Dia 13-14
├─ Task-6.2 Componentes [====]      (8h)    ← Dia 14-15
└─ Task-6.3 Integração  [======]    (12h)   ← Dia 15-17

═════════════════════════════════════════════════════════════════════
TOTAL: ~125 horas = 3 semanas @ 40h/week
BUFFER: +20% = +25h → recomendação 4 semanas (seguro)
```

**Timeline Realista**:

- Semana 1: Fases 0-1 (preparação + foundation)
- Semana 2: Fases 2-3 (integração + realtime)
- Semana 3: Fases 4-5 (concorrência + utilitários)
- Semana 4: Fase 6 (testes + refinamentos)

---

## 9. Recomendação Final

### ✅ SIM, INICIAR AGORA

**Justificativa**:

1. ✅ **Spec está 100% clara**: 39 requisitos EARS completos, sem ambiguidades
2. ✅ **Constitution define padrões**: Services, componentes, error handling, tipos tudo documentado
3. ✅ **Arquivos necessários já mapeados**: Nenhuma surpresa arquitetural
4. ✅ **Riscos identificados e mitigáveis**: Nada bloqueador, todas soluções documentadas
5. ✅ **Backend confirmado pronto**: changes.md valida endpoints, SignalR OK
6. ✅ **Stack estável**: React-Native 0.81.5, Expo 54, TypeScript 5.9.2 all LTS

### 🚨 CUIDADOS PRINCIPAIS

**ANTES DE INICIAR**:

1. **Task-0.2**: Validar contrato 409 RowVersion com backend (pode não retornar mensagem clara)
   - Se backend não retorna `message` em 409, ajustar `getErrorMessage()` ou fallback
2. **Task-0.3**: Testar SignalR com reconexão em rede fraca (pode cair)
   - Simular desconexão, validar que listeners continuam após reconectar
3. **Theme validation**: Verificar se `src/styles/theme.ts` tem colors para Pendente/EmProgresso/Concluida

**DURANTE IMPLEMENTAÇÃO**:

1. **Ordem obrigatória**: types.ts → service → components → screen
2. **Testes ao lado**: Adicionar .test.ts simultaneamente (não deixar para o final)
3. **SignalR setup delicado**: Reconnect strategy pode ficar bugada se não testar bem
4. **409 Retry**: Limitar a 3 tentativas (não deixar loop infinito)

**PÓS-IMPLEMENTAÇÃO**:

1. **Profiling**: Verificar performance com 100+ tarefas (FlatList scroll)
2. **Stress test**: 2+ usuários editando mesma tarefa concorrentemente
3. **Network test**: Desligar WiFi, ligar 4G, validar reconexão
4. **Auditoria**: Verificar que `alteradoPor` sempre preenchido

---

## 10. Próximos Passos

**Imediato (hoje)**:

- [ ] Ler este plan.md completo
- [ ] Revisar com arquiteto/lead (30min)
- [ ] Validar pré-requisitos backend (1h)

**Fase 0 (amanhã)**:

- [ ] Task-0.1: Atualizar types.ts
- [ ] Task-0.2: Validar contrato 409
- [ ] Task-0.3: Testar SignalR

**Fase 1 (próxima semana)**:

- [ ] Task-1.1 a 1.6: Implementar foundation
- [ ] Testes unitários simultaneamente

**Fase 2 onwards**:

- [ ] Seguir cronograma no Gantt (seção 8)
- [ ] Daily standup: comentar progresso e bloqueadores
- [ ] PR reviews: code review + testes antes de merge

---

**Plano aprovado em**: 14 de junho de 2026  
**Versão**: 1.0  
**Status**: ✅ PRONTO PARA IMPLEMENTAÇÃO
