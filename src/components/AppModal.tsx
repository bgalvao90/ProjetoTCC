import React, { PropsWithChildren } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { theme } from "../styles/theme";
import { Button } from "./Button";

type Props = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>;

export function AppModal({ visible, title, onClose, children }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {children}
          <Button title="Fechar" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 24 },
  content: { backgroundColor: theme.colors.surface, borderRadius: 8, padding: 18 },
  title: { color: theme.colors.text, fontSize: 18, fontWeight: "800", marginBottom: 12 },
});
