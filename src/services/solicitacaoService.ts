import { api } from "../api/client";
import { CriarSolicitacaoRequest, RecusarSolicitacaoRequest, SolicitacaoDto } from "../types";

type NovaSolicitacao = Omit<CriarSolicitacaoRequest, "ProfessorUsuarioId">;

export const solicitacaoService = {
  async criar(request: CriarSolicitacaoRequest) {
    const { data } = await api.post<SolicitacaoDto>("/solicitacoes", request);
    return data;
  },
  async criarParaProfessor(professorId: number, request: NovaSolicitacao) {
    return this.criar({ ProfessorUsuarioId: professorId, ...request });
  },
  async minhas() {
    const { data } = await api.get<SolicitacaoDto[]>("/solicitacoes/minhas");
    return data;
  },
  async obter(id: number) {
    const { data } = await api.get<SolicitacaoDto>(`/solicitacoes/${id}`);
    return data;
  },
  async aceitar(id: number) {
    const { data } = await api.put<SolicitacaoDto>(`/solicitacoes/${id}/aceitar`);
    return data;
  },
  async recusar(id: number, request: RecusarSolicitacaoRequest) {
    const { data } = await api.put<SolicitacaoDto>(`/solicitacoes/${id}/recusar`, request);
    return data;
  },
  async finalizar(id: number) {
    const { data } = await api.put<SolicitacaoDto>(`/solicitacoes/${id}/finalizar`);
    return data;
  },
};
