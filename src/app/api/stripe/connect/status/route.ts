import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accountId = req.nextUrl.searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json({ error: "accountId required" }, { status: 400 });
  }

  const stripe = await getStripe();
  const account = await stripe.accounts.retrieve(accountId);

  const onboarded = !!(account.details_submitted && account.payouts_enabled);

  // Sync status to DB
  if (onboarded) {
    await prisma.user.updateMany({
      where: { stripeConnectAccountId: accountId },
      data: { stripeConnectOnboarded: true },
    });
  }

  return NextResponse.json({
    accountId,
    detailsSubmitted: account.details_submitted,
    payoutsEnabled: account.payouts_enabled,
    onboarded,
  });
}
