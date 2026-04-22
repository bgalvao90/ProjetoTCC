import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { theme } from "../styles/theme";

type Props = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
  loading?: boolean;
};

export function Button({ title, variant = "primary", loading, disabled, style, ...rest }: Props) {
  return (
    <TouchableOpacity
      {...rest}
      disabled={disabled || loading}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, variant !== "primary" && styles.textOutline]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: theme.radius.md, paddingVertical: 15, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", marginTop: 10 },
  primary: { backgroundColor: theme.colors.primary },
  outline: { borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: "transparent" },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: theme.colors.danger },
  disabled: { opacity: 0.65 },
  text: { color: "#fff", fontWeight: "700", fontSize: 16 },
  textOutline: { color: theme.colors.primary },
});
