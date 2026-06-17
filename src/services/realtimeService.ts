import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { authStorage } from "../api/storage";

let connection: HubConnection | null = null;

export const realtimeService = {
  async conectar(solicitacaoId: number, onChanged: () => void) {
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiBaseUrl) throw new Error("EXPO_PUBLIC_API_URL nao configurada.");
    if (process.env.NODE_ENV === "production" && !apiBaseUrl.startsWith("https://")) {
      throw new Error("Tempo real exige HTTPS/WSS em producao.");
    }
    if (!connection) {
      connection = new HubConnectionBuilder()
        .withUrl(`${apiBaseUrl}/hubs/projetotcc`, {
          accessTokenFactory: async () => (await authStorage.getToken()) ?? "",
        })
        .withAutomaticReconnect([0, 2000, 5000, 15000])
        .configureLogging(LogLevel.Warning)
        .build();
    }
    const events = [
      "NovaMensagem",
      "NovaTarefa",
      "TarefaAtualizada",
      "StatusSolicitacaoAlterado",
      "TimelineItemCriado",
      "TimelineItemAtualizado",
    ];
    events.forEach((event) => connection?.on(event, onChanged));
    connection.onreconnected(async () => {
      await connection?.invoke("EntrarSolicitacao", solicitacaoId);
      onChanged();
    });
    if (connection.state === HubConnectionState.Disconnected) await connection.start();
    await connection.invoke("EntrarSolicitacao", solicitacaoId);
    return () => events.forEach((event) => connection?.off(event, onChanged));
  },
};
