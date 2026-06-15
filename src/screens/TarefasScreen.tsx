import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { TarefaCard } from "../components/TarefaCard";
import { TarefaForm } from "../components/TarefaForm";
import { useAuth } from "../hooks/useAuth";
import { useTarefas } from "../hooks/useTarefas";
import { theme } from "../styles/theme";
import {
  CriarTarefaRequest,
  ParticipanteTarefa,
  TarefaDto,
  TarefaStatus,
} from "../types";
import {
  isSolicitacaoSomenteLeitura,
  podeEditarTarefa,
} from "../utils/tarefa";
import { getErrorMessage } from "../utils/validation";

type Props = {
  solicitacaoId: number;
  statusSolicitacao: string;
  participantes: ParticipanteTarefa[];
};

export function TarefasScreen({
  solicitacaoId,
  statusSolicitacao,
  participantes,
}: Props) {
  const { usuario } = useAuth();
  const isParticipante = participantes.some(
    (participante) => participante.UsuarioId === usuario?.UsuarioId,
  );
  const { tarefas, loading, busy, error, listar, criar, atualizar, alterarStatus } =
    useTarefas(solicitacaoId, isParticipante);
  const [formVisible, setFormVisible] = useState(false);
  const [selected, setSelected] = useState<TarefaDto | null>(null);
  const isReadOnly = isSolicitacaoSomenteLeitura(statusSolicitacao);
  if (!isParticipante) {
    return (
      <EmptyState
        title="Acesso negado"
        description="Apenas participantes da solicitacao podem visualizar tarefas."
      />
    );
  }

  function openForm(tarefa: TarefaDto | null) {
    setSelected(tarefa);
    setFormVisible(true);
  }

  async function submit(request: CriarTarefaRequest) {
    try {
      const isEditing = Boolean(selected);
      if (selected) await atualizar(selected.TarefaId, request);
      else await criar(request);
      setFormVisible(false);
      setSelected(null);
      Alert.alert(
        "Sucesso",
        isEditing ? "Tarefa atualizada com sucesso." : "Tarefa criada com sucesso.",
      );
    } catch (nextError) {
      Alert.alert("Erro ao salvar tarefa", getErrorMessage(nextError));
    }
  }

  return (
    <>
      {isReadOnly ? (
        <Text style={styles.warning}>Solicitacao encerrada: tarefas somente leitura.</Text>
      ) : (
        <Button title="Nova tarefa" onPress={() => openForm(null)} />
      )}
      {loading ? <Loading /> : null}
      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <Button title="Tentar novamente" variant="outline" onPress={listar} />
        </>
      ) : null}
      {!loading && !error && tarefas.length === 0 ? (
        <>
          <EmptyState
            title="Nenhuma tarefa criada"
            description={isReadOnly ? undefined : "Use Nova tarefa para comecar."}
          />
          {!isReadOnly ? (
            <Button
              title="Criar primeira tarefa"
              variant="outline"
              onPress={() => openForm(null)}
            />
          ) : null}
        </>
      ) : null}
      {!loading && !error && tarefas.length > 0 ? (
        <Text style={styles.summary}>
          Exibindo {tarefas.length} tarefa(s) retornada(s) pela API. Paginacao
          ainda nao esta disponivel neste MVP.
        </Text>
      ) : null}
      {tarefas.map((tarefa) => (
        <TarefaCard
          key={tarefa.TarefaId}
          tarefa={tarefa}
          responsavelNome={
            participantes.find(
              (participante) =>
                participante.UsuarioId === tarefa.ResponsavelUsuarioId,
            )?.Nome
          }
          disabled={!podeEditarTarefa(tarefa, statusSolicitacao, isParticipante)}
          onPress={
            tarefa.StatusId === TarefaStatus.Concluida
              ? () =>
                  Alert.alert(
                    "Tarefa concluida",
                    "Tarefa concluida nao pode ser editada.",
                  )
              : () => openForm(tarefa)
          }
          onStatusChange={(status) =>
            alterarStatus(tarefa.TarefaId, tarefa.StatusId, status)
              .then(() =>
                Alert.alert("Sucesso", "Status alterado com sucesso."),
              )
              .catch((nextError) =>
                Alert.alert(
                  "Erro ao alterar status",
                  getErrorMessage(nextError),
                ),
              )
          }
        />
      ))}
      <AppModal
        visible={formVisible}
        title={selected ? "Editar tarefa" : "Nova tarefa"}
        onClose={() => setFormVisible(false)}
      >
        <TarefaForm
          solicitacaoId={solicitacaoId}
          tarefa={selected}
          participantes={participantes}
          busy={busy}
          disabled={isReadOnly || selected?.StatusId === TarefaStatus.Concluida}
          onSubmit={submit}
          onCancel={() => setFormVisible(false)}
        />
      </AppModal>
    </>
  );
}

const styles = StyleSheet.create({
  warning: { color: theme.colors.warning, fontWeight: "700", marginBottom: theme.spacing.md },
  error: { color: theme.colors.danger, marginVertical: theme.spacing.md },
  summary: { color: theme.colors.muted, marginVertical: theme.spacing.sm },
});
