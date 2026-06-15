import React from "react";
import { Text } from "react-native";
import type { TarefaDto, TarefaStatus } from "../types";
import { AppModal } from "./AppModal";
import { TarefaCard } from "./TarefaCard";

type Props = {
  visible: boolean;
  tarefas: TarefaDto[];
  disabled?: boolean;
  onClose: () => void;
  onStatusChange: (tarefa: TarefaDto, novoStatus: TarefaStatus) => void;
};

export function TarefasAtivasPanel({ visible, tarefas, disabled, onClose, onStatusChange }: Props) {
  return (
    <AppModal visible={visible} title="Tarefas ativas" onClose={onClose}>
      {tarefas.length ? tarefas.map((tarefa) => (
        <TarefaCard
          key={tarefa.TarefaId}
          tarefa={tarefa}
          disabled={disabled}
          onStatusChange={(novoStatus) => onStatusChange(tarefa, novoStatus)}
        />
      )) : <Text>Nenhuma tarefa ativa.</Text>}
    </AppModal>
  );
}
