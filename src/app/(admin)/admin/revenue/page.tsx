import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { monthStartET, monthStartOffsetET } from "@/lib/timezone";

export default async function AdminRevenuePage() {
  const startOfMonth = monthStartET();
  const startOfLastMonth = monthStartOffsetET(-1);

  let monthlyData: { month: string; revenue: number; bookings: number }[] = [];
  let revenue = 0;
  let lastMonthRevenue = 0;
  let lastMonthCount = 0;
  let thisMonthCount = 0;
  let totalRevenueAmount = 0;
  let totalPaymentsCount = 0;
  let payrollCost = 0;
  let profit = 0;

  try {
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
    const monthlyDataArr: { month: string; revenue: number; bookings: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = monthStartOffsetET(-i);
      const monthEnd = monthStartOffsetET(-i + 1);
      const label = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

      const agg = await prisma.payment.aggregate({
        where: { status: "SUCCEEDED", paidAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amount: true },
        _count: true,
      });

      monthlyDataArr.push({
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

    monthlyData = monthlyDataArr;
    revenue = thisMonth._sum.amount ?? 0;
    lastMonthRevenue = lastMonth._sum.amount ?? 0;
    lastMonthCount = lastMonth._count;
    thisMonthCount = thisMonth._count;
    totalRevenueAmount = totalRevenue._sum.amount ?? 0;
    totalPaymentsCount = totalPayments;
    payrollCost = payrollThisMonth._sum.netPay ?? 0;
    profit = revenue - payrollCost;
  } catch (error) {
    console.error("Failed to fetch revenue data:", error);
  }

  const stats = [
    { label: "This Month", value: formatCurrency(revenue), sub: `${thisMonthCount} payments`, color: "text-green" },
    { label: "Last Month", value: formatCurrency(lastMonthRevenue), sub: `${lastMonthCount} payments`, color: "text-tobacco" },
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
          <div className="font-display text-3xl font-bold text-green mt-1">{formatCurrency(totalRevenueAmount)}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-tobacco">{totalPaymentsCount}</div>
          <div className="text-gray-400 text-[0.78rem]">Total Payments</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={monthlyData} />
    </div>
  );
}
