import { useEffect } from "react";
import { pushNotificationService } from "../services/pushNotificationService";

export function usePushNotifications() {
  useEffect(() => {
    pushNotificationService.registrar().catch(() => undefined);
  }, []);
}
