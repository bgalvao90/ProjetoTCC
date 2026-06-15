import { theme } from "../styles/theme";
import { TarefaDto, TarefaStatus } from "../types";

export function getTarefaStatusLabel(status: TarefaStatus) {
  if (status === TarefaStatus.EmProgresso) return "Em progresso";
  if (status === TarefaStatus.Concluida) return "Concluida";
  return "Pendente";
}

export function getTarefaStatusColor(status: TarefaStatus) {
  if (status === TarefaStatus.EmProgresso) return theme.colors.primary;
  if (status === TarefaStatus.Concluida) return theme.colors.success;
  return theme.colors.warning;
}

export function getProximoTarefaStatus(status: TarefaStatus) {
  if (status === TarefaStatus.Pendente) return TarefaStatus.EmProgresso;
  if (status === TarefaStatus.EmProgresso) return TarefaStatus.Concluida;
  return null;
}

export function validarTituloTarefa(titulo: string) {
  const length = titulo.trim().length;
  if (length === 0) return "Informe o titulo da tarefa.";
  if (length > 180) return "O titulo deve ter no maximo 180 caracteres.";
  return null;
}

export function validarDescricaoTarefa(descricao: string) {
  if (descricao.length > 4000) {
    return "A descricao deve ter no maximo 4000 caracteres.";
  }
  return null;
}

export function isSolicitacaoSomenteLeitura(status: string) {
  const normalized = status.toLowerCase();
  return normalized.includes("final") || normalized.includes("recus");
}

export function validarTransicaoTarefa(
  statusAtual: TarefaStatus,
  novoStatus: TarefaStatus,
) {
  return getProximoTarefaStatus(statusAtual) === novoStatus;
}

export function podeEditarTarefa(
  tarefa: TarefaDto,
  statusSolicitacao: string,
  isParticipante: boolean,
) {
  return (
    isParticipante &&
    !isSolicitacaoSomenteLeitura(statusSolicitacao) &&
    tarefa.StatusId !== TarefaStatus.Concluida
  );
}

export function formatarDataTarefa(data?: string | null) {
  return data ? new Date(data).toLocaleString("pt-BR") : "";
}
