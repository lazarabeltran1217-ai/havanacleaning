import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: {
      customer: { select: { name: true } },
      booking: { select: { bookingNumber: true, service: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-[0.85rem] min-w-[600px]">
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
    </div>
  );
}
