import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function HomeScreen() {
  const { nome } = useLocalSearchParams<{ nome: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.boas_vindas}>Seja bem-vindo,</Text>
      <Text style={styles.nome}>{nome || "Usuário"}!</Text>
      <Text style={styles.descricao}>Você acessou o sistema com sucesso.</Text>

      <TouchableOpacity
        style={styles.botaoSair}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.botaoSairTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  boas_vindas: {
    fontSize: 22,
    color: "#e2e8f0",
  },
  nome: {
    fontSize: 38,
    color: "#e94560",
    fontWeight: "bold",
    marginBottom: 16,
    textTransform: "capitalize",
  },
  descricao: {
    fontSize: 16,
    color: "#cbd5e1",
    marginBottom: 32,
    textAlign: "center",
  },
  botaoSair: {
    borderWidth: 2,
    borderColor: "#e94560",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  botaoSairTexto: {
    color: "#e94560",
    fontSize: 16,
    fontWeight: "bold",
  },
});
