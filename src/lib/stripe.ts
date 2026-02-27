import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

let _stripe: Stripe | null = null;
let _lastKey = "";

/** Read Stripe secret key from DB settings, fallback to env var */
async function getStripeSecretKey(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "api_stripe_secret" },
    });
    const dbKey = typeof setting?.value === "string" ? setting.value : "";
    if (dbKey) return dbKey;
  } catch {
    // DB unavailable, fall through to env
  }
  return process.env.STRIPE_SECRET_KEY || "";
}

export async function getStripe(): Promise<Stripe> {
  const key = await getStripeSecretKey();
  if (!key) {
    throw new Error(
      "Stripe secret key not configured. Add it in Admin → Settings → API Keys."
    );
  }
  // Re-create client if key changed
  if (!_stripe || key !== _lastKey) {
    _stripe = new Stripe(key);
    _lastKey = key;
  }
  return _stripe;
}

/** Read any setting from DB with env fallback */
export async function getStripeSetting(
  dbKey: string,
  envFallback?: string
): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: dbKey },
    });
    const val = typeof setting?.value === "string" ? setting.value : "";
    if (val) return val;
  } catch {
    // DB unavailable
  }
  return envFallback || "";
}
