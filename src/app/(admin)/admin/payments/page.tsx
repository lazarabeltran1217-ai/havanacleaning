import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PaymentsTable } from "@/components/admin/PaymentsTable";

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

  const totalCollected = payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;
  const succeededCount = payments.filter((p) => p.status === "SUCCEEDED").length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthTotal = payments
    .filter((p) => p.status === "SUCCEEDED" && new Date(p.createdAt) >= monthStart)
    .reduce((sum, p) => sum + p.amount, 0);

  const serialized = payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    status: p.status,
    method: p.method,
    paidAt: p.paidAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    customerName: p.customer.name ?? "",
    bookingInfo: p.booking ? `${p.booking.bookingNumber} \u2014 ${p.booking.service.name}` : null,
  }));

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Payments</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Collected</div>
          <div className="text-2xl font-display text-green">{formatCurrency(totalCollected)}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Pending</div>
          <div className="text-2xl font-display text-amber">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Succeeded</div>
          <div className="text-2xl font-display text-green">{succeededCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">This Month</div>
          <div className="text-2xl font-display text-tobacco">{formatCurrency(thisMonthTotal)}</div>
        </div>
      </div>

      <PaymentsTable payments={serialized} />
    </div>
  );
}
