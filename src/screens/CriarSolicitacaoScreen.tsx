import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Loading } from "../components/Loading";
import { professorService } from "../services/professorService";
import { solicitacaoService } from "../services/solicitacaoService";
import { theme } from "../styles/theme";
import { UsuarioDto } from "../types";
import { getErrorMessage } from "../utils/validation";
import { Screen } from "./Screen";

export function CriarSolicitacaoScreen() {
  const { professorId } = useLocalSearchParams<{ professorId?: string }>();
  const [selectedProfessorId, setSelectedProfessorId] = useState(
    professorId || "",
  );
  const [professores, setProfessores] = useState<UsuarioDto[]>([]);
  const [professoresLoading, setProfessoresLoading] = useState(true);
  const [selectOpen, setSelectOpen] = useState(false);
  const [TituloTcc, setTituloTcc] = useState("");
  const [DescricaoTema, setDescricaoTema] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    professorService
      .listar()
      .then(setProfessores)
      .catch((error) => Alert.alert("Erro", getErrorMessage(error)))
      .finally(() => setProfessoresLoading(false));
  }, []);

  const professorSelecionado = useMemo(
    () =>
      professores.find(
        (professor) => String(professor.UsuarioId) === selectedProfessorId,
      ),
    [selectedProfessorId, professores],
  );

  async function handleSubmit() {
    const professor = Number(selectedProfessorId);
    if (!professor || !TituloTcc || !DescricaoTema)
      return Alert.alert("Erro", "Informe professor, titulo e descricao.");
    try {
      setLoading(true);
      const created = await solicitacaoService.criarParaProfessor(professor, {
        TituloTcc,
        DescricaoTema,
      });
      router.replace(`/solicitacoes/${created.SolicitacaoId}`);
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      protectedRoute
      title="Nova solicitação"
      subtitle="Envie seu tema para o professor"
    >
      <Card>
        <Text style={styles.label}>Professor</Text>
        {professoresLoading ? (
          <Loading />
        ) : (
          <View style={styles.selectWrapper}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setSelectOpen((opened) => !opened)}
            >
              <Text
                style={[
                  styles.selectText,
                  !professorSelecionado && styles.placeholder,
                ]}
              >
                {professorSelecionado?.NomeCompleto || "Selecione um professor"}
              </Text>
              <Text style={styles.chevron}>{selectOpen ? "^" : "v"}</Text>
            </TouchableOpacity>
            {selectOpen ? (
              <View style={styles.options}>
                {professores.length ? (
                  professores.map((professor) => (
                    <TouchableOpacity
                      key={professor.UsuarioId}
                      style={[
                        styles.option,
                        String(professor.UsuarioId) === selectedProfessorId &&
                          styles.optionSelected,
                      ]}
                      onPress={() => {
                        setSelectedProfessorId(String(professor.UsuarioId));
                        setSelectOpen(false);
                      }}
                    >
                      <Text style={styles.optionName}>
                        {professor.NomeCompleto}
                      </Text>
                      <Text style={styles.optionEmail}>{professor.Email}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.empty}>Nenhum professor encontrado.</Text>
                )}
              </View>
            ) : null}
          </View>
        )}
        <Input
          label="Titulo do TCC"
          value={TituloTcc}
          onChangeText={setTituloTcc}
        />
        <Input
          label="Descrição do tema"
          value={DescricaoTema}
          onChangeText={setDescricaoTema}
          multiline
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />
        <Button
          title="Enviar solicitação"
          onPress={handleSubmit}
          loading={loading}
          disabled={professoresLoading}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: theme.colors.muted, marginBottom: 6, fontSize: 14 },
  selectWrapper: { marginBottom: theme.spacing.md },
  selectButton: {
    minHeight: 52,
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  selectText: { color: theme.colors.text, fontSize: 16, flex: 1 },
  placeholder: { color: theme.colors.muted },
  chevron: { color: theme.colors.primary, fontSize: 12, fontWeight: "800" },
  options: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginTop: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionSelected: { backgroundColor: "#f2e5c6" },
  optionName: { color: theme.colors.text, fontWeight: "700" },
  optionEmail: { color: theme.colors.muted, marginTop: 3 },
  empty: { color: theme.colors.muted, padding: 14 },
});
