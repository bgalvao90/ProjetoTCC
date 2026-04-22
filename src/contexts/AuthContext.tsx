import React, { createContext, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { authStorage } from "../api/storage";
import { setUnauthorizedHandler } from "../api/client";
import { authService } from "../services/authService";
import { AuthResponse, LoginRequest, UsuarioDto } from "../types";

type AuthContextData = {
  usuario: UsuarioDto | null;
  token: string | null;
  loading: boolean;
  signedIn: boolean;
  login: (request: LoginRequest) => Promise<void>;
  setSession: (auth: AuthResponse) => Promise<void>;
  updateUsuario: (usuario: UsuarioDto) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: PropsWithChildren) {
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await authStorage.clear();
    setUsuario(null);
    setToken(null);
    router.replace("/");
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUsuario(null);
      setToken(null);
      router.replace("/");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    async function restore() {
      const [storedToken, storedUser] = await Promise.all([authStorage.getToken(), authStorage.getUser()]);
      setToken(storedToken);
      setUsuario(storedUser);
      setLoading(false);
    }
    restore();
  }, []);

  const setSession = useCallback(async (auth: AuthResponse) => {
    await authStorage.save(auth);
    setToken(auth.Token);
    setUsuario(auth.Usuario);
  }, []);

  const login = useCallback(
    async (request: LoginRequest) => {
      const auth = await authService.login(request);
      await setSession(auth);
    },
    [setSession]
  );

  const updateUsuario = useCallback(async (next: UsuarioDto) => {
    await authStorage.setUser(next);
    setUsuario(next);
  }, []);

  const value = useMemo(
    () => ({ usuario, token, loading, signedIn: Boolean(token && usuario), login, setSession, updateUsuario, logout }),
    [usuario, token, loading, login, setSession, updateUsuario, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
