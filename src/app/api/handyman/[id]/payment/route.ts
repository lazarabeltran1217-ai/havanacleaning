import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const inquiry = await prisma.handymanInquiry.findUnique({
    where: { id },
  });

  if (!inquiry || inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const paymentAmount = inquiry.quotedPrice ?? inquiry.estimatedTotal;
  if (inquiry.status !== "SCHEDULED" || !paymentAmount) {
    return NextResponse.json({ error: "Inquiry not ready for payment" }, { status: 400 });
  }

  const stripe = await getStripe();

  // Check for existing payment intent
  const existingPayment = await prisma.payment.findFirst({
    where: {
      handymanInquiryId: inquiry.id,
      status: { in: ["PENDING", "PROCESSING"] },
      stripePaymentIntentId: { not: null },
    },
  });

  if (existingPayment?.stripePaymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(existingPayment.stripePaymentIntentId);

    if (intent.status === "succeeded") {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { status: "SUCCEEDED", paidAt: new Date() },
      });
      return NextResponse.json({ alreadyPaid: true });
    }

    if (["requires_payment_method", "requires_confirmation", "requires_action"].includes(intent.status)) {
      return NextResponse.json({ clientSecret: intent.client_secret });
    }

    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { status: "FAILED" },
    });
  }

  // Check if already paid
  const succeededPayment = await prisma.payment.findFirst({
    where: { handymanInquiryId: inquiry.id, status: "SUCCEEDED" },
  });
  if (succeededPayment) {
    return NextResponse.json({ alreadyPaid: true });
  }

  const amountInCents = Math.round(paymentAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      handymanInquiryId: inquiry.id,
      customerId: session.user.id,
    },
    description: `Handyman Service - ${inquiry.id.slice(-6).toUpperCase()}`,
  });

  await prisma.payment.create({
    data: {
      handymanInquiryId: inquiry.id,
      customerId: session.user.id,
      amount: paymentAmount,
      status: "PENDING",
      method: "STRIPE",
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
