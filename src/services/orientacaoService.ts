import { api } from "../api/client";
import type {
  AdicionarAlunoOrientacaoRequest,
  AlterarStatusOrientacaoRequest,
  OrientacaoDto,
  ParticipanteOrientacaoDto,
} from "../types";

export const orientacaoService = {
  async obter(id: number) {
    const { data } = await api.get<OrientacaoDto>(`/solicitacoes/${id}`);
    return data;
  },
  async alterarStatus(id: number, request: AlterarStatusOrientacaoRequest) {
    const { data } = await api.put<OrientacaoDto>(`/solicitacoes/${id}/status`, request);
    return data;
  },
  async listarParticipantes(id: number) {
    const { data } = await api.get<ParticipanteOrientacaoDto[]>(
      `/solicitacoes/${id}/participantes`,
    );
    return data;
  },
  async adicionarAluno(id: number, request: AdicionarAlunoOrientacaoRequest) {
    const { data } = await api.post<ParticipanteOrientacaoDto>(
      `/solicitacoes/${id}/participantes/alunos`,
      request,
    );
    return data;
  },
  async removerAluno(id: number, usuarioId: number) {
    await api.delete(`/solicitacoes/${id}/participantes/alunos/${usuarioId}`);
  },
};
