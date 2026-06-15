import { useEffect, useState } from "react";
import { realtimeService } from "../services/realtimeService";
import { getErrorMessage } from "../utils/validation";

export function useOrientacaoRealtime(
  solicitacaoId: number,
  onChanged: () => void,
  enabled = true,
) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let dispose: (() => void) | undefined;
    realtimeService
      .conectar(solicitacaoId, onChanged)
      .then((nextDispose) => {
        dispose = nextDispose;
        setError(null);
      })
      .catch((nextError) => setError(getErrorMessage(nextError)));
    return () => dispose?.();
  }, [enabled, onChanged, solicitacaoId]);

  return { realtimeError: error };
}
