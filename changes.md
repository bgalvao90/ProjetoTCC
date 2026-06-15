# Registro de alterações — feature Tarefas (Resumo técnico)

Este documento lista, em um único lugar, todas as alterações feitas no código para adicionar a funcionalidade "Tarefas" e as mudanças de suporte (concorrência, SignalR, testes, migration esquelética).

Data: 2026-06-13

## Resumo das alterações (arquivos adicionados/alterados)

- Domain
  - Adicionado: `01 - Domain/ProjetoTCC.Domain/Entities/Tarefa.cs`
  - Adicionado: `01 - Domain/ProjetoTCC.Domain/Constants/TarefaStatusIds.cs`
  - Alterado: `01 - Domain/ProjetoTCC.Domain/Entities/Solicitacao.cs` (adicionada navegação `ICollection<Tarefa> Tarefas`)
  - Alterado: `01 - Domain/ProjetoTCC.Domain/Interfaces/IUnitOfWork.cs` (expor `IRepository<Tarefa> Tarefas`)

- Data
  - Alterado: `02 - Data/ProjetoTCC.Data/Context/ProjetoTccDbContext.cs` (adicionado `DbSet<Tarefa>`, mapeamento EF com `RowVersion` como concurrency token)
  - Alterado: `02 - Data/ProjetoTCC.Data/Repositories/UnitOfWork.cs` (expor `Tarefas`)
  - Adicionado (esqueleto): `02 - Data/ProjetoTCC.Data/Migrations/20260613_AddTarefa.cs` (migration C# esquelética — gerar migration real com EF Core localmente)

- Application
  - Adicionado: `03 - Application/ProjetoTCC.Application/DTOs/TarefaDtos.cs` (CriarTarefaRequest, TarefaDto)
  - Adicionado: `03 - Application/ProjetoTCC.Application/Services/ITarefaService.cs`
  - Adicionado: `03 - Application/ProjetoTCC.Application/Services/TarefaService.cs` (regras de negócio, validações, notificações realtime, tratamento básico de concorrência)
  - Alterado: `03 - Application/ProjetoTCC.Application/DependencyInjection.cs` (registro `ITarefaService`)

- API
  - Adicionado: `04 - API/ProjetoTCC.Api/Controllers/TarefasController.cs` (endpoints CRUD e alteração de status)
  - Observação: `04 - API/ProjetoTCC.Api/Program.cs` já está preparado para registrar AddApplication/AddData/AddRealtime; service registrado pela alteração acima.

- SignalR / Realtime
  - Alterado: `01 - Domain/ProjetoTCC.Domain/Interfaces/IRealtimeNotifier.cs` (adicionados métodos `NovaTarefaAsync` e `TarefaAtualizadaAsync`)
  - Alterado: `05 - SignalR/ProjetoTCC.SignalR/Notifications/SignalRRealtimeNotifier.cs` (envio de eventos `NovaTarefa` e `TarefaAtualizada`)

- Tests
  - Alterado: `tests/ProjetoTCC.Tests/ApplicationRulesTests.cs` (adicionado suporte in-memory para Tarefas e testes básicos de criação/validação)

## Endpoints adicionados (contrato para o front)

- POST /solicitacoes/{solicitacaoId:int}/tarefas
  - Body: CriarTarefaRequest (SolicitacaoId é sobrescrito pela URL)
  - Retorno: 201 Created + TarefaDto

- GET /solicitacoes/{solicitacaoId:int}/tarefas
  - Retorno: 200 OK + IReadOnlyList<TarefaDto>

- GET /solicitacoes/{solicitacaoId:int}/tarefas/{id:int}
  - Retorno: 200 OK + TarefaDto

- PUT /solicitacoes/{solicitacaoId:int}/tarefas/{id:int}
  - Body: CriarTarefaRequest
  - Retorno: 200 OK + TarefaDto

- PUT /solicitacoes/{solicitacaoId:int}/tarefas/{id:int}/status
  - Body: int (novoStatusId)
  - Retorno: 200 OK + TarefaDto

Formas de autenticação: JWT (Authorization: Bearer <token>). Para SignalR pode ser usado `access_token` na query string (TLS requerido em produção).

## DTOs principais

- CriarTarefaRequest
  - SolicitacaoId: int
  - Titulo: string (obrigatório)
  - Descricao: string? (opcional)
  - ResponsavelUsuarioId: int? (opcional)
  - MidiaId: string? (opcional — refere-se a upload em MongoDB)

- TarefaDto
  - TarefaId, SolicitacaoId, Titulo, Descricao, StatusId, ResponsavelUsuarioId, PossuiMidia, MidiaId, DataCriacao, DataAlteracao, DataConclusao

## Regras de negócio (resumo para o front)

- Apenas participantes da solicitação (aluno ou professor destinatário) podem criar/editar/alterar status de tarefas.
- Não é permitido criar/editar/alterar tarefas quando a solicitação estiver em StatusIds.Finalizada ou StatusIds.Recusada.
- Ao finalizar a solicitação, tarefas ficam somente leitura.
- Conflitos de concorrência: o backend usa RowVersion (concurrency token). Em caso de conflito o backend retorna erro tratado (BusinessException com mensagem de conflito). Front deve reagir recarregando o recurso antes de reenviar.

## Notificações realtime (SignalR)

- Hub: `/hubs/projetotcc`
- Eventos emitidos por grupo da solicitação:
  - `NovaTarefa` — payload: { TarefaId, SolicitacaoId, Titulo, StatusId, ResponsavelUsuarioId }
  - `TarefaAtualizada` — payload: { TarefaId, SolicitacaoId, Titulo, StatusId, ResponsavelUsuarioId }

Recomendação: front deve se inscrever no grupo da solicitação para receber updates em tempo real.

## Migração de banco de dados

- Foi incluído um arquivo de migration esquelética: `02 - Data/.../Migrations/20260613_AddTarefa.cs`.
- Passos que o time backend deve executar localmente antes de deploy:
  1. rodar `dotnet ef migrations add AddTarefa` (no projeto Data) para gerar a migration real e snapshot atualizados;
  2. revisar a migration gerada (comparar com o esqueleto) e commitar;
  3. aplicar `dotnet ef database update` em ambiente controlado (staging) com backup e janela de manutenção se necessário;
  4. depois aplicar em produção conforme processo de deploy da equipe.

## Testes e QA

- Foram adicionados testes unitários básicos que cobrem criação e validações de tarefas no arquivo de testes existente.
- Recomenda-se adicionar testes de concorrência (simulação de atualizações paralelas) e testes de integração com SignalR.

## Observações e riscos

- A coluna `RowVersion` (bytea) foi usada como concurrency token. Validar comportamento com provider Npgsql em ambiente de staging.
- Operações que envolvam gravação em Postgres (tarefa) e MongoDB (mídia) não são transacionais; podem ocorrer inconsistências. Planejar compensação/retry quando necessário.
- Em cenários de alta escala, considerar backplane (Redis) para SignalR.

## Contato

Para dúvidas sobre os contratos ou ajustes no front, contate a equipe backend responsável pelo projeto.

