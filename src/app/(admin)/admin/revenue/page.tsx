import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminRevenuePage() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonth, lastMonth, totalRevenue, totalPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED", paidAt: { gte: startOfLastMonth, lt: startOfMonth } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: "SUCCEEDED" } }),
  ]);

  const stats = [
    { label: "This Month", value: formatCurrency(thisMonth._sum.amount ?? 0), sub: `${thisMonth._count} payments` },
    { label: "Last Month", value: formatCurrency(lastMonth._sum.amount ?? 0), sub: `${lastMonth._count} payments` },
    { label: "All Time Revenue", value: formatCurrency(totalRevenue._sum.amount ?? 0), sub: `${totalPayments} total payments` },
  ];

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Revenue</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-[#ece6d9] text-center">
            <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1">{stat.label}</div>
            <div className="font-display text-2xl font-bold text-green">{stat.value}</div>
            <div className="text-gray-400 text-[0.78rem] mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-12 border border-[#ece6d9] text-center">
        <div className="text-4xl mb-4">📈</div>
        <p className="text-gray-400 text-[0.9rem]">
          Revenue charts and detailed analytics will appear here once you have
          payment data.
        </p>
      </div>
    </div>
  );
}
