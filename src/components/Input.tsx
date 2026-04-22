import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { theme } from "../styles/theme";

type Props = TextInputProps & {
  label: string;
};

export function Input({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...rest} placeholderTextColor={theme.colors.muted} style={[styles.input, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: { color: theme.colors.muted, marginBottom: 6, fontSize: 14 },
  input: {
    backgroundColor: theme.colors.input,
    color: theme.colors.text,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
