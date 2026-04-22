import { api } from "../api/client";
import { MidiaDto, UploadMidiaRequest } from "../types";

export const midiaService = {
  async upload(request: UploadMidiaRequest) {
    const { data } = await api.post<MidiaDto>("/midias/upload", request);
    return data;
  },
  async obter(id: string) {
    const { data } = await api.get<MidiaDto>(`/midias/${id}`);
    return data;
  },
};
