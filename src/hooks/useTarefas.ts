import { useCallback, useEffect, useState } from "react";
import { tarefaService } from "../services/tarefaService";
import {
  AtualizarTarefaRequest,
  CriarTarefaRequest,
  TarefaDto,
  TarefaStatus,
} from "../types";
import { getErrorMessage } from "../utils/validation";

function ordenarTarefas(tarefas: TarefaDto[]) {
  return [...tarefas].sort((left, right) => {
    const byDate =
      new Date(left.DataCriacao).getTime() - new Date(right.DataCriacao).getTime();
    return byDate || left.TarefaId - right.TarefaId;
  });
}

export function useTarefas(solicitacaoId: number, enabled = true) {
  const [tarefas, setTarefas] = useState<TarefaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listar = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setTarefas(ordenarTarefas(await tarefaService.listar(solicitacaoId)));
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [enabled, solicitacaoId]);

  useEffect(() => {
    listar();
  }, [listar]);

  const run = useCallback(async (operation: () => Promise<TarefaDto>) => {
    try {
      setBusy(true);
      setError(null);
      const tarefa = await operation();
      setTarefas((current) => {
        const exists = current.some((item) => item.TarefaId === tarefa.TarefaId);
        const next = exists
          ? current.map((item) => (item.TarefaId === tarefa.TarefaId ? tarefa : item))
          : [tarefa, ...current];
        return ordenarTarefas(next);
      });
      return tarefa;
    } catch (nextError) {
      setError(getErrorMessage(nextError));
      throw nextError;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    tarefas,
    loading,
    busy,
    error,
    listar,
    criar: (request: CriarTarefaRequest) =>
      run(() => tarefaService.criar(solicitacaoId, request)),
    atualizar: (tarefaId: number, request: AtualizarTarefaRequest) =>
      run(() => tarefaService.atualizar(solicitacaoId, tarefaId, request)),
    alterarStatus: (
      tarefaId: number,
      statusAtual: TarefaStatus,
      novoStatus: TarefaStatus,
    ) =>
      run(() =>
        tarefaService.alterarStatus(
          solicitacaoId,
          tarefaId,
          statusAtual,
          novoStatus,
        ),
      ),
  };
}
