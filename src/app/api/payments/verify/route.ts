import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) {
      return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
    }

    const stripe = await getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not succeeded", status: intent.status });
    }

    // Update payment record
    await prisma.payment.updateMany({
      where: {
        stripePaymentIntentId: paymentIntentId,
        status: { not: "SUCCEEDED" },
      },
      data: {
        status: "SUCCEEDED",
        paidAt: new Date(),
      },
    });

    // Find and update the associated booking
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      select: { bookingId: true },
    });

    if (payment?.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
