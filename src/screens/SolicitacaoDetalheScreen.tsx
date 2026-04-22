import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { AppModal } from "../components/AppModal";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
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

export function SolicitacaoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();
  const solicitacaoId = Number(id);
  const [item, setItem] = useState<SolicitacaoDto | null>(null);
  const [alunoNome, setAlunoNome] = useState("");
  const [professorNome, setProfessorNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState(false);
  const [MensagemFinal, setMensagemFinal] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    async function fetchData() {
      try {
        const solicitacao = await solicitacaoService.obter(solicitacaoId);
        setItem(solicitacao);

        const alunoId = getPessoaIdSolicitacao(solicitacao, "Aluno");
        const professorId = getPessoaIdSolicitacao(solicitacao, "Professor");
        const alunoFromResponse = getPessoaNomeSolicitacao(
          solicitacao,
          "Aluno",
        );
        const professorFromResponse = getPessoaNomeSolicitacao(
          solicitacao,
          "Professor",
        );

        const [aluno, professor] = await Promise.all([
          alunoFromResponse
            ? Promise.resolve(null)
            : usuarioService.obter(alunoId).catch(() => null),
          professorFromResponse
            ? Promise.resolve(null)
            : professorService.obter(professorId).catch(() => null),
        ]);

        setAlunoNome(
          alunoFromResponse ||
            aluno?.NomeCompleto ||
            (alunoId === usuario?.UsuarioId ? usuario.NomeCompleto : ""),
        );
        setProfessorNome(
          professorFromResponse ||
            professor?.NomeCompleto ||
            (professorId === usuario?.UsuarioId ? usuario.NomeCompleto : ""),
        );
      } catch (e) {
        Alert.alert("Erro", getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [solicitacaoId, usuario?.NomeCompleto, usuario?.UsuarioId]);

  useFocusEffect(load);

  async function action(fn: () => Promise<SolicitacaoDto>) {
    try {
      setBusy(true);
      setItem(await fn());
      setModal(false);
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const isProfessorOwner = item
    ? getPessoaIdSolicitacao(item, "Professor") === usuario?.UsuarioId
    : false;
  const isPending = item?.Status.toLowerCase().includes("pend");
  const isFinished = item?.Status.toLowerCase().includes("final");

  return (
    <Screen protectedRoute title="Solicitação" subtitle="Detalhes e ações">
      {loading || !item ? (
        <Loading />
      ) : (
        <Card>
          <StatusBadge status={item.Status} />
          <Text style={styles.title}>{item.TituloTcc}</Text>
          <Text style={styles.text}>{item.DescricaoTema}</Text>
          <Text style={styles.muted}>
            Aluno: {alunoNome || "Nome nao informado"}
          </Text>
          <Text style={styles.muted}>
            Professor: {professorNome || "Nome nao informado"}
          </Text>
          <Text style={styles.muted}>
            Criada em {new Date(item.DataCriacao).toLocaleString("pt-BR")}
          </Text>
          {isProfessorOwner && isPending ? (
            <>
              <Button
                title="Aceitar"
                loading={busy}
                onPress={() =>
                  action(() => solicitacaoService.aceitar(item.SolicitacaoId))
                }
              />
              <Button
                title="Recusar"
                variant="outline"
                onPress={() => setModal(true)}
              />
            </>
          ) : null}
          {!isFinished ? (
            <Button
              title="Finalizar"
              variant="outline"
              loading={busy}
              onPress={() =>
                action(() => solicitacaoService.finalizar(item.SolicitacaoId))
              }
            />
          ) : null}
          <Button
            title="Abrir chat"
            onPress={() => router.push(`/chat/${item.SolicitacaoId}`)}
          />
        </Card>
      )}
      <AppModal
        visible={modal}
        title="Recusar solicitacao"
        onClose={() => setModal(false)}
      >
        <Input
          label="Mensagem final"
          value={MensagemFinal}
          onChangeText={setMensagemFinal}
          multiline
        />
        <Button
          title="Confirmar recusa"
          variant="danger"
          loading={busy}
          onPress={() =>
            item &&
            action(() =>
              solicitacaoService.recusar(item.SolicitacaoId, { MensagemFinal }),
            )
          }
        />
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 14,
  },
  text: { color: theme.colors.text, marginTop: 10, lineHeight: 22 },
  muted: { color: theme.colors.muted, marginTop: 8 },
});
