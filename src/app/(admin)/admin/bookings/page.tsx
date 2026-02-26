import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ServiceIcon } from "@/lib/service-icons";
import { QuickBookForm } from "@/components/admin/QuickBookForm";

export default async function AdminBookingsPage() {
  const fetchBookings = () =>
    prisma.booking.findMany({
      include: {
        service: { select: { name: true, icon: true } },
        customer: { select: { name: true, email: true, phone: true } },
        address: true,
        assignments: { include: { employee: { select: { name: true } } } },
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

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber/10 text-amber",
    CONFIRMED: "bg-green/10 text-green",
    IN_PROGRESS: "bg-teal/10 text-teal",
    COMPLETED: "bg-green/20 text-green",
    CANCELLED: "bg-red/10 text-red",
    NO_SHOW: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">All Bookings</h2>
        <QuickBookForm />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[0.8rem] font-medium">{b.bookingNumber}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || ""}`}>
                {b.status}
              </span>
            </div>
            <div className="text-[0.88rem] font-medium mb-1 flex items-center gap-1.5"><ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}</div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Customer</span>
                <span className="text-right">
                  <div>{b.customer.name}</div>
                  <div className="text-gray-400 text-[0.75rem]">{b.customer.email}</div>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Date</span>
                <span className="text-right">
                  <div>{formatDate(b.scheduledDate)}</div>
                  <div className="text-gray-400 text-[0.75rem] capitalize">{b.scheduledTime}</div>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Assigned</span>
                <span>
                  {b.assignments.length > 0
                    ? b.assignments.map((a) => a.employee.name).join(", ")
                    : <span className="text-gray-300">Unassigned</span>}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-medium text-green">{formatCurrency(b.total)}</span>
                <Link href={`/admin/bookings/${b.id}`} className="text-green text-[0.78rem] font-medium hover:underline">View →</Link>
              </div>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            No bookings yet.
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Booking #</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Service</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Customer</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Date</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Assigned</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium text-right">Total</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-mono text-[0.8rem]">{b.bookingNumber}</td>
                <td className="px-4 py-3"><span className="flex items-center gap-1.5"><ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}</span></td>
                <td className="px-4 py-3">
                  <div>{b.customer.name}</div>
                  <div className="text-gray-400 text-[0.75rem]">{b.customer.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{formatDate(b.scheduledDate)}</div>
                  <div className="text-gray-400 text-[0.75rem] capitalize">{b.scheduledTime}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[0.7rem] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] || ""}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[0.82rem]">
                  {b.assignments.length > 0
                    ? b.assignments.map((a) => a.employee.name).join(", ")
                    : <span className="text-gray-300">Unassigned</span>}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(b.total)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${b.id}`} className="text-green text-[0.78rem] hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
