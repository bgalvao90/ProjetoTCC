import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { UniversidadeSelect } from "../components/UniversidadeSelect";
import { useAuth } from "../hooks/useAuth";
import { usuarioService } from "../services/usuarioService";
import { universidadeService } from "../services/universidadeService";
import { UniversidadeDto } from "../types";
import { getErrorMessage } from "../utils/validation";
import { Screen } from "./Screen";

export function PerfilScreen() {
  const { usuario, updateUsuario, logout } = useAuth();
  const [NomeCompleto, setNomeCompleto] = useState(usuario?.NomeCompleto || "");
  const [Telefone, setTelefone] = useState(usuario?.Telefone || "");
  const [UniversidadeId, setUniversidadeId] = useState<number | null>(usuario?.UniversidadeId ?? null);
  const [universidades, setUniversidades] = useState<UniversidadeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUniversidades, setLoadingUniversidades] = useState(true);

  useEffect(() => {
    universidadeService.listar()
      .then(setUniversidades)
      .catch((error) => Alert.alert("Erro", getErrorMessage(error)))
      .finally(() => setLoadingUniversidades(false));
  }, []);

  async function save() {
    if (!usuario) return;
    if (!NomeCompleto || !Telefone || !UniversidadeId) return Alert.alert("Erro", "Preencha os campos obrigatorios.");
    try {
      setLoading(true);
      const updated = await usuarioService.atualizar(usuario.UsuarioId, {
        NomeCompleto,
        Telefone,
        UniversidadeId,
        FotoPerfilMidiaId: usuario.FotoPerfilMidiaId ?? null,
        Ativo: usuario.Ativo,
      });
      await updateUsuario(updated);
      Alert.alert("Perfil atualizado", "Dados salvos com sucesso.");
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen protectedRoute title="Perfil" subtitle={usuario?.Email}>
      <Card>
        <Input label="Nome completo" value={NomeCompleto} onChangeText={setNomeCompleto} />
        <Input label="Telefone" value={Telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
        <UniversidadeSelect
          label="Universidade"
          value={UniversidadeId}
          universidades={universidades}
          loading={loadingUniversidades}
          onChange={setUniversidadeId}
        />
        <Button title="Salvar" onPress={save} loading={loading} disabled={loadingUniversidades} />
        <Button title="Sair" variant="outline" onPress={logout} />
      </Card>
    </Screen>
  );
}
