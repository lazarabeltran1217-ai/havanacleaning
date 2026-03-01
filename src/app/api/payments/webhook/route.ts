import { NextRequest, NextResponse } from "next/server";
import { getStripe, getStripeSetting } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const webhookSecret = await getStripeSetting(
    "api_stripe_webhook_secret",
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = await getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = event.type as string;

  if (eventType === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as { id: string; metadata?: Record<string, string> };
    const bookingId = paymentIntent.metadata?.bookingId;

    if (bookingId) {
      // Update payment status
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: paymentIntent.id },
        data: {
          status: "SUCCEEDED",
          paidAt: new Date(),
        },
      });

      // Confirm booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      });
    }
  }

  if (eventType === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as { id: string };

    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: "FAILED" },
    });
  }

  // Stripe Connect: contractor finished onboarding
  if (eventType === "account.updated") {
    const account = event.data.object as { id: string; details_submitted?: boolean; payouts_enabled?: boolean };
    if (account.details_submitted && account.payouts_enabled) {
      await prisma.user.updateMany({
        where: { stripeConnectAccountId: account.id },
        data: { stripeConnectOnboarded: true },
      });
    }
  }

  // Stripe Connect: transfer to contractor failed
  if (eventType === "transfer.failed") {
    const transfer = event.data.object as { id: string; metadata?: Record<string, string> };
    const payrollId = transfer.metadata?.payrollId;
    if (payrollId) {
      console.error("Transfer failed for payroll:", payrollId, transfer.id);
      await prisma.payroll.update({
        where: { id: payrollId },
        data: {
          status: "APPROVED",
          paidAt: null,
          paidVia: null,
          stripeTransferId: null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
