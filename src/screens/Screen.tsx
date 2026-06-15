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
  scrollable?: boolean;
}>;

export function Screen({ title, subtitle, protectedRoute, scrollable = true, children }: Props) {
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

  const body = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </>
  );

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{body}</ScrollView>
      ) : (
        <View style={styles.staticContent}>{body}</View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: theme.colors.background },
  content: { flexGrow: 1, padding: theme.spacing.lg },
  staticContent: { flex: 1 },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: "800", marginTop: 18 },
  subtitle: { color: theme.colors.muted, marginTop: 6, marginBottom: 20 },
});
