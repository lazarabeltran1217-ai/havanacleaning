import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { apiPost } from "@/lib/api";

const isExpoGo = Constants.appOwnership === "expo";

let Notifications: typeof import("expo-notifications") | null = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    /* expo-notifications not available */
  }
}

/**
 * Registers the device for push notifications.
 * Uses native FCM/APNs tokens and stores via API (NextAuth session cookie).
 */
export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated || !Notifications) return;

    async function registerPush() {
      try {
        const { status: existingStatus } =
          await Notifications!.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications!.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") return;

        // Get native FCM/APNs token (NOT Expo push token)
        const tokenData = await Notifications!.getDevicePushTokenAsync();
        const pushToken = tokenData.data as string;
        const platform = Platform.OS === "ios" ? "ios" : "android";

        // Store via API (uses session cookie for auth)
        await apiPost("/api/push/register", {
          token: pushToken,
          platform,
        });
      } catch (err) {
        console.log("Push registration error:", err);
      }
    }

    registerPush();
  }, [isAuthenticated]);

  // Set up Android notification channel
  useEffect(() => {
    if (!Notifications || Platform.OS !== "android") return;
    Notifications.setNotificationChannelAsync("default", {
      name: "Havana Cleaning",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2C1810",
      sound: "default",
    });
  }, []);
}
