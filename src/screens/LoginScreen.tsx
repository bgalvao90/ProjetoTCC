import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { theme } from "../styles/theme";
import { getErrorMessage, isEmail } from "../utils/validation";
import { Screen } from "./Screen";

export function LoginScreen() {
  const { login } = useAuth();
  const [Email, setEmail] = useState("");
  const [Senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!isEmail(Email)) return Alert.alert("Erro", "Informe um email valido.");
    if (!Senha) return Alert.alert("Erro", "Informe a senha.");
    try {
      setLoading(true);
      await login({ Email, Senha });
      router.replace("/home");
    } catch (error) {
      Alert.alert("Erro", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Card style={styles.card}>
          <Text style={styles.icon}>TCC</Text>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Faca login para continuar</Text>
          <Input label="Email" placeholder="Digite seu email" value={Email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Senha" placeholder="Digite sua senha" value={Senha} onChangeText={setSenha} secureTextEntry />
          <Button title="Entrar" onPress={handleLogin} loading={loading} />
          <TouchableOpacity onPress={() => router.push("/cadastro")}>
            <Text style={styles.link}>Criar conta</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center" },
  card: { padding: 28 },
  icon: { color: theme.colors.primary, textAlign: "center", fontSize: 32, fontWeight: "900", marginBottom: 14 },
  title: { fontSize: 24, color: theme.colors.text, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 14, color: theme.colors.muted, textAlign: "center", marginBottom: 24 },
  link: { color: theme.colors.primary, textAlign: "center", marginTop: 18, fontWeight: "700" },
});
