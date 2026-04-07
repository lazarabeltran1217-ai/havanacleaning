import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";
import { prisma } from "@/lib/prisma";

let app: App | null = null;
let messaging: Messaging | null = null;

/**
 * Load Firebase service account — DB first (Setting model), env var fallback.
 */
async function getServiceAccount(): Promise<object | null> {
  // 1. Try Setting table (key-value store)
  try {
    const row = await prisma.setting.findUnique({
      where: { key: "FIREBASE_SERVICE_ACCOUNT" },
    });
    if (row?.value) {
      const parsed =
        typeof row.value === "string" ? JSON.parse(row.value) : row.value;
      if (parsed?.project_id) {
        console.log("[Firebase] Loaded service account from DB");
        return parsed;
      }
    }
  } catch (err) {
    console.warn(
      "[Firebase] DB lookup failed, trying env var:",
      (err as Error).message
    );
  }

  // 2. Fall back to environment variable
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) {
    console.warn(
      "[Firebase] FIREBASE_SERVICE_ACCOUNT not configured — push disabled"
    );
    return null;
  }

  try {
    return JSON.parse(json);
  } catch {
    console.error("[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT env var");
    return null;
  }
}

export async function getFirebaseAdmin(): Promise<App | null> {
  if (app) return app;

  const serviceAccount = await getServiceAccount();
  if (!serviceAccount) return null;

  try {
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(serviceAccount as Parameters<typeof cert>[0]),
      });
    } else {
      app = getApps()[0];
    }
    return app;
  } catch (error) {
    console.error("[Firebase] Failed to initialize:", error);
    return null;
  }
}

export async function getMessagingInstance(): Promise<Messaging | null> {
  if (messaging) return messaging;
  const firebaseApp = await getFirebaseAdmin();
  if (!firebaseApp) return null;
  messaging = getMessaging(firebaseApp);
  return messaging;
}
