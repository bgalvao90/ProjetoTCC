import { api } from "../api/client";
import {
  AtualizarTarefaRequest,
  CriarTarefaRequest,
  TarefaDto,
  TarefaStatus,
} from "../types";
import {
  validarDescricaoTarefa,
  validarTituloTarefa,
  validarTransicaoTarefa,
} from "../utils/tarefa";

function validarRequest(request: CriarTarefaRequest) {
  const error =
    validarTituloTarefa(request.Titulo) ||
    validarDescricaoTarefa(request.Descricao ?? "");
  if (error) throw new Error(error);
}

export const tarefaService = {
  async criar(solicitacaoId: number, request: CriarTarefaRequest) {
    validarRequest(request);
    const { data } = await api.post<TarefaDto>(
      `/solicitacoes/${solicitacaoId}/tarefas`,
      { ...request, SolicitacaoId: solicitacaoId },
    );
    return data;
  },

  async listar(solicitacaoId: number) {
    const { data } = await api.get<TarefaDto[]>(
      `/solicitacoes/${solicitacaoId}/tarefas`,
    );
    return data;
  },

  async obter(solicitacaoId: number, tarefaId: number) {
    const { data } = await api.get<TarefaDto>(
      `/solicitacoes/${solicitacaoId}/tarefas/${tarefaId}`,
    );
    return data;
  },

  async atualizar(
    solicitacaoId: number,
    tarefaId: number,
    request: AtualizarTarefaRequest,
  ) {
    validarRequest(request);
    const { data } = await api.put<TarefaDto>(
      `/solicitacoes/${solicitacaoId}/tarefas/${tarefaId}`,
      { ...request, SolicitacaoId: solicitacaoId },
    );
    return data;
  },

  async alterarStatus(
    solicitacaoId: number,
    tarefaId: number,
    statusAtual: TarefaStatus,
    novoStatusId: TarefaStatus,
  ) {
    if (!validarTransicaoTarefa(statusAtual, novoStatusId)) {
      throw new Error("Transicao de status invalida.");
    }
    const { data } = await api.put<TarefaDto>(
      `/solicitacoes/${solicitacaoId}/tarefas/${tarefaId}/status`,
      novoStatusId,
    );
    return data;
  },
};
