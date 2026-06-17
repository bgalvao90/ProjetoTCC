import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthResponse, UsuarioDto } from "../types";

const TOKEN_KEY = "@ProjetoTCC:token";
const USER_KEY = "@ProjetoTCC:usuario";

let memoryToken: string | null = null;
let memoryUser: UsuarioDto | null = null;

async function removeLegacyPersistentSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export const authStorage = {
  async save(auth: AuthResponse) {
    memoryToken = auth.Token;
    memoryUser = auth.Usuario;
    await removeLegacyPersistentSession();
  },
  async getToken() {
    await removeLegacyPersistentSession();
    return memoryToken;
  },
  async getUser(): Promise<UsuarioDto | null> {
    await removeLegacyPersistentSession();
    return memoryUser;
  },
  async setUser(usuario: UsuarioDto) {
    memoryUser = usuario;
    await removeLegacyPersistentSession();
  },
  async clear() {
    memoryToken = null;
    memoryUser = null;
    await removeLegacyPersistentSession();
  },
};
