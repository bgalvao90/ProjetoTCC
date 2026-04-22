import { api } from "../api/client";
import { UniversidadeDto } from "../types";

export const universidadeService = {
  async listar() {
    const { data } = await api.get<UniversidadeDto[]>("/universidades");
    return data;
  },
  async obter(id: number) {
    const { data } = await api.get<UniversidadeDto>(`/universidades/${id}`);
    return data;
  },
};
