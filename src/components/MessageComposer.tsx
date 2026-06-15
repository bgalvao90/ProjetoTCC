import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { theme } from "../styles/theme";
import { Button } from "./Button";

type Props = {
  disabled?: boolean;
  busy?: boolean;
  onSend: (content: string) => void;
  onAttach: () => void;
};

export function MessageComposer({ disabled, busy, onSend, onAttach }: Props) {
  const [content, setContent] = useState("");
  return (
    <View style={styles.container}>
      <View style={styles.attach}>
        <Button title="+" variant="outline" disabled={disabled || busy} onPress={onAttach} />
      </View>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Mensagem em Markdown"
        placeholderTextColor={theme.colors.muted}
        multiline
        editable={!disabled && !busy}
        style={styles.input}
      />
      <Button
        title="Enviar"
        loading={busy}
        disabled={disabled || !content.trim()}
        onPress={() => {
          onSend(content.trim());
          setContent("");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "flex-end", backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, borderTopWidth: 1, flexDirection: "row", gap: theme.spacing.sm, padding: theme.spacing.sm },
  attach: { width: 46 },
  input: { backgroundColor: theme.colors.input, borderColor: theme.colors.border, borderRadius: theme.radius.md, borderWidth: 1, color: theme.colors.text, flex: 1, maxHeight: 110, minHeight: 46, padding: theme.spacing.sm },
});
