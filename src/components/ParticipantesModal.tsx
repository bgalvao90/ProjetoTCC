import React from "react";
import { Text } from "react-native";
import type { ParticipanteOrientacaoDto } from "../types";
import { AppModal } from "./AppModal";
import { Avatar } from "./Avatar";

type Props = { visible: boolean; participantes: ParticipanteOrientacaoDto[]; onClose: () => void };

export function ParticipantesModal({ visible, participantes, onClose }: Props) {
  return (
    <AppModal visible={visible} title="Participantes" onClose={onClose}>
      {participantes.map((participante) => (
        <React.Fragment key={participante.UsuarioId}>
          <Avatar nome={participante.Nome} />
          <Text>{participante.Nome} · {participante.Papel}</Text>
        </React.Fragment>
      ))}
    </AppModal>
  );
}
