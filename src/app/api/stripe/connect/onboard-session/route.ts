import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { employeeId } = await req.json();
  if (!employeeId) {
    return NextResponse.json({ error: "employeeId required" }, { status: 400 });
  }

  const employee = await prisma.user.findUnique({
    where: { id: employeeId },
    select: { id: true, email: true, name: true, stripeConnectAccountId: true, stripeConnectOnboarded: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  try {
    const stripe = await getStripe();

    let accountId = employee.stripeConnectAccountId;

    // Delete any non-onboarded account and recreate as controller-based
    if (accountId && !employee.stripeConnectOnboarded) {
      try {
        await stripe.accounts.del(accountId);
      } catch {
        // Account may already be deleted
      }
      accountId = null;
    }

    if (!accountId) {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: { type: "none" },
          fees: { payer: "application" },
          losses: { payments: "stripe" },
          requirement_collection: "stripe",
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        country: "US",
        email: employee.email,
        metadata: { employeeId: employee.id },
      } as Parameters<typeof stripe.accounts.create>[0]);

      accountId = account.id;

      await prisma.user.update({
        where: { id: employee.id },
        data: { stripeConnectAccountId: accountId },
      });
    }

    // Use account_management + payouts (renders inline like employee portal)
    const accountSession = await stripe.accountSessions.create({
      account: accountId,
      components: {
        account_management: { enabled: true },
        payouts: { enabled: true },
      },
    });

    // Get publishable key
    const pubSetting = await prisma.setting.findUnique({ where: { key: "api_stripe_publishable" } }).catch(() => null);
    const publishableKey = (typeof pubSetting?.value === "string" ? pubSetting.value : null)
      || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      || "";

    return NextResponse.json({
      clientSecret: accountSession.client_secret,
      publishableKey,
      accountId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe onboard session error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
