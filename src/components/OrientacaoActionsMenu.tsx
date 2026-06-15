import React from "react";
import type { OrientacaoStatus } from "../types";
import { AppModal } from "./AppModal";
import { Button } from "./Button";

type Props = {
  visible: boolean;
  isProfessor: boolean;
  statusId: number;
  onClose: () => void;
  onChangeStatus: (status: OrientacaoStatus) => void;
  onNewTask: () => void;
};

export function OrientacaoActionsMenu({ visible, isProfessor, statusId, onClose, onChangeStatus, onNewTask }: Props) {
  return (
    <AppModal visible={visible} title="Acoes da orientacao" onClose={onClose}>
      {isProfessor && statusId === 1 ? <Button title="Aceitar" onPress={() => onChangeStatus(2)} /> : null}
      {isProfessor && statusId === 1 ? <Button title="Recusar" variant="danger" onPress={() => onChangeStatus(3)} /> : null}
      {statusId === 2 ? <Button title="Adicionar tarefa" onPress={onNewTask} /> : null}
      {isProfessor && statusId === 2 ? <Button title="Pausar" variant="outline" onPress={() => onChangeStatus(5)} /> : null}
      {isProfessor && statusId === 5 ? <Button title="Reativar" variant="outline" onPress={() => onChangeStatus(2)} /> : null}
      {isProfessor && (statusId === 2 || statusId === 5) ? <Button title="Finalizar" variant="danger" onPress={() => onChangeStatus(4)} /> : null}
      {isProfessor && statusId === 4 ? <Button title="Reabrir" onPress={() => onChangeStatus(2)} /> : null}
    </AppModal>
  );
}
