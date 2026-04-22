import React, { PropsWithChildren, useEffect } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { theme } from "../styles/theme";
import { useAuth } from "../hooks/useAuth";
import { Loading } from "../components/Loading";

type Props = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  protectedRoute?: boolean;
}>;

export function Screen({ title, subtitle, protectedRoute, children }: Props) {
  const { loading, signedIn } = useAuth();

  useEffect(() => {
    if (!loading && protectedRoute && !signedIn) {
      router.replace("/");
    }
  }, [loading, protectedRoute, signedIn]);

  if (loading || (protectedRoute && !signedIn)) {
    return (
      <View style={styles.fill}>
        <Loading />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, padding: theme.spacing.lg },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: "800", marginTop: 18 },
  subtitle: { color: theme.colors.muted, marginTop: 6, marginBottom: 20 },
});
