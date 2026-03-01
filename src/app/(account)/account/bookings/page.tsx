import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, MapPin, CreditCard } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";

const CARD =
  "bg-white dark:bg-[#231c16] rounded-2xl border border-gray-100 dark:border-[#3a2f25] shadow-sm";
const TEXT_PRIMARY = "text-tobacco dark:text-cream";
const TEXT_MUTED = "text-gray-400 dark:text-sand/70";

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green/10 text-green",
  PENDING: "bg-amber-100 text-amber-600",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green/20 text-green",
  CANCELLED: "bg-red/10 text-red-500",
  NO_SHOW: "bg-gray-100 text-gray-500 dark:bg-[#1a1410] dark:text-sand/50",
};

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
      <div className="flex items-center justify-between mb-5">
        <h2 className={`font-display text-xl ${TEXT_PRIMARY}`}>My Bookings</h2>
        <Link
          href="/book"
          className="bg-green text-white px-5 py-2 text-[0.8rem] font-semibold rounded-lg hover:bg-green/90 transition-colors"
        >
          Book New Clean
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className={`${CARD} p-12 text-center`}>
          <Sparkles className={`w-10 h-10 mx-auto mb-4 ${TEXT_MUTED}`} />
          <p className={`${TEXT_MUTED} text-[0.9rem] mb-4`}>
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
            <div key={b.id} className={`${CARD} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ServiceIcon
                      emoji={b.service.icon}
                      className="w-5 h-5 text-green"
                    />
                    <h3 className={`font-display text-lg ${TEXT_PRIMARY}`}>
                      {b.service.name}
                    </h3>
                    <span
                      className={`text-[0.65rem] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-500"}`}
                    >
                      {formatStatus(b.status)}
                    </span>
                  </div>
                  <div
                    className={`text-gray-500 dark:text-sand/60 text-[0.82rem] space-y-0.5`}
                  >
                    <div>
                      {formatDate(b.scheduledDate)} &middot; {b.scheduledTime}
                    </div>
                    <div className={TEXT_MUTED}>
                      Booking #{b.bookingNumber}
                    </div>
                    {b.address && (
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400 dark:text-sand/50" />
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
                  {b.status === "CONFIRMED" &&
                    !b.payments.some((p) => p.status === "SUCCEEDED") && (
                      <Link
                        href={`/account/bookings/${b.id}/pay`}
                        className="inline-flex items-center gap-1 bg-green text-white px-4 py-2 text-[0.78rem] font-semibold rounded-lg hover:bg-green/90 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Now
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
