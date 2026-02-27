import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account/bookings");

  const bookings = await prisma.booking.findMany({
    where: { customerId: session.user.id },
    include: {
      service: { select: { name: true, icon: true } },
      address: true,
      payments: { select: { status: true } },
    },
    orderBy: { scheduledDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">My Bookings</h2>
        <Link
          href="/book"
          className="bg-gold text-tobacco px-5 py-2 text-[0.8rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber transition-colors"
        >
          Book New Clean
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-tobacco/10 rounded-lg p-12 text-center">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-sand text-[0.9rem] mb-4">
            You haven&apos;t booked any cleanings yet.
          </p>
          <Link
            href="/book"
            className="text-green hover:underline text-[0.9rem]"
          >
            Book your first clean →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-tobacco/10 rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ServiceIcon emoji={b.service.icon} className="w-5 h-5 text-green" />
                    <h3 className="font-display text-lg">{b.service.name}</h3>
                    <span
                      className={`text-[0.7rem] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-medium ${
                        b.status === "CONFIRMED"
                          ? "bg-green/10 text-green"
                          : b.status === "COMPLETED"
                            ? "bg-teal/10 text-teal"
                            : b.status === "CANCELLED"
                              ? "bg-red/10 text-red"
                              : "bg-amber/10 text-amber"
                      }`}
                    >
                      {formatStatus(b.status)}
                    </span>
                  </div>
                  <div className="text-sand text-[0.82rem] space-y-0.5">
                    <div>{formatDate(b.scheduledDate)} &middot; {b.scheduledTime}</div>
                    <div>Booking #{b.bookingNumber}</div>
                    {b.address && (
                      <div>
                        {b.address.street}, {b.address.city},{" "}
                        {b.address.state} {b.address.zipCode}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-lg font-semibold text-green">
                    {formatCurrency(b.total)}
                  </div>
                  {b.recurrence !== "ONCE" && (
                    <div className="text-[0.75rem] text-teal capitalize">
                      {b.recurrence.toLowerCase()}
                    </div>
                  )}
                  {b.status === "CONFIRMED" && !b.payments.some((p) => p.status === "SUCCEEDED") && (
                    <Link
                      href={`/account/bookings/${b.id}/pay`}
                      className="inline-block bg-green text-white px-5 py-2 text-[0.78rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 transition-colors"
                    >
                      Pay Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
