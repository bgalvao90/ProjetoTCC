import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { MessageComposer } from "../components/MessageComposer";
import { OrientacaoActionsMenu } from "../components/OrientacaoActionsMenu";
import { OrientacaoHeader } from "../components/OrientacaoHeader";
import { ParticipantesModal } from "../components/ParticipantesModal";
import { TarefaForm } from "../components/TarefaForm";
import { TarefasAtivasPanel } from "../components/TarefasAtivasPanel";
import { TimelineItem } from "../components/TimelineItem";
import { useAuth } from "../hooks/useAuth";
import { useOrientacaoRealtime } from "../hooks/useOrientacaoRealtime";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useTimeline } from "../hooks/useTimeline";
import { anexoService } from "../services/anexoService";
import { orientacaoService } from "../services/orientacaoService";
import { tarefaService } from "../services/tarefaService";
import { theme } from "../styles/theme";
import type {
  CriarTarefaRequest,
  OrientacaoDto,
  OrientacaoStatus,
  ParticipanteTarefa,
  TarefaDto,
  TarefaStatus,
} from "../types";
import { getErrorMessage, validateSelectedFile } from "../utils/validation";
import { Screen } from "./Screen";

export function SolicitacaoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const solicitacaoId = Number(id);
  const [orientacao, setOrientacao] = useState<OrientacaoDto | null>(null);
  const [tarefas, setTarefas] = useState<TarefaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionsVisible, setActionsVisible] = useState(false);
  const [participantsVisible, setParticipantsVisible] = useState(false);
  const [tasksVisible, setTasksVisible] = useState(false);
  const [taskFormVisible, setTaskFormVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrientacaoStatus | null>(null);
  const [uploading, setUploading] = useState(false);
  usePushNotifications();

  const {
    itens,
    loading: timelineLoading,
    loadingMore,
    busy,
    error,
    recarregar,
    carregarMais,
    enviarMensagem,
  } = useTimeline(solicitacaoId, Boolean(orientacao));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [nextOrientacao, nextTarefas] = await Promise.all([
        orientacaoService.obter(solicitacaoId),
        tarefaService.listar(solicitacaoId).catch(() => []),
      ]);
      setOrientacao(nextOrientacao);
      setTarefas(nextTarefas);
    } catch (nextError) {
      Alert.alert("Erro ao carregar orientacao", getErrorMessage(nextError));
    } finally {
      setLoading(false);
    }
  }, [solicitacaoId]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));
  const handleRealtimeChanged = useCallback(() => {
    load();
    recarregar();
  }, [load, recarregar]);
  const { realtimeError } = useOrientacaoRealtime(
    solicitacaoId,
    handleRealtimeChanged,
    Boolean(orientacao),
  );

  if (loading || !orientacao) {
    return <Screen protectedRoute><Loading /></Screen>;
  }

  const isProfessor = usuario?.UsuarioId === orientacao.ProfessorUsuarioId;
  const isReadOnly = orientacao.StatusId !== 2;
  const participantesTarefa: ParticipanteTarefa[] = (orientacao.Participantes ?? []).map(
    (participante) => ({ UsuarioId: participante.UsuarioId, Nome: participante.Nome }),
  );

  function changeStatus(status: OrientacaoStatus) {
    setActionsVisible(false);
    setPendingStatus(status);
  }

  async function confirmStatusChange() {
    if (!pendingStatus) return;
    try {
      setOrientacao(await orientacaoService.alterarStatus(solicitacaoId, {
        NovoStatusId: pendingStatus,
        Versao: orientacao!.Versao,
      }));
      setPendingStatus(null);
      await recarregar();
    } catch (nextError) {
      Alert.alert("Erro", getErrorMessage(nextError));
    }
  }

  async function attach() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
      if (result.canceled) return;
      const selected = result.assets[0];
      const fileError = validateSelectedFile(selected);
      if (fileError) throw new Error(fileError);
      setUploading(true);
      const midia = await anexoService.upload(solicitacaoId, selected);
      await enviarMensagem(`Arquivo anexado: **${midia.NomeArquivo}**`, midia.MidiaId);
    } catch (nextError) {
      Alert.alert("Erro ao anexar arquivo", getErrorMessage(nextError));
    } finally {
      setUploading(false);
    }
  }

  async function createTask(request: CriarTarefaRequest) {
    try {
      await tarefaService.criar(solicitacaoId, request);
      setTaskFormVisible(false);
      await load();
      await recarregar();
    } catch (nextError) {
      Alert.alert("Erro ao criar tarefa", getErrorMessage(nextError));
    }
  }

  async function changeTaskStatus(tarefa: TarefaDto, novoStatus: TarefaStatus) {
    try {
      const updated = await tarefaService.alterarStatus(
        solicitacaoId,
        tarefa.TarefaId,
        tarefa.StatusId,
        novoStatus,
      );
      setTarefas((current) =>
        current.map((item) => item.TarefaId === updated.TarefaId ? updated : item),
      );
      await recarregar();
    } catch (nextError) {
      Alert.alert("Erro ao alterar status", getErrorMessage(nextError));
    }
  }

  return (
    <Screen protectedRoute scrollable={false}>
      <OrientacaoHeader
        orientacao={orientacao}
        onOpenActions={() => setActionsVisible(true)}
        onOpenParticipants={() => setParticipantsVisible(true)}
        onOpenTasks={() => setTasksVisible(true)}
      />
      {realtimeError ? <Text style={styles.warning}>Tempo real indisponivel. Atualize manualmente.</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {timelineLoading ? <Loading /> : (
        <FlatList
          inverted
          data={itens}
          contentContainerStyle={styles.timeline}
          keyExtractor={(item) => String(item.TimelineItemId)}
          renderItem={({ item }) => <TimelineItem item={item} mine={item.AutorUsuarioId === usuario?.UsuarioId} />}
          onEndReached={carregarMais}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <Loading /> : null}
        />
      )}
      {isReadOnly ? <Text style={styles.readOnly}>Orientacao em modo somente leitura: {orientacao.Status}.</Text> : null}
      <MessageComposer disabled={isReadOnly} busy={busy || uploading} onAttach={attach} onSend={(content) => enviarMensagem(content).catch((nextError) => Alert.alert("Erro", getErrorMessage(nextError)))} />
      <OrientacaoActionsMenu
        visible={actionsVisible}
        isProfessor={isProfessor}
        statusId={orientacao.StatusId}
        onClose={() => setActionsVisible(false)}
        onChangeStatus={changeStatus}
        onNewTask={() => { setActionsVisible(false); setTaskFormVisible(true); }}
      />
      <ParticipantesModal visible={participantsVisible} participantes={orientacao.Participantes ?? []} onClose={() => setParticipantsVisible(false)} />
      <TarefasAtivasPanel
        visible={tasksVisible}
        tarefas={tarefas.filter((tarefa) => tarefa.StatusId !== 3)}
        disabled={isReadOnly}
        onClose={() => setTasksVisible(false)}
        onStatusChange={changeTaskStatus}
      />
      <AppModal visible={taskFormVisible} title="Nova tarefa" onClose={() => setTaskFormVisible(false)}>
        <TarefaForm solicitacaoId={solicitacaoId} participantes={participantesTarefa} onSubmit={createTask} onCancel={() => setTaskFormVisible(false)} />
      </AppModal>
      <AppModal
        visible={pendingStatus !== null}
        title="Confirmar alteracao"
        onClose={() => setPendingStatus(null)}
      >
        <Text>Deseja alterar o status desta orientacao?</Text>
        <Button title="Confirmar alteracao" onPress={confirmStatusChange} />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  timeline: { padding: theme.spacing.md },
  warning: { color: theme.colors.warning, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
  error: { color: theme.colors.danger, padding: theme.spacing.md },
  readOnly: { backgroundColor: "#efe7d6", color: theme.colors.muted, padding: theme.spacing.sm, textAlign: "center" },
});
