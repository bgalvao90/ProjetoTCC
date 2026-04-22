import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Loading } from "../components/Loading";
import { solicitacaoService } from "../services/solicitacaoService";
import { theme } from "../styles/theme";
import { SolicitacaoDto } from "../types";
import { getErrorMessage } from "../utils/validation";
import { useAuth } from "../hooks/useAuth";
import { Screen } from "./Screen";

export function HomeScreen() {
  const { usuario } = useAuth();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    solicitacaoService
      .minhas()
      .then(setSolicitacoes)
      .catch((e) => Alert.alert("Erro", getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const isProfessor = usuario?.TipoUsuario === "Professor";

  return (
    <Screen
      protectedRoute
      title="Bem Vindo!"
      subtitle={
        isProfessor
          ? "Solicitações recebidas e conversas"
          : "Professores, solicitações e mensagens"
      }
    >
      <Card>
        <View style={styles.profile}>
          <Avatar nome={usuario?.NomeCompleto || "Usuario"} />
          <View style={styles.flex}>
            <Text style={styles.name}>{usuario?.NomeCompleto}</Text>
            <Text style={styles.role}>{usuario?.TipoUsuario}</Text>
          </View>
        </View>
      </Card>
      {loading ? (
        <Loading />
      ) : (
        <View style={styles.grid}>
          <Card style={styles.metric}>
            <Text style={styles.metricValue}>{solicitacoes.length}</Text>
            <Text style={styles.metricLabel}>Solicitacoes</Text>
          </Card>
          <Card style={styles.metric}>
            <Text style={styles.metricValue}>
              {
                solicitacoes.filter((s) =>
                  s.Status.toLowerCase().includes("pend"),
                ).length
              }
            </Text>
            <Text style={styles.metricLabel}>Pendentes</Text>
          </Card>
        </View>
      )}
      {!isProfessor ? (
        <Button
          title="Buscar professores"
          onPress={() => router.push("/professores")}
        />
      ) : null}
      <Button
        title={isProfessor ? "Solicitações recebidas" : "Minhas solicitações"}
        onPress={() => router.push("/solicitacoes")}
      />
      <Button
        title="Perfil"
        variant="outline"
        onPress={() => router.push("/perfil")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: "row", gap: 14, alignItems: "center" },
  flex: { flex: 1 },
  name: { color: theme.colors.text, fontSize: 18, fontWeight: "800" },
  role: { color: theme.colors.muted, marginTop: 3 },
  grid: { flexDirection: "row", gap: 10 },
  metric: { flex: 1 },
  metricValue: { color: theme.colors.primary, fontSize: 28, fontWeight: "900" },
  metricLabel: { color: theme.colors.muted },
});
