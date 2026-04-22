import { api } from "../api/client";
import { CriarMensagemRequest, MensagemDto } from "../types";

export const mensagemService = {
  async listarPorSolicitacao(solicitacaoId: number) {
    const { data } = await api.get<MensagemDto[]>(`/solicitacoes/${solicitacaoId}/mensagens`);
    return data;
  },
  async enviar(request: CriarMensagemRequest) {
    const { data } = await api.post<MensagemDto>("/mensagens", request);
    return data;
  },
};
