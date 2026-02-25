import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

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

  // Check for existing payment intent
  const existingPayment = await prisma.payment.findFirst({
    where: {
      bookingId: booking.id,
      status: { in: ["PENDING", "PROCESSING"] },
      stripePaymentIntentId: { not: null },
    },
  });

  if (existingPayment?.stripePaymentIntentId) {
    // Retrieve existing intent
    const intent = await stripe.paymentIntents.retrieve(
      existingPayment.stripePaymentIntentId
    );
    return NextResponse.json({ clientSecret: intent.client_secret });
  }

  // Create Stripe PaymentIntent
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
