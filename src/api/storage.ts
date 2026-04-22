import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthResponse, UsuarioDto } from "../types";

const TOKEN_KEY = "@ProjetoTCC:token";
const USER_KEY = "@ProjetoTCC:usuario";

export const authStorage = {
  async save(auth: AuthResponse) {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, auth.Token],
      [USER_KEY, JSON.stringify(auth.Usuario)],
    ]);
  },
  async getToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async getUser(): Promise<UsuarioDto | null> {
    const value = await AsyncStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as UsuarioDto) : null;
  },
  async setUser(usuario: UsuarioDto) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },
  async clear() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
