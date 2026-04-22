import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { professorService } from "../services/professorService";
import { solicitacaoService } from "../services/solicitacaoService";
import { usuarioService } from "../services/usuarioService";
import { theme } from "../styles/theme";
import { SolicitacaoDto } from "../types";
import {
  getPessoaIdSolicitacao,
  getPessoaNomeSolicitacao,
} from "../utils/solicitacao";
import { getErrorMessage } from "../utils/validation";
import { Screen } from "./Screen";

export function SolicitacoesScreen() {
  const { usuario } = useAuth();
  const [items, setItems] = useState<SolicitacaoDto[]>([]);
  const [nomes, setNomes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const isProfessor = usuario?.TipoUsuario === "Professor";

  const load = useCallback(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const solicitacoes = await solicitacaoService.minhas();
        setItems(solicitacoes);

        const nextNomes: Record<number, string> = {};
        await Promise.all(
          solicitacoes.map(async (solicitacao) => {
            const pessoa = isProfessor ? "Aluno" : "Professor";
            const fromResponse = getPessoaNomeSolicitacao(solicitacao, pessoa);
            if (fromResponse) {
              nextNomes[solicitacao.SolicitacaoId] = fromResponse;
              return;
            }

            const pessoaId = getPessoaIdSolicitacao(solicitacao, pessoa);
            const usuarioRelacionado = isProfessor
              ? await usuarioService.obter(pessoaId).catch(() => null)
              : await professorService.obter(pessoaId).catch(() => null);
            if (usuarioRelacionado?.NomeCompleto) {
              nextNomes[solicitacao.SolicitacaoId] =
                usuarioRelacionado.NomeCompleto;
            }
          }),
        );
        setNomes(nextNomes);
      } catch (e) {
        Alert.alert("Erro", getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isProfessor]);

  useFocusEffect(load);

  return (
    <Screen
      protectedRoute
      title={isProfessor ? "Recebidas" : "Minhas solicitações"}
      subtitle="Acompanhe status e mensagens"
    >
      {!isProfessor ? (
        <Button
          title="Nova solicitação"
          onPress={() => router.push("/solicitacoes/nova")}
        />
      ) : null}
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          scrollEnabled={false}
          data={items}
          keyExtractor={(item) => String(item.SolicitacaoId)}
          ListEmptyComponent={
            <EmptyState
              title="Nenhuma solicitacao"
              description="Quando houver registros, eles aparecerao aqui."
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/solicitacoes/${item.SolicitacaoId}`)}
            >
              <Card>
                <View style={styles.top}>
                  <Text style={styles.title}>{item.TituloTcc}</Text>
                  <StatusBadge status={item.Status} />
                </View>
                <Text style={styles.person}>
                  {isProfessor ? "Aluno" : "Professor"}:{" "}
                  {nomes[item.SolicitacaoId] || "Nome nao informado"}
                </Text>
                <Text style={styles.muted}>{item.DescricaoTema}</Text>
                <Text style={styles.muted}>
                  Criada em{" "}
                  {new Date(item.DataCriacao).toLocaleDateString("pt-BR")}
                </Text>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { gap: 8, marginBottom: 8 },
  title: { color: theme.colors.text, fontSize: 17, fontWeight: "800" },
  person: { color: theme.colors.primary, fontWeight: "700", marginBottom: 4 },
  muted: { color: theme.colors.muted, marginTop: 4 },
});
