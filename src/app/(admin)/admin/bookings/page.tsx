import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { QuickBookForm } from "@/components/admin/QuickBookForm";
import { BookingsTable } from "@/components/admin/BookingsTable";

export default async function AdminBookingsPage() {
  const fetchBookings = () =>
    prisma.booking.findMany({
      include: {
        service: { select: { name: true, icon: true } },
        customer: { select: { name: true, email: true, phone: true } },
        address: true,
        assignments: { include: { employee: { select: { name: true } } } },
        payments: { select: { status: true }, where: { status: "SUCCEEDED" }, take: 1 },
      },
      orderBy: { scheduledDate: "desc" },
      take: 50,
    });

  let bookings: Awaited<ReturnType<typeof fetchBookings>> = [];
  try {
    bookings = await fetchBookings();
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const todayCount = bookings.filter((b) => {
    const d = new Date(b.scheduledDate);
    return d >= today && d < tomorrow;
  }).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total, 0);

  const serialized = bookings.map((b) => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    status: b.status,
    scheduledDate: b.scheduledDate.toISOString(),
    scheduledTime: b.scheduledTime,
    total: b.total,
    service: b.service,
    customer: b.customer,
    assignments: b.assignments,
    isPaid: b.payments.length > 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">All Bookings</h2>
        <QuickBookForm />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Bookings</div>
          <div className="text-2xl font-display text-tobacco">{totalBookings}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Pending</div>
          <div className="text-2xl font-display text-amber">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Today</div>
          <div className="text-2xl font-display text-tobacco">{todayCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Revenue</div>
          <div className="text-2xl font-display text-green">{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      <BookingsTable bookings={serialized} />
    </div>
  );
}
