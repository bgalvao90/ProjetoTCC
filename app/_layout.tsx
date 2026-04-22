import { Stack } from "expo-router";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="home" />
        <Stack.Screen name="professores/index" />
        <Stack.Screen name="professores/[id]" />
        <Stack.Screen name="solicitacoes/index" />
        <Stack.Screen name="solicitacoes/nova" />
        <Stack.Screen name="solicitacoes/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="perfil" />
      </Stack>
    </AuthProvider>
  );
}
