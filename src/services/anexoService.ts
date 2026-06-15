import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { api } from "../api/client";
import type { ArquivoSelecionado, MidiaDto } from "../types";

export const anexoService = {
  async upload(solicitacaoId: number, arquivo: ArquivoSelecionado) {
    const form = new FormData();
    form.append("entidadeOrigem", "Solicitacao");
    form.append("entidadeId", String(solicitacaoId));
    form.append("arquivo", {
      uri: arquivo.uri,
      name: arquivo.name,
      type: arquivo.mimeType || "application/octet-stream",
    } as unknown as Blob);
    const { data } = await api.post<MidiaDto>("/uploads", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return data;
  },
  async baixar(midiaId: string, nomeArquivo: string) {
    const target = `${FileSystem.cacheDirectory}${nomeArquivo}`;
    const response = await api.get<ArrayBuffer>(`/midias/${midiaId}/download`, {
      responseType: "arraybuffer",
      timeout: 120000,
    });
    const bytes = new Uint8Array(response.data);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    await FileSystem.writeAsStringAsync(target, btoa(binary), {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(target);
    return target;
  },
};
