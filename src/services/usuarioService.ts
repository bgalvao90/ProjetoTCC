import { api } from "../api/client";
import { AtualizarUsuarioRequest, UsuarioDto } from "../types";

export const usuarioService = {
  async obter(id: number) {
    const { data } = await api.get<UsuarioDto>(`/usuarios/${id}`);
    return data;
  },
  async atualizar(id: number, request: AtualizarUsuarioRequest) {
    const { data } = await api.put<UsuarioDto>(`/usuarios/${id}`, request);
    return data;
  },
};
