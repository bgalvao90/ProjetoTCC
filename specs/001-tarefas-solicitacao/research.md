# Research: Tarefas em Solicitacoes

## Contrato prioritario

**Decision**: usar `changes.md` e respostas observadas da API como contrato vigente.  
**Rationale**: a spec foi escrita antes da implementacao backend e diverge em IDs,
verbos HTTP, paginacao, midia e concorrencia.  
**Alternatives considered**: implementar a spec idealizada no frontend; rejeitado
porque produziria requests incompatíveis.

## Concorrencia

**Decision**: nao implementar retry automatico ate `RowVersion` ser exposta e o
HTTP 409 ser validado.  
**Rationale**: retry sem token de concorrencia pode sobrescrever dados ou repetir
operacoes indefinidamente.  
**Alternatives considered**: refetch e retry cego; rejeitado por risco de perda.

## Realtime

**Decision**: manter realtime fora do caminho critico ate cliente SignalR e contrato
de grupo/eventos serem aprovados.  
**Rationale**: o frontend nao possui dependencia SignalR e o backend documenta apenas
`NovaTarefa` e `TarefaAtualizada`.  
**Alternatives considered**: adicionar biblioteca imediatamente; rejeitado por
governanca de `package.json`.

## Paginacao

**Decision**: usar lista simples e retirar paginacao do MVP inicial; implementar
paginacao somente depois de contrato backend.  
**Rationale**: endpoint atual retorna `IReadOnlyList<TarefaDto>`, sem metadados.  
**Alternatives considered**: paginacao local; rejeitada porque nao reduz trafego.

## Midia

**Decision**: remover midia do formulario do MVP inicial e exigir upload integrado
antes de reativar a funcionalidade.  
**Rationale**: a spec descreve N:M, mas a API atual suporta apenas um ID.  
**Alternatives considered**: entrada manual de `MidiaId` e array local; rejeitados
por UX insegura e incompatibilidade.

## Testes

**Decision**: tratar infraestrutura de testes como gate de governanca.  
**Rationale**: nao ha runner, scripts ou dependencias de teste e `package.json` e
intocavel.  
**Alternatives considered**: apenas type-check e bundle; aceitos como verificacao
temporaria, insuficientes para producao.
