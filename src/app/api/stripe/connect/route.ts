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
    select: { id: true, email: true, name: true, stripeConnectAccountId: true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  const stripe = await getStripe();

  // If they already have an account, just generate a new onboarding link
  let accountId = employee.stripeConnectAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: employee.email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { employeeId: employee.id },
    });

    accountId = account.id;

    await prisma.user.update({
      where: { id: employee.id },
      data: { stripeConnectAccountId: accountId },
    });
  }

  const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "";

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/admin/staff/connect/refresh?accountId=${accountId}`,
    return_url: `${origin}/admin/staff/connect/complete?accountId=${accountId}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url, accountId });
}
