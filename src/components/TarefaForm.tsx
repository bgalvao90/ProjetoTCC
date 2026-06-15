import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { theme } from "../styles/theme";
import { CriarTarefaRequest, ParticipanteTarefa, TarefaDto } from "../types";
import {
  validarDescricaoTarefa,
  validarTituloTarefa,
} from "../utils/tarefa";
import { Button } from "./Button";
import { Input } from "./Input";
import { ResponsavelSelect } from "./ResponsavelSelect";

type Props = {
  solicitacaoId: number;
  tarefa?: TarefaDto | null;
  busy?: boolean;
  disabled?: boolean;
  participantes: ParticipanteTarefa[];
  onSubmit: (request: CriarTarefaRequest) => void;
  onCancel: () => void;
};

export function TarefaForm({
  solicitacaoId,
  tarefa,
  busy,
  disabled,
  participantes,
  onSubmit,
  onCancel,
}: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [responsavelUsuarioId, setResponsavelUsuarioId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setTitulo(tarefa?.Titulo ?? "");
    setDescricao(tarefa?.Descricao ?? "");
    setResponsavelUsuarioId(tarefa?.ResponsavelUsuarioId ?? null);
  }, [tarefa]);

  const tituloError = validarTituloTarefa(titulo);
  const descricaoError = validarDescricaoTarefa(descricao);
  const isInvalid = Boolean(tituloError || descricaoError);

  return (
    <>
      <Input
        label={`Titulo (${titulo.length}/180)`}
        value={titulo}
        maxLength={181}
        editable={!disabled}
        onChangeText={setTitulo}
      />
      {tituloError ? <Text style={styles.error}>{tituloError}</Text> : null}
      <Input
        label={`Descricao (${descricao.length}/4000)`}
        value={descricao}
        maxLength={4001}
        multiline
        editable={!disabled}
        onChangeText={setDescricao}
        style={styles.description}
      />
      {descricaoError ? <Text style={styles.error}>{descricaoError}</Text> : null}
      <ResponsavelSelect
        participantes={participantes}
        value={responsavelUsuarioId}
        disabled={disabled || Boolean(tarefa)}
        onChange={setResponsavelUsuarioId}
      />
      <Button
        title="Salvar tarefa"
        loading={busy}
        disabled={disabled || isInvalid}
        onPress={() =>
          onSubmit({
            SolicitacaoId: solicitacaoId,
            Titulo: titulo.trim(),
            Descricao: descricao.trim(),
            ResponsavelUsuarioId: responsavelUsuarioId,
            MidiaId: tarefa?.MidiaId ?? null,
          })
        }
      />
      <Button title="Cancelar" variant="outline" disabled={busy} onPress={onCancel} />
    </>
  );
}

const styles = StyleSheet.create({
  description: { minHeight: 110, textAlignVertical: "top" },
  error: { color: theme.colors.danger, marginBottom: theme.spacing.sm },
});
