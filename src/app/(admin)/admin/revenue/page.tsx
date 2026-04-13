import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart, PLChart } from "@/components/admin/RevenueChart";
import { ExpenseSection } from "@/components/admin/ExpenseForm";
import { monthStartET, monthStartOffsetET } from "@/lib/timezone";

export default async function AdminRevenuePage() {
  const startOfMonth = monthStartET();
  const startOfLastMonth = monthStartOffsetET(-1);

  let monthlyData: { month: string; revenue: number; paid: number; bookings: number }[] = [];
  let plData: { month: string; revenue: number; paid: number; expenses: number; payroll: number; profit: number }[] = [];
  let revenue = 0;
  let lastMonthRevenue = 0;
  let lastMonthCount = 0;
  let thisMonthCount = 0;
  let totalRevenueAmount = 0;
  let totalPaymentsCount = 0;
  let payrollCost = 0;
  let expensesThisMonth = 0;
  let profit = 0;
  let recentExpenses: { id: string; date: string; amount: number; category: string; description: string | null; vendor: string | null }[] = [];

  try {
    const [thisMonth, lastMonth, totalRevenue, totalPayments, payrollThisMonth, expThisMonth, rawExpenses] = await Promise.all([
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
      prisma.payroll.aggregate({
        where: { status: { in: ["APPROVED", "PAID"] }, periodStart: { gte: startOfMonth } },
        _sum: { netPay: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.findMany({
        orderBy: { date: "desc" },
        take: 20,
      }),
    ]);

    // Build monthly data for last 12 months
    const monthlyArr: typeof monthlyData = [];
    const plArr: typeof plData = [];

    for (let i = 11; i >= 0; i--) {
      const monthStart = monthStartOffsetET(-i);
      const monthEnd = monthStartOffsetET(-i + 1);
      const label = monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

      const [paidAgg, bookedAgg, hmBookedAgg, expAgg, payAgg] = await Promise.all([
        prisma.payment.aggregate({
          where: { status: "SUCCEEDED", paidAt: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.booking.aggregate({
          where: { scheduledDate: { gte: monthStart, lt: monthEnd }, status: { not: "CANCELLED" } },
          _sum: { total: true },
          _count: true,
        }),
        prisma.handymanInquiry.aggregate({
          where: { preferredDate: { gte: monthStart, lt: monthEnd }, status: { not: "CANCELLED" } },
          _sum: { estimatedTotal: true },
          _count: true,
        }),
        prisma.expense.aggregate({
          where: { date: { gte: monthStart, lt: monthEnd } },
          _sum: { amount: true },
        }),
        prisma.payroll.aggregate({
          where: { status: { in: ["APPROVED", "PAID"] }, periodStart: { gte: monthStart, lt: monthEnd } },
          _sum: { netPay: true },
        }),
      ]);

      const bookedRevenue = (bookedAgg._sum.total ?? 0) + (hmBookedAgg._sum.estimatedTotal ?? 0);
      const paidRevenue = paidAgg._sum.amount ?? 0;
      const expAmount = expAgg._sum.amount ?? 0;
      const payAmount = payAgg._sum.netPay ?? 0;
      const bookingsCount = bookedAgg._count + hmBookedAgg._count;

      monthlyArr.push({
        month: label,
        revenue: bookedRevenue,
        paid: paidRevenue,
        bookings: bookingsCount,
      });

      plArr.push({
        month: label,
        revenue: bookedRevenue,
        paid: paidRevenue,
        expenses: expAmount,
        payroll: payAmount,
        profit: paidRevenue - expAmount - payAmount,
      });
    }

    monthlyData = monthlyArr;
    plData = plArr;
    revenue = thisMonth._sum.amount ?? 0;
    lastMonthRevenue = lastMonth._sum.amount ?? 0;
    lastMonthCount = lastMonth._count;
    thisMonthCount = thisMonth._count;
    totalRevenueAmount = totalRevenue._sum.amount ?? 0;
    totalPaymentsCount = totalPayments;
    payrollCost = payrollThisMonth._sum.netPay ?? 0;
    expensesThisMonth = expThisMonth._sum.amount ?? 0;
    profit = revenue - payrollCost - expensesThisMonth;
    recentExpenses = rawExpenses.map((e) => ({
      id: e.id,
      date: e.date.toISOString(),
      amount: e.amount,
      category: e.category,
      description: e.description,
      vendor: e.vendor,
    }));
  } catch (error) {
    console.error("Failed to fetch revenue data:", error);
  }

  const stats = [
    { label: "This Month", value: formatCurrency(revenue), sub: `${thisMonthCount} payments`, color: "text-green" },
    { label: "Last Month", value: formatCurrency(lastMonthRevenue), sub: `${lastMonthCount} payments`, color: "text-tobacco" },
    { label: "Payroll (This Month)", value: formatCurrency(payrollCost), sub: "Approved + Paid", color: "text-amber" },
    { label: "Expenses (This Month)", value: formatCurrency(expensesThisMonth), sub: "All categories", color: "text-red-600" },
    { label: "Net Profit (Est.)", value: formatCurrency(profit), sub: "Revenue \u2212 Payroll \u2212 Expenses", color: profit >= 0 ? "text-green" : "text-red-600" },
  ];

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Revenue & Finance</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
      <div className="mb-6">
        <RevenueChart data={monthlyData} />
      </div>

      {/* P&L Chart */}
      <div className="mb-6">
        <PLChart data={plData} />
      </div>

      {/* Expenses Section */}
      <ExpenseSection expenses={recentExpenses} />
    </div>
  );
}
