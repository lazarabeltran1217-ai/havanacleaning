import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { QuickBookForm } from "@/components/admin/QuickBookForm";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      service: { select: { name: true, icon: true } },
      customer: { select: { name: true, email: true, phone: true } },
      address: true,
      assignments: { include: { employee: { select: { name: true } } } },
    },
    orderBy: { scheduledDate: "desc" },
    take: 50,
  });

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

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <div className="overflow-x-auto">
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
                  <td className="px-4 py-3">{b.service.icon} {b.service.name}</td>
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
    </div>
  );
}
