import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";
import type { TimelineItemDto } from "../types";
import { MarkdownContent } from "./MarkdownContent";

type Props = { item: TimelineItemDto; mine: boolean };

export function TimelineItem({ item, mine }: Props) {
  const isSystem = item.Tipo === "EventoSistema" || item.Tipo === "Tarefa";
  if (isSystem) {
    return (
      <View style={styles.system}>
        <Text style={styles.systemText}>{item.ConteudoMarkdown}</Text>
        <Text style={styles.date}>{new Date(item.CriadoEm).toLocaleString("pt-BR")}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.message, mine ? styles.mine : styles.other]}>
      <Text style={styles.type}>{item.Tipo}</Text>
      <MarkdownContent content={item.RemovidoEm ? "Mensagem removida" : item.ConteudoMarkdown || ""} />
      <Text style={styles.date}>
        {new Date(item.CriadoEm).toLocaleString("pt-BR")}
        {item.EditadoEm ? " · editada" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  message: { borderRadius: theme.radius.md, marginVertical: theme.spacing.xs, maxWidth: "88%", padding: theme.spacing.md },
  mine: { alignSelf: "flex-end", backgroundColor: "#ead7da" },
  other: { alignSelf: "flex-start", backgroundColor: theme.colors.surface },
  type: { color: theme.colors.muted, fontSize: 11, fontWeight: "700", marginBottom: theme.spacing.xs },
  date: { color: theme.colors.muted, fontSize: 10, marginTop: theme.spacing.xs },
  system: { alignSelf: "center", backgroundColor: "#efe7d6", borderRadius: theme.radius.md, marginVertical: theme.spacing.sm, padding: theme.spacing.sm },
  systemText: { color: theme.colors.muted, fontSize: 12, textAlign: "center" },
});
