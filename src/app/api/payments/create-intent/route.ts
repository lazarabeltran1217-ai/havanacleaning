import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await req.json();
  if (!bookingId) {
    return NextResponse.json(
      { error: "Missing bookingId" },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: { select: { name: true } } },
  });

  if (!booking || booking.customerId !== session.user.id) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  const stripe = await getStripe();

  // Check for existing payment intent
  const existingPayment = await prisma.payment.findFirst({
    where: {
      bookingId: booking.id,
      status: { in: ["PENDING", "PROCESSING"] },
      stripePaymentIntentId: { not: null },
    },
  });

  if (existingPayment?.stripePaymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(
      existingPayment.stripePaymentIntentId
    );

    // Intent already succeeded — update DB and tell client it's paid
    if (intent.status === "succeeded") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "SUCCEEDED", paidAt: new Date() },
      });
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CONFIRMED" },
      });
      return NextResponse.json({ alreadyPaid: true });
    }

    // Intent is still usable (requires_payment_method, requires_confirmation, etc.)
    if (intent.status === "requires_payment_method" || intent.status === "requires_confirmation" || intent.status === "requires_action") {
      return NextResponse.json({ clientSecret: intent.client_secret });
    }

    // Intent is in a terminal state (canceled, etc.) — mark old payment failed, create new one
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { status: "FAILED" },
    });
  }

  // Also check if booking is already fully paid
  const succeededPayment = await prisma.payment.findFirst({
    where: { bookingId: booking.id, status: "SUCCEEDED" },
  });
  if (succeededPayment) {
    return NextResponse.json({ alreadyPaid: true });
  }

  // Create new Stripe PaymentIntent
  const amountInCents = Math.round(booking.total * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      customerId: session.user.id,
    },
    description: `${booking.service.name} - ${booking.bookingNumber}`,
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      customerId: session.user.id,
      amount: booking.total,
      status: "PENDING",
      method: "STRIPE",
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
