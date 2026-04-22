import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../styles/theme";
import { UniversidadeDto } from "../types";
import { getUniversidadeId, getUniversidadeNome } from "../utils/universidade";

type Props = {
  label: string;
  value: number | null;
  universidades: UniversidadeDto[];
  loading?: boolean;
  onChange: (id: number) => void;
};

export function UniversidadeSelect({ label, value, universidades, loading, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {universidades.map((universidade) => {
          const id = getUniversidadeId(universidade);
          const selected = id === value;

          return (
            <TouchableOpacity
              key={String(id)}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => onChange(id)}
              disabled={loading}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{getUniversidadeNome(universidade)}</Text>
            </TouchableOpacity>
          );
        })}
        {!universidades.length && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{loading ? "Carregando universidades..." : "Nenhuma universidade encontrada"}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: theme.spacing.md },
  label: { color: "#cbd5e1", marginBottom: 6, fontSize: 14 },
  options: { gap: 8 },
  option: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionSelected: { borderColor: theme.colors.primary },
  optionText: { color: theme.colors.text, fontSize: 16 },
  optionTextSelected: { color: theme.colors.primary, fontWeight: "700" },
  empty: {
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyText: { color: theme.colors.muted },
});
