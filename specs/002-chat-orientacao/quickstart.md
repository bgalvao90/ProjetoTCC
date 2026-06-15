# Quickstart de Validacao: Chat de Orientacao

## Pre-requisitos

- API e bancos em ambiente controlado.
- Professor e ao menos dois alunos.
- Dois clientes conectados simultaneamente.
- Push configurado em ao menos um dispositivo.

## Fluxos criticos

1. Aluno cria solicitacao com dois anexos validos e confirma limite/tipos invalidos.
2. Professor aceita, adiciona segundo aluno e confirma chat em tempo real.
3. Participantes enviam Markdown, arquivo e link; confirmam leitura e preview seguro.
4. Autor edita e remove mensagem antes de 15 minutos; confirma bloqueio depois disso.
5. Participante cria tarefa com passos; primeiro passo inicia e ultimo conclui.
6. Confirmar bloqueio de edicao em tarefa concluida, reabrir e editar.
7. Professor pausa, reativa, finaliza e reabre; validar eventos e modo somente leitura.
8. Remover aluno e confirmar perda imediata de acesso sem apagar historico.
9. Desconectar SignalR, gerar eventos, reconectar e confirmar sincronizacao.
10. Validar push sem duplicacao e sem conteudo sensivel.

## Validacoes obrigatorias

```text
Frontend: type-check, testes, Android, iOS e Web
Backend: unitarios, integracao, migrations e contratos
Seguranca: autorizacao, upload, Markdown, SSRF, auditoria
```

Nenhuma tarefa de integracao, SignalR, push ou GridFS pode ser concluida apenas por
inspecao de codigo; exige evidencia executavel.
