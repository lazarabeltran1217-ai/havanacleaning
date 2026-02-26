import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { BookingPayment } from "@/components/website/BookingPayment";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ServiceIcon } from "@/lib/service-icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm & Pay | Havana Cleaning",
};

interface Props {
  searchParams: Promise<{ bookingId?: string }>;
}

export default async function ConfirmPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/book");

  const { bookingId } = await searchParams;
  if (!bookingId) redirect("/book");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { select: { name: true, icon: true } },
      addOns: { include: { addOn: { select: { name: true } } } },
      address: true,
    },
  });

  if (!booking || booking.customerId !== session.user.id) notFound();

  // Check if already paid
  const existingPayment = await prisma.payment.findFirst({
    where: { bookingId: booking.id, status: "SUCCEEDED" },
  });

  if (existingPayment) {
    return (
      <section className="bg-ivory min-h-screen pt-36 pb-20 px-6 md:px-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="font-display text-3xl mb-4">Booking Confirmed!</h1>
          <p className="text-[#7a6555] mb-2">
            Booking #{booking.bookingNumber}
          </p>
          <p className="text-[#7a6555] mb-8">
            {booking.service.name} on {formatDate(booking.scheduledDate)}
          </p>
          <a
            href="/account/bookings"
            className="inline-block bg-green text-white px-8 py-3 rounded-[3px] font-semibold hover:bg-green/90 transition-colors"
          >
            View My Bookings
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-ivory min-h-screen pt-36 pb-20 px-6 md:px-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-center mb-10">
          Confirm & Pay
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ORDER DETAILS */}
          <div className="bg-white border border-tobacco/10 rounded-lg p-6">
            <h2 className="font-display text-lg mb-4">Booking Details</h2>
            <dl className="space-y-3 text-[0.9rem]">
              <div className="flex justify-between">
                <dt className="text-sand">Service</dt>
                <dd>
                  <span className="flex items-center gap-1.5"><ServiceIcon emoji={booking.service.icon} className="w-4 h-4 text-green" /> {booking.service.name}</span>
                </dd>
              </div>
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
                  <dd>
                    {booking.bedrooms} bed / {booking.bathrooms} bath
                  </dd>
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
              {booking.recurrence !== "ONCE" && (
                <div className="flex justify-between">
                  <dt className="text-sand">Schedule</dt>
                  <dd className="capitalize">{booking.recurrence.toLowerCase()}</dd>
                </div>
              )}
            </dl>

            {booking.addOns.length > 0 && (
              <div className="mt-4 pt-4 border-t border-tobacco/10">
                <h3 className="text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  Add-Ons
                </h3>
                {booking.addOns.map((ba) => (
                  <div
                    key={ba.id}
                    className="flex justify-between text-[0.85rem]"
                  >
                    <span>{ba.addOn.name}</span>
                    <span>{formatCurrency(ba.price)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-tobacco/10 space-y-1 text-[0.9rem]">
              <div className="flex justify-between">
                <span className="text-sand">Subtotal</span>
                <span>{formatCurrency(booking.subtotal)}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-green">
                  <span>Discount</span>
                  <span>-{formatCurrency(booking.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sand">Tax</span>
                <span>{formatCurrency(booking.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-tobacco/10">
                <span>Total</span>
                <span className="text-green">
                  {formatCurrency(booking.total)}
                </span>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div>
            <BookingPayment
              bookingId={booking.id}
              amount={booking.total}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
