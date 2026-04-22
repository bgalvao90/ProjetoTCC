import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg, alignItems: "center" },
  title: { color: theme.colors.text, fontWeight: "700", fontSize: 16, textAlign: "center" },
  description: { color: theme.colors.muted, marginTop: 8, textAlign: "center" },
});
