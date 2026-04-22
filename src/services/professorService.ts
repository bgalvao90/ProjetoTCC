import { api } from "../api/client";
import { UsuarioDto } from "../types";

export const professorService = {
  async listar() {
    const { data } = await api.get<UsuarioDto[]>("/professores");
    return data;
  },
  async obter(id: number) {
    const { data } = await api.get<UsuarioDto>(`/professores/${id}`);
    return data;
  },
};
