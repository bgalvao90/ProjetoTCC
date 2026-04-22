import React, { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Loading } from "../components/Loading";
import { useAuth } from "../hooks/useAuth";
import { mensagemService } from "../services/mensagemService";
import { solicitacaoService } from "../services/solicitacaoService";
import { theme } from "../styles/theme";
import { MensagemDto, SolicitacaoDto } from "../types";
import { getErrorMessage } from "../utils/validation";
import { Screen } from "./Screen";

export function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const solicitacaoId = Number(id);
  const [solicitacao, setSolicitacao] = useState<SolicitacaoDto | null>(null);
  const [mensagens, setMensagens] = useState<MensagemDto[]>([]);
  const [Conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      solicitacaoService.obter(solicitacaoId),
      mensagemService.listarPorSolicitacao(solicitacaoId),
    ])
      .then(([s, m]) => {
        setSolicitacao(s);
        setMensagens(m);
      })
      .catch((e) => Alert.alert("Erro", getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [solicitacaoId]);

  useFocusEffect(load);

  async function send() {
    if (!Conteudo.trim()) return;
    try {
      setSending(true);
      const sent = await mensagemService.enviar({
        SolicitacaoId: solicitacaoId,
        Conteudo,
        MidiaId: null,
      });
      setMensagens((prev) => [...prev, sent]);
      setConteudo("");
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  const status = solicitacao?.Status.toLowerCase() || "";
  const blocked = status.includes("pend") || status.includes("final");

  return (
    <Screen
      protectedRoute
      title="Chat"
      subtitle={solicitacao?.TituloTcc || "Mensagens da solicitacao"}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          {blocked ? (
            <Text style={styles.warning}>
              Envio bloqueado pelo status atual: {solicitacao?.Status}.
            </Text>
          ) : null}
          <FlatList
            scrollEnabled={false}
            data={mensagens}
            keyExtractor={(item) => String(item.MensagemId)}
            ListEmptyComponent={<EmptyState title="Nenhuma mensagem" />}
            renderItem={({ item }) => {
              const mine = item.RemetenteUsuarioId === usuario?.UsuarioId;
              return (
                <View
                  style={[styles.message, mine ? styles.mine : styles.other]}
                >
                  <Text style={styles.messageText}>
                    {item.Conteudo || "Midia anexada"}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(item.DataEnvio).toLocaleString("pt-BR")}
                  </Text>
                </View>
              );
            }}
          />
          <Input
            label="Mensagem"
            value={Conteudo}
            onChangeText={setConteudo}
            multiline
            editable={!blocked && !sending}
          />
          <Button
            title="Enviar"
            onPress={send}
            disabled={blocked}
            loading={sending}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: { color: theme.colors.warning, marginBottom: 12 },
  message: { borderRadius: 8, padding: 12, marginBottom: 10, maxWidth: "88%" },
  mine: { alignSelf: "flex-end", backgroundColor: theme.colors.primary },
  other: { alignSelf: "flex-start", backgroundColor: theme.colors.surface },
  messageText: { color: "#fff" },
  date: { color: "rgba(255,255,255,0.78)", fontSize: 11, marginTop: 6 },
  hint: { color: theme.colors.muted, fontSize: 12, marginTop: 10 },
});
