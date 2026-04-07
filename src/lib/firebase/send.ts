import { getMessagingInstance } from "./admin";
import { prisma } from "@/lib/prisma";

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface SendResult {
  sent: number;
  failed: number;
}

async function sendToToken(
  token: string,
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  const messaging = await getMessagingInstance();
  if (!messaging) return { success: false, error: "FCM not configured" };

  try {
    await messaging.send({
      token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
      android: {
        priority: "high",
        notification: { channelId: "default", sound: "default" },
      },
      apns: {
        payload: {
          aps: {
            alert: { title: payload.title, body: payload.body },
            sound: "default",
          },
        },
      },
    });
    return { success: true };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (
      err.code === "messaging/invalid-registration-token" ||
      err.code === "messaging/registration-token-not-registered"
    ) {
      return { success: false, error: "INVALID_TOKEN" };
    }
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Send push notifications to all active device tokens for a user.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<SendResult> {
  const result: SendResult = { sent: 0, failed: 0 };

  const tokens = await prisma.deviceToken.findMany({
    where: { userId, isActive: true },
  });

  if (tokens.length === 0) return result;

  for (const t of tokens) {
    const sendResult = await sendToToken(t.token, payload);
    if (sendResult.success) {
      result.sent++;
    } else {
      result.failed++;
      if (sendResult.error === "INVALID_TOKEN") {
        await prisma.deviceToken.update({
          where: { id: t.id },
          data: { isActive: false },
        });
      }
    }
  }

  return result;
}

/**
 * Send a push notification to all active tokens (broadcast).
 */
export async function sendPushToAll(payload: PushPayload): Promise<SendResult> {
  const result: SendResult = { sent: 0, failed: 0 };

  const tokens = await prisma.deviceToken.findMany({
    where: { isActive: true },
  });

  if (tokens.length === 0) return result;

  for (const t of tokens) {
    const sendResult = await sendToToken(t.token, payload);
    if (sendResult.success) {
      result.sent++;
    } else {
      result.failed++;
      if (sendResult.error === "INVALID_TOKEN") {
        await prisma.deviceToken.update({
          where: { id: t.id },
          data: { isActive: false },
        });
      }
    }
  }

  return result;
}
