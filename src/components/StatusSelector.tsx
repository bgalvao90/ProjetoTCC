import React, { useState } from "react";
import { Text } from "react-native";
import { TarefaStatus } from "../types";
import { getProximoTarefaStatus, getTarefaStatusLabel } from "../utils/tarefa";
import { Button } from "./Button";
import { AppModal } from "./AppModal";
import { StatusBadge } from "./StatusBadge";

type Props = {
  statusAtual: TarefaStatus;
  onSelect: (novoStatus: TarefaStatus) => void;
  disabled?: boolean;
};

export function StatusSelector({ statusAtual, onSelect, disabled }: Props) {
  const proximoStatus = getProximoTarefaStatus(statusAtual);
  const [visible, setVisible] = useState(false);

  if (!proximoStatus) {
    return <Text>Tarefa concluida</Text>;
  }

  return (
    <>
      <Button
        title="Alterar status"
        variant="outline"
        disabled={disabled}
        onPress={() => setVisible(true)}
      />
      <AppModal
        visible={visible}
        title="Confirmar alteracao de status"
        onClose={() => setVisible(false)}
      >
        <Text>O novo status sera:</Text>
        <StatusBadge status={proximoStatus} />
        <Button
          title={`Confirmar ${getTarefaStatusLabel(proximoStatus)}`}
          onPress={() => {
            setVisible(false);
            onSelect(proximoStatus);
          }}
        />
      </AppModal>
    </>
  );
}
