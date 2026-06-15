import { api } from "../api/client";
import type { CriarMensagemRequest, TimelinePageDto } from "../types";

export const timelineService = {
  async listar(solicitacaoId: number, cursor?: number | null, limit = 30) {
    const { data } = await api.get<TimelinePageDto>(
      `/solicitacoes/${solicitacaoId}/timeline`,
      { params: { cursor: cursor ?? undefined, limit } },
    );
    return data;
  },
  async enviarMensagem(solicitacaoId: number, conteudo: string, midiaId?: string | null) {
    const request: CriarMensagemRequest = {
      SolicitacaoId: solicitacaoId,
      Conteudo: conteudo,
      MidiaId: midiaId ?? null,
    };
    const { data } = await api.post("/mensagens", request);
    return data;
  },
  async marcarLeituras(solicitacaoId: number, mensagemIds: number[]) {
    await api.post(`/solicitacoes/${solicitacaoId}/mensagens/leituras`, {
      MensagemIds: mensagemIds,
    });
  },
};
