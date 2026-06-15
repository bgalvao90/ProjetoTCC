import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../styles/theme";
import { ParticipanteTarefa } from "../types";

type Props = {
  participantes: ParticipanteTarefa[];
  value: number | null;
  disabled?: boolean;
  onChange: (usuarioId: number | null) => void;
};

export function ResponsavelSelect({
  participantes,
  value,
  disabled,
  onChange,
}: Props) {
  const options: ParticipanteTarefa[] = [
    { UsuarioId: 0, Nome: "Sem atribuicao" },
    ...participantes,
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Responsavel</Text>
      <View style={styles.options}>
        {options.map((participante) => {
          const id = participante.UsuarioId || null;
          const selected = id === value;
          return (
            <TouchableOpacity
              key={String(participante.UsuarioId)}
              disabled={disabled}
              style={[
                styles.option,
                selected && styles.selected,
                disabled && styles.disabled,
              ]}
              onPress={() => onChange(id)}
            >
              <Text style={[styles.text, selected && styles.selectedText]}>
                {participante.Nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: { color: theme.colors.muted, fontSize: 14, marginBottom: theme.spacing.xs },
  options: { gap: theme.spacing.xs },
  option: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.sm,
  },
  selected: { borderColor: theme.colors.primary },
  disabled: { opacity: 0.65 },
  text: { color: theme.colors.text },
  selectedText: { color: theme.colors.primary, fontWeight: "700" },
});
