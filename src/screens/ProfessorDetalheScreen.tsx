import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Loading } from "../components/Loading";
import { professorService } from "../services/professorService";
import { universidadeService } from "../services/universidadeService";
import { theme } from "../styles/theme";
import { UniversidadeDto, UsuarioDto } from "../types";
import { getUniversidadeNomeById } from "../utils/universidade";
import { getErrorMessage } from "../utils/validation";
import { Screen } from "./Screen";

export function ProfessorDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const professorId = Number(id);
  const [professor, setProfessor] = useState<UsuarioDto | null>(null);
  const [universidades, setUniversidades] = useState<UniversidadeDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([professorService.obter(professorId), universidadeService.listar()])
      .then(([professorData, universidadesData]) => {
        setProfessor(professorData);
        setUniversidades(universidadesData);
      })
      .catch((e) => Alert.alert("Erro", getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [professorId]);

  return (
    <Screen protectedRoute title="Professor" subtitle="Dados do orientador">
      {loading || !professor ? <Loading /> : (
        <Card>
          <View style={styles.row}>
            <Avatar nome={professor.NomeCompleto} />
            <View style={styles.flex}>
              <Text style={styles.name}>{professor.NomeCompleto}</Text>
              <Text style={styles.muted}>{professor.Email}</Text>
              <Text style={styles.muted}>{professor.Telefone}</Text>
              <Text style={styles.muted}>{getUniversidadeNomeById(universidades, professor.UniversidadeId)}</Text>
            </View>
          </View>
          <Button title="Solicitar orientacao" onPress={() => router.push(`/solicitacoes/nova?professorId=${professor.UsuarioId}`)} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  name: { color: theme.colors.text, fontWeight: "800", fontSize: 18 },
  muted: { color: theme.colors.muted, marginTop: 5 },
});
