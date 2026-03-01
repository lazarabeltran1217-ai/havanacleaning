import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import Link from "next/link";
import { ServiceIcon } from "@/lib/service-icons";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { todayStartET, tomorrowStartET, monthStartET, monthStartOffsetET } from "@/lib/timezone";

const fetchRecentBookings = () =>
  prisma.booking.findMany({
    include: {
      service: { select: { name: true, icon: true } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

/** Build 6-month revenue + booking count data */
async function fetchMonthlyRevenue() {
  const months: { month: string; revenue: number; bookings: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const start = monthStartOffsetET(-i);
    const end = monthStartOffsetET(-i + 1);
    const label = start.toLocaleString("en-US", { month: "short", timeZone: "UTC" });

    const [rev, count] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED", paidAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      prisma.booking.count({
        where: { scheduledDate: { gte: start, lt: end } },
      }),
    ]);

    months.push({ month: label, revenue: rev._sum.amount ?? 0, bookings: count });
  }
  return months;
}

/** Booking counts grouped by status */
async function fetchBookingsByStatus() {
  const grouped = await prisma.booking.groupBy({
    by: ["status"],
    _count: true,
  });
  return grouped.map((g) => ({ status: g.status, count: g._count }));
}

/** Revenue totals per service */
async function fetchRevenueByService() {
  const bookingsWithPayments = await prisma.booking.findMany({
    where: { payments: { some: { status: "SUCCEEDED" } } },
    select: {
      service: { select: { name: true } },
      payments: {
        where: { status: "SUCCEEDED" },
        select: { amount: true },
      },
    },
  });

  const map = new Map<string, number>();
  for (const b of bookingsWithPayments) {
    const name = b.service.name;
    const total = b.payments.reduce((s, p) => s + p.amount, 0);
    map.set(name, (map.get(name) ?? 0) + total);
  }

  return Array.from(map.entries())
    .map(([service, revenue]) => ({ service, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);
}

export default async function AdminDashboard() {
  const startOfMonth = monthStartET();
  const todayStart = todayStartET();
  const tomorrowStart = tomorrowStartET();

  let totalBookings = 0;
  let pendingBookings = 0;
  let confirmedToday = 0;
  let employeeCount = 0;
  let customerCount = 0;
  let revenue = 0;
  let recentBookings: Awaited<ReturnType<typeof fetchRecentBookings>> = [];
  let newApplicants = 0;
  let newInquiries = 0;
  let monthlyRevenue: { month: string; revenue: number; bookings: number }[] = [];
  let bookingsByStatus: { status: string; count: number }[] = [];
  let revenueByService: { service: string; revenue: number }[] = [];

  try {
    const [
      _totalBookings,
      _pendingBookings,
      _confirmedToday,
      _employeeCount,
      _customerCount,
      monthRevenue,
      _recentBookings,
      _newApplicants,
      _newInquiries,
      _monthlyRevenue,
      _bookingsByStatus,
      _revenueByService,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "PENDING" } }),
      prisma.booking.count({
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          scheduledDate: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.user.count({ where: { role: "EMPLOYEE", isActive: true } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED", paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      fetchRecentBookings(),
      prisma.jobApplication.count({ where: { status: "NEW" } }),
      prisma.commercialInquiry.count({ where: { status: "NEW" } }),
      fetchMonthlyRevenue(),
      fetchBookingsByStatus(),
      fetchRevenueByService(),
    ]);

    totalBookings = _totalBookings;
    pendingBookings = _pendingBookings;
    confirmedToday = _confirmedToday;
    employeeCount = _employeeCount;
    customerCount = _customerCount;
    revenue = monthRevenue._sum.amount ?? 0;
    recentBookings = _recentBookings;
    newApplicants = _newApplicants;
    newInquiries = _newInquiries;
    monthlyRevenue = _monthlyRevenue;
    bookingsByStatus = _bookingsByStatus;
    revenueByService = _revenueByService;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const stats = [
    { label: "Monthly Revenue", value: formatCurrency(revenue), color: "text-green" },
    { label: "Total Bookings", value: totalBookings.toString(), color: "text-amber" },
    { label: "Today's Jobs", value: confirmedToday.toString(), color: "text-teal" },
    { label: "Pending", value: pendingBookings.toString(), color: "text-gold" },
    { label: "Employees", value: employeeCount.toString(), color: "text-green" },
    { label: "Customers", value: customerCount.toString(), color: "text-caribbean" },
    { label: "New Applicants", value: newApplicants.toString(), color: "text-amber" },
    { label: "New Inquiries", value: newInquiries.toString(), color: "text-teal" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-[#ece6d9] shadow-sm">
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">{stat.label}</div>
            <div className={`font-display text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6">
        <DashboardCharts
          monthlyRevenue={monthlyRevenue}
          bookingsByStatus={bookingsByStatus}
          revenueByService={revenueByService}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#ece6d9]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base">Recent Bookings</h3>
            <Link href="/admin/bookings" className="text-green text-[0.78rem] hover:underline">View All →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <div className="text-[0.85rem] font-medium flex items-center gap-1.5"><ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}</div>
                    <div className="text-gray-400 text-[0.78rem]">{b.customer.name} &middot; {formatDate(b.scheduledDate)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.82rem] font-medium">{formatCurrency(b.total)}</div>
                    <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                      b.status === "CONFIRMED" ? "bg-green/10 text-green" :
                      b.status === "COMPLETED" ? "bg-teal/10 text-teal" :
                      b.status === "CANCELLED" ? "bg-red/10 text-red" :
                      "bg-amber/10 text-amber"
                    }`}>{formatStatus(b.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
            <h3 className="font-display text-base mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/bookings" className="block bg-gold text-white text-sm py-2.5 rounded-lg font-semibold text-center hover:bg-amber transition-colors">New Booking</Link>
              <Link href="/admin/staff/new" className="block bg-green text-white text-sm py-2.5 rounded-lg font-semibold text-center hover:bg-green/90 transition-colors">Add Employee</Link>
              <Link href="/admin/applicants" className="block border border-gold text-gold text-sm py-2.5 rounded-lg font-semibold text-center hover:bg-gold hover:text-white transition-colors">Applicants ({newApplicants})</Link>
              <Link href="/admin/commercial" className="block border border-teal text-teal text-sm py-2.5 rounded-lg font-semibold text-center hover:bg-teal hover:text-white transition-colors">Commercial ({newInquiries})</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
