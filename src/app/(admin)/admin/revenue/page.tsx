import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/RevenueChart";

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

  // Get monthly data for the last 12 months
  const monthlyData: { month: string; revenue: number; bookings: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const agg = await prisma.payment.aggregate({
      where: { status: "SUCCEEDED", paidAt: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
      _count: true,
    });

    monthlyData.push({
      month: label,
      revenue: agg._sum.amount ?? 0,
      bookings: agg._count,
    });
  }

  // Get total payroll costs this month
  const payrollThisMonth = await prisma.payroll.aggregate({
    where: {
      status: { in: ["APPROVED", "PAID"] },
      periodStart: { gte: startOfMonth },
    },
    _sum: { netPay: true },
  });

  const revenue = thisMonth._sum.amount ?? 0;
  const payrollCost = payrollThisMonth._sum.netPay ?? 0;
  const profit = revenue - payrollCost;

  const stats = [
    { label: "This Month", value: formatCurrency(revenue), sub: `${thisMonth._count} payments`, color: "text-green" },
    { label: "Last Month", value: formatCurrency(lastMonth._sum.amount ?? 0), sub: `${lastMonth._count} payments`, color: "text-tobacco" },
    { label: "Payroll (This Month)", value: formatCurrency(payrollCost), sub: "Approved + Paid", color: "text-amber" },
    { label: "Net Profit (Est.)", value: formatCurrency(profit), sub: "Revenue − Payroll", color: profit >= 0 ? "text-green" : "text-red" },
  ];

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Revenue & Finance</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-[#ece6d9] text-center">
            <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 mb-1">{stat.label}</div>
            <div className={`font-display text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-[0.78rem] mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* All-Time Summary */}
      <div className="bg-ivory/50 rounded-xl p-5 border border-[#ece6d9] mb-8 flex items-center justify-between">
        <div>
          <div className="text-[0.72rem] uppercase tracking-wider text-gray-400">All-Time Revenue</div>
          <div className="font-display text-3xl font-bold text-green mt-1">{formatCurrency(totalRevenue._sum.amount ?? 0)}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-tobacco">{totalPayments}</div>
          <div className="text-gray-400 text-[0.78rem]">Total Payments</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={monthlyData} />
    </div>
  );
}
