import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
  });

  if (!user?.stripeConnectAccountId || !user.stripeConnectOnboarded) {
    return NextResponse.json({ error: "Stripe payout not set up" }, { status: 400 });
  }

  try {
    const stripe = await getStripe();
    const loginLink = await stripe.accounts.createLoginLink(user.stripeConnectAccountId);
    return NextResponse.json({ url: loginLink.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe dashboard link error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
