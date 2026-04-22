import { api } from "../api/client";
import { AuthResponse, CadastroRequest, LoginRequest, UsuarioDto } from "../types";

export const authService = {
  async login(request: LoginRequest) {
    const { data } = await api.post<AuthResponse>("/auth/login", request);
    return data;
  },
  async registrarAluno(request: CadastroRequest) {
    const { data } = await api.post<UsuarioDto>("/auth/registrar-aluno", request);
    return data;
  },
  async registrarProfessor(request: CadastroRequest) {
    const { data } = await api.post<UsuarioDto>("/auth/registrar-professor", request);
    return data;
  },
};
