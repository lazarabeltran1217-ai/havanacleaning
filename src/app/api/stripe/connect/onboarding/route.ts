import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountId } = await req.json();
  if (!accountId) {
    return NextResponse.json({ error: "accountId required" }, { status: 400 });
  }

  const stripe = await getStripe();
  const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "";

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/admin/staff/connect/refresh?accountId=${accountId}`,
    return_url: `${origin}/admin/staff/connect/complete?accountId=${accountId}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
