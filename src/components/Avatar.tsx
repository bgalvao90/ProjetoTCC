import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";

export function Avatar({ nome }: { nome: string }) {
  const initials = nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U";
  return (
    <View style={styles.avatar}>
      <Text style={styles.text}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 48, height: 48, borderRadius: 8, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontWeight: "800" },
});
