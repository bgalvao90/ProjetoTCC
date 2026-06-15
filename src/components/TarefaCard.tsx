import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../styles/theme";
import { TarefaDto, TarefaStatus } from "../types";
import { Card } from "./Card";
import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";
import { StatusSelector } from "./StatusSelector";

type Props = {
  tarefa: TarefaDto;
  onPress?: () => void;
  onStatusChange?: (novoStatus: TarefaStatus) => void;
  disabled?: boolean;
  responsavelNome?: string | null;
};

export function TarefaCard({
  tarefa,
  onPress,
  onStatusChange,
  disabled,
  responsavelNome,
}: Props) {
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress}>
      <Card style={disabled ? styles.disabled : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>{tarefa.Titulo}</Text>
          <StatusBadge status={tarefa.StatusId} />
        </View>
        {tarefa.Descricao ? (
          <Text style={styles.description} numberOfLines={2}>
            {tarefa.Descricao}
          </Text>
        ) : null}
        <View style={styles.responsavel}>
          <Avatar nome={responsavelNome || "Sem atribuicao"} />
          <Text style={styles.muted}>
            {responsavelNome || "Sem atribuicao"}
          </Text>
        </View>
        {tarefa.PossuiMidia ? (
          <Text style={styles.media}>Midia anexada</Text>
        ) : null}
        <Text style={styles.muted}>
          Criada em {new Date(tarefa.DataCriacao).toLocaleString("pt-BR")}
        </Text>
        {tarefa.DataConclusao ? (
          <Text style={styles.completed}>
            Concluida em {new Date(tarefa.DataConclusao).toLocaleString("pt-BR")}
          </Text>
        ) : null}
        {onStatusChange ? (
          <StatusSelector
            statusAtual={tarefa.StatusId}
            disabled={disabled}
            onSelect={onStatusChange}
          />
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: { opacity: 0.65 },
  header: { gap: theme.spacing.sm },
  title: { color: theme.colors.text, fontSize: 17, fontWeight: "700" },
  description: { color: theme.colors.text, lineHeight: 20, marginTop: theme.spacing.sm },
  muted: { color: theme.colors.muted, marginTop: theme.spacing.sm },
  responsavel: { alignItems: "center", flexDirection: "row", gap: theme.spacing.sm },
  media: { color: theme.colors.primary, fontWeight: "700", marginTop: theme.spacing.sm },
  completed: { color: theme.colors.success, fontWeight: "700", marginTop: theme.spacing.sm },
});
