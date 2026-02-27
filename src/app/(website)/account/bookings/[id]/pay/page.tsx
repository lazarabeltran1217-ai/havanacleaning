import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ServiceIcon } from "@/lib/service-icons";
import { BookingPayment } from "@/components/website/BookingPayment";
import { getStripe } from "@/lib/stripe";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pay for Booking | Havana Cleaning",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    redirect_status?: string;
    payment_intent?: string;
  }>;
}

export default async function BookingPayPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account/bookings");

  const { id } = await params;
  const { redirect_status, payment_intent } = await searchParams;

  const [booking, stripeSetting] = await Promise.all([
    prisma.booking.findUnique({
      where: { id },
      include: {
        service: { select: { name: true, icon: true } },
        address: true,
        payments: { select: { status: true, stripePaymentIntentId: true } },
      },
    }),
    prisma.setting.findUnique({ where: { key: "api_stripe_publishable" } }),
  ]);

  if (!booking || booking.customerId !== session.user.id) notFound();

  let isPaid = booking.payments.some((p) => p.status === "SUCCEEDED");

  // Stripe redirected back — verify payment and update DB (webhook fallback)
  if (redirect_status === "succeeded" && payment_intent && !isPaid) {
    try {
      const stripe = await getStripe();
      const intent = await stripe.paymentIntents.retrieve(payment_intent);

      if (intent.status === "succeeded") {
        // Update payment record
        await prisma.payment.updateMany({
          where: {
            stripePaymentIntentId: payment_intent,
            status: { not: "SUCCEEDED" },
          },
          data: {
            status: "SUCCEEDED",
            paidAt: new Date(),
          },
        });

        // Update booking status
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED" },
        });

        isPaid = true;
      }
    } catch (error) {
      console.error("Failed to verify payment with Stripe:", error);
    }
  }

  // Show success screen
  if (redirect_status === "succeeded" || isPaid) {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <CheckCircle className="w-16 h-16 text-green mx-auto mb-6" />
        <h2 className="font-display text-3xl mb-3">Payment Successful!</h2>
        <p className="text-sand text-[0.85rem] mb-6">
          Booking #{booking.bookingNumber}
        </p>
        <p className="text-[#5a4535] text-[0.95rem] leading-relaxed mb-8">
          Thank you for your payment. Your cleaning is confirmed and our team
          will be there on the scheduled date.
        </p>
        <Link
          href="/account/bookings"
          className="inline-block bg-green text-white px-8 py-3 rounded-[3px] font-semibold text-[0.9rem] hover:bg-green/90 transition-colors"
        >
          View My Bookings
        </Link>
      </div>
    );
  }

  const stripeKey =
    (typeof stripeSetting?.value === "string" ? stripeSetting.value : "") ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "";

  if (!stripeKey) {
    return (
      <div className="text-center py-12">
        <p className="text-red text-[0.9rem]">
          Payment system is not configured yet. Please contact us to arrange payment.
        </p>
        <Link
          href="/account/bookings"
          className="mt-4 inline-block text-green hover:underline text-[0.9rem]"
        >
          ← Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/account/bookings"
        className="text-sand text-[0.82rem] hover:text-green transition-colors mb-6 inline-block"
      >
        ← Back to My Bookings
      </Link>

      <h2 className="font-display text-2xl text-center mb-8">
        Complete Payment
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BOOKING SUMMARY */}
        <div className="bg-white border border-tobacco/10 rounded-lg p-6">
          <h3 className="font-display text-lg mb-4">Booking Details</h3>
          <div className="flex items-center gap-3 mb-4">
            <ServiceIcon emoji={booking.service.icon} className="w-6 h-6 text-green" />
            <span className="font-display text-[1rem]">{booking.service.name}</span>
          </div>
          <dl className="space-y-3 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-sand">Date</dt>
              <dd>{formatDate(booking.scheduledDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sand">Time</dt>
              <dd className="capitalize">{booking.scheduledTime}</dd>
            </div>
            {booking.bedrooms && (
              <div className="flex justify-between">
                <dt className="text-sand">Size</dt>
                <dd>{booking.bedrooms} bed / {booking.bathrooms} bath</dd>
              </div>
            )}
            {booking.address && (
              <div className="flex justify-between">
                <dt className="text-sand">Address</dt>
                <dd className="text-right">
                  {booking.address.street}
                  {booking.address.unit && `, ${booking.address.unit}`}
                  <br />
                  {booking.address.city}, {booking.address.state}{" "}
                  {booking.address.zipCode}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 pt-4 border-t border-tobacco/10 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-green">{formatCurrency(booking.total)}</span>
          </div>
        </div>

        {/* PAYMENT FORM */}
        <div>
          <BookingPayment
            bookingId={booking.id}
            amount={booking.total}
            returnUrl={`/account/bookings/${booking.id}/pay`}
            stripeKey={stripeKey}
          />
        </div>
      </div>
    </div>
  );
}
