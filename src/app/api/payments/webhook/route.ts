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

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
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

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;

    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}
