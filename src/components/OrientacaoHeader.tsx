import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../styles/theme";
import type { OrientacaoDto } from "../types";
import { StatusBadge } from "./StatusBadge";

type Props = {
  orientacao: OrientacaoDto;
  onOpenActions: () => void;
  onOpenParticipants: () => void;
  onOpenTasks: () => void;
};

export function OrientacaoHeader({
  orientacao,
  onOpenActions,
  onOpenParticipants,
  onOpenTasks,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title} numberOfLines={1}>{orientacao.TituloTcc}</Text>
        <StatusBadge status={orientacao.Status} />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onOpenParticipants}><Text style={styles.action}>Participantes</Text></TouchableOpacity>
        <TouchableOpacity onPress={onOpenTasks}><Text style={styles.action}>Tarefas</Text></TouchableOpacity>
        <TouchableOpacity onPress={onOpenActions}><Text style={styles.more}>...</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border, borderBottomWidth: 1, padding: theme.spacing.md },
  titleArea: { gap: theme.spacing.xs },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  actions: { flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.sm },
  action: { color: theme.colors.primary, fontWeight: "700" },
  more: { color: theme.colors.text, fontSize: 22, fontWeight: "800" },
});
