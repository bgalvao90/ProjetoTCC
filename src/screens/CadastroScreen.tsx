import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { UniversidadeSelect } from "../components/UniversidadeSelect";
import { authService } from "../services/authService";
import { universidadeService } from "../services/universidadeService";
import { CadastroRequest, UniversidadeDto } from "../types";
import { getUniversidadeId } from "../utils/universidade";
import { getErrorMessage, isEmail, validatePassword } from "../utils/validation";
import { Screen } from "./Screen";

export function CadastroScreen() {
  const [tipo, setTipo] = useState<"Aluno" | "Professor">("Aluno");
  const [form, setForm] = useState({ NomeCompleto: "", Email: "", Telefone: "", UniversidadeId: null as number | null, Senha: "" });
  const [universidades, setUniversidades] = useState<UniversidadeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUniversidades, setLoadingUniversidades] = useState(true);

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    universidadeService.listar()
      .then((data) => {
        setUniversidades(data);
        setForm((prev) => prev.UniversidadeId || !data.length ? prev : { ...prev, UniversidadeId: getUniversidadeId(data[0]) || null });
      })
      .catch((error) => Alert.alert("Erro", getErrorMessage(error)))
      .finally(() => setLoadingUniversidades(false));
  }, []);

  async function handleCadastro() {
    if (!form.NomeCompleto || !form.Telefone || !form.Senha) return Alert.alert("Erro", "Preencha todos os campos obrigatorios.");
    if (!isEmail(form.Email)) return Alert.alert("Erro", "Informe um email valido.");
    const passwordError = validatePassword(form.Senha);
    if (passwordError) return Alert.alert("Erro", passwordError);
    if (!form.UniversidadeId) return Alert.alert("Erro", "Selecione uma universidade.");
    const request: CadastroRequest = { ...form, UniversidadeId: form.UniversidadeId, FotoPerfilMidiaId: null };
    try {
      setLoading(true);
      if (tipo === "Aluno") await authService.registrarAluno(request);
      else await authService.registrarProfessor(request);
      Alert.alert("Cadastro criado", "Use seu email e senha para entrar.");
      router.replace("/");
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen title="Cadastro" subtitle="Crie uma conta de aluno ou professor">
      <Card>
        <View style={styles.row}>
          <Button title="Aluno" variant={tipo === "Aluno" ? "primary" : "outline"} style={styles.flex} onPress={() => setTipo("Aluno")} />
          <Button title="Professor" variant={tipo === "Professor" ? "primary" : "outline"} style={styles.flex} onPress={() => setTipo("Professor")} />
        </View>
        <Input label="Nome completo" value={form.NomeCompleto} onChangeText={(v) => setField("NomeCompleto", v)} />
        <Input label="Email" value={form.Email} onChangeText={(v) => setField("Email", v)} autoCapitalize="none" keyboardType="email-address" />
        <Input label="Telefone" value={form.Telefone} onChangeText={(v) => setField("Telefone", v)} keyboardType="phone-pad" />
        <UniversidadeSelect
          label="Universidade"
          value={form.UniversidadeId}
          universidades={universidades}
          loading={loadingUniversidades}
          onChange={(UniversidadeId) => setForm((prev) => ({ ...prev, UniversidadeId }))}
        />
        <Input label="Senha" value={form.Senha} onChangeText={(v) => setField("Senha", v)} secureTextEntry />
        <Button title="Cadastrar" onPress={handleCadastro} loading={loading} disabled={loadingUniversidades} />
        <Button title="Voltar ao login" variant="ghost" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, marginBottom: 12 },
  flex: { flex: 1 },
});
