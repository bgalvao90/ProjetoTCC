import * as Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "../api/client";

export const pushNotificationService = {
  async registrar() {
    if (!Device.isDevice) return null;
    const current = await Notifications.getPermissionsAsync();
    const permission =
      current.status === "granted" ? current : await Notifications.requestPermissionsAsync();
    if (permission.status !== "granted") return null;
    const projectId =
      Constants.default.expoConfig?.extra?.eas?.projectId ??
      Constants.default.easConfig?.projectId;
    if (!projectId) return null;
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await api.post("/dispositivos-push", {
      ExpoPushToken: token,
      Plataforma: Platform.OS,
    });
    return token;
  },
};
