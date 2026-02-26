import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ServiceIcon } from "@/lib/service-icons";

export default async function AccountOverview() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/account");

  const [bookings, addresses] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: session.user.id },
      include: { service: { select: { name: true, icon: true } } },
      orderBy: { scheduledDate: "desc" },
      take: 3,
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      take: 3,
    }),
  ]);

  const upcomingCount = await prisma.booking.count({
    where: {
      customerId: session.user.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      scheduledDate: { gte: new Date() },
    },
  });

  return (
    <div className="space-y-8">
      <div className="bg-white border border-tobacco/10 rounded-lg p-6">
        <h2 className="font-display text-lg mb-1">
          Welcome back, {session.user.name}!
        </h2>
        <p className="text-sand text-[0.85rem]">{session.user.email}</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-tobacco/10 rounded-lg p-5 text-center">
          <div className="text-2xl font-bold text-green">{upcomingCount}</div>
          <div className="text-sand text-[0.78rem] uppercase tracking-wider mt-1">
            Upcoming
          </div>
        </div>
        <div className="bg-white border border-tobacco/10 rounded-lg p-5 text-center">
          <div className="text-2xl font-bold text-amber">
            {bookings.length}
          </div>
          <div className="text-sand text-[0.78rem] uppercase tracking-wider mt-1">
            Total Bookings
          </div>
        </div>
        <div className="bg-white border border-tobacco/10 rounded-lg p-5 text-center">
          <div className="text-2xl font-bold text-teal">
            {addresses.length}
          </div>
          <div className="text-sand text-[0.78rem] uppercase tracking-wider mt-1">
            Saved Addresses
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS */}
      <div className="bg-white border border-tobacco/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Recent Bookings</h2>
          <Link
            href="/account/bookings"
            className="text-green text-[0.82rem] hover:underline"
          >
            View All →
          </Link>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sand text-[0.9rem]">
            No bookings yet.{" "}
            <Link href="/book" className="text-green hover:underline">
              Book your first clean!
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between border-b border-tobacco/5 pb-3 last:border-0"
              >
                <div>
                  <div className="font-medium text-[0.9rem] flex items-center gap-1.5">
                    <ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}
                  </div>
                  <div className="text-sand text-[0.8rem]">
                    {formatDate(b.scheduledDate)} &middot; {b.bookingNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.85rem] font-medium">
                    {formatCurrency(b.total)}
                  </div>
                  <span
                    className={`text-[0.72rem] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      b.status === "CONFIRMED"
                        ? "bg-green/10 text-green"
                        : b.status === "COMPLETED"
                          ? "bg-teal/10 text-teal"
                          : b.status === "CANCELLED"
                            ? "bg-red/10 text-red"
                            : "bg-amber/10 text-amber"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
