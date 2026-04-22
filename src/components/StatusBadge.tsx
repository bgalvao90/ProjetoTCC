import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color = normalized.includes("aceit")
    ? theme.colors.success
    : normalized.includes("recus")
      ? theme.colors.danger
      : normalized.includes("final")
        ? theme.colors.muted
        : theme.colors.warning;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  text: { fontSize: 12, fontWeight: "700" },
});
