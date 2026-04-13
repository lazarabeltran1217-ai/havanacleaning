import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin can pass employeeId to manage an employee's account
  let body: { employeeId?: string } = {};
  try { body = await req.json(); } catch { /* no body = self-service */ }

  let targetUserId = session.user.id;
  if (body.employeeId && session.user.role === "OWNER") {
    targetUserId = body.employeeId;
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
  });

  if (!user?.stripeConnectAccountId) {
    return NextResponse.json({ error: "Stripe payout not set up" }, { status: 400 });
  }

  // Only enforce onboarded check for self-service (employees)
  if (!body.employeeId && !user.stripeConnectOnboarded) {
    return NextResponse.json({ error: "Stripe payout not set up" }, { status: 400 });
  }

  try {
    const stripe = await getStripe();
    const accountSession = await stripe.accountSessions.create({
      account: user.stripeConnectAccountId,
      components: {
        account_management: { enabled: true },
        payouts: { enabled: true },
      },
    });

    return NextResponse.json({ clientSecret: accountSession.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe account session error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
