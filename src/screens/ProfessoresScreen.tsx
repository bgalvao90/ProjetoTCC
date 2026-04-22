import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Loading } from "../components/Loading";
import { professorService } from "../services/professorService";
import { universidadeService } from "../services/universidadeService";
import { theme } from "../styles/theme";
import { UniversidadeDto, UsuarioDto } from "../types";
import { getUniversidadeNomeById } from "../utils/universidade";
import { getErrorMessage } from "../utils/validation";
import { Screen } from "./Screen";

export function ProfessoresScreen() {
  const [professores, setProfessores] = useState<UsuarioDto[]>([]);
  const [universidades, setUniversidades] = useState<UniversidadeDto[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([professorService.listar(), universidadeService.listar()])
      .then(([professoresData, universidadesData]) => {
        setProfessores(professoresData);
        setUniversidades(universidadesData);
      })
      .catch((e) => Alert.alert("Erro", getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => professores.filter((p) => p.NomeCompleto.toLowerCase().includes(busca.toLowerCase()) || p.Email.toLowerCase().includes(busca.toLowerCase())), [professores, busca]);

  return (
    <Screen protectedRoute title="Professores" subtitle="Escolha um orientador">
      <Input label="Busca" value={busca} onChangeText={setBusca} placeholder="Nome ou email" />
      {loading ? <Loading /> : (
        <FlatList
          scrollEnabled={false}
          data={filtrados}
          keyExtractor={(item) => String(item.UsuarioId)}
          ListEmptyComponent={<EmptyState title="Nenhum professor encontrado" />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/professores/${item.UsuarioId}`)}>
              <Card>
                <View style={styles.row}>
                  <Avatar nome={item.NomeCompleto} />
                  <View style={styles.flex}>
                    <Text style={styles.name}>{item.NomeCompleto}</Text>
                    <Text style={styles.muted}>{item.Email}</Text>
                    <Text style={styles.muted}>{getUniversidadeNomeById(universidades, item.UniversidadeId)}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  name: { color: theme.colors.text, fontWeight: "800", fontSize: 16 },
  muted: { color: theme.colors.muted, marginTop: 3 },
});
