import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          stripeConnectAccountId: true,
          stripeConnectOnboarded: true,
        },
      },
    },
  });

  if (!payroll) {
    return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
  }

  if (payroll.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Payroll must be APPROVED before paying" },
      { status: 400 }
    );
  }

  const { employee } = payroll;

  if (!employee.stripeConnectAccountId || !employee.stripeConnectOnboarded) {
    return NextResponse.json(
      { error: "Employee has not completed Stripe Connect onboarding" },
      { status: 400 }
    );
  }

  const amountInCents = Math.round(payroll.netPay * 100);
  if (amountInCents <= 0) {
    return NextResponse.json(
      { error: "Net pay must be greater than $0" },
      { status: 400 }
    );
  }

  const stripe = await getStripe();

  try {
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: "usd",
      destination: employee.stripeConnectAccountId,
      description: `Payroll for ${employee.name} — ${payroll.periodStart.toISOString().split("T")[0]} to ${payroll.periodEnd.toISOString().split("T")[0]}`,
      metadata: {
        payrollId: payroll.id,
        employeeId: employee.id,
      },
    });

    const updated = await prisma.payroll.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidVia: "STRIPE_CONNECT",
        stripeTransferId: transfer.id,
      },
      include: { employee: { select: { name: true } } },
    });

    return NextResponse.json({
      payroll: updated,
      transfer: { id: transfer.id, amount: transfer.amount },
    });
  } catch (err) {
    console.error("Stripe transfer failed:", err);
    return NextResponse.json(
      { error: "Stripe transfer failed", detail: String(err) },
      { status: 500 }
    );
  }
}
