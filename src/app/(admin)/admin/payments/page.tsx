import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";

const fetchPayments = () =>
  prisma.payment.findMany({
    include: {
      customer: { select: { name: true } },
      booking: { select: { bookingNumber: true, service: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

export default async function AdminPaymentsPage() {
  let payments: Awaited<ReturnType<typeof fetchPayments>> = [];
  try {
    payments = await fetchPayments();
  } catch (error) {
    console.error("Failed to fetch payments:", error);
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber/10 text-amber",
    PROCESSING: "bg-teal/10 text-teal",
    SUCCEEDED: "bg-green/10 text-green",
    FAILED: "bg-red/10 text-red",
    REFUNDED: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Payments</h2>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{p.customer.name}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                {formatStatus(p.status)}
              </span>
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Booking</span>
                <span className="text-gray-500">{p.booking ? `${p.booking.bookingNumber} — ${p.booking.service.name}` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Method</span>
                <span className="capitalize">{p.method.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Date</span>
                <span className="text-gray-500">{p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-sand">Amount</span>
                <span className="font-medium text-green">{formatCurrency(p.amount)}</span>
              </div>
            </div>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">No payments yet.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Customer</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Booking</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Method</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Date</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{p.customer.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  {p.booking ? `${p.booking.bookingNumber} — ${p.booking.service.name}` : "—"}
                </td>
                <td className="px-4 py-3 capitalize">{p.method.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}</td>
                <td className="px-4 py-3 text-right font-medium text-green">{formatCurrency(p.amount)}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No payments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
