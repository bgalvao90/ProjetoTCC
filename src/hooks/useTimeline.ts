import { useCallback, useEffect, useState } from "react";
import { timelineService } from "../services/timelineService";
import type { TimelineItemDto } from "../types";
import { getErrorMessage } from "../utils/validation";

function mergeTimeline(current: TimelineItemDto[], incoming: TimelineItemDto[]) {
  const items = new Map(current.map((item) => [item.TimelineItemId, item]));
  incoming.forEach((item) => items.set(item.TimelineItemId, item));
  return [...items.values()].sort((left, right) => right.TimelineItemId - left.TimelineItemId);
}

export function useTimeline(solicitacaoId: number, enabled = true) {
  const [itens, setItens] = useState<TimelineItemDto[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const page = await timelineService.listar(solicitacaoId);
      setItens(page.Itens);
      setCursor(page.ProximoCursor ?? null);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [enabled, solicitacaoId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const carregarMais = useCallback(async () => {
    if (!cursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const page = await timelineService.listar(solicitacaoId, cursor);
      setItens((current) => mergeTimeline(current, page.Itens));
      setCursor(page.ProximoCursor ?? null);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, solicitacaoId]);

  const enviarMensagem = useCallback(
    async (conteudo: string, midiaId?: string | null) => {
      try {
        setBusy(true);
        await timelineService.enviarMensagem(solicitacaoId, conteudo, midiaId);
        await recarregar();
      } finally {
        setBusy(false);
      }
    },
    [recarregar, solicitacaoId],
  );

  return {
    itens,
    loading,
    loadingMore,
    busy,
    error,
    hasMore: Boolean(cursor),
    recarregar,
    carregarMais,
    enviarMensagem,
  };
}
