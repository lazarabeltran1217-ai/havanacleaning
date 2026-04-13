import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateShort, formatStatus } from "@/lib/utils";
import Link from "next/link";
import { ServiceIcon } from "@/lib/service-icons";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { LiveClock } from "@/components/admin/LiveClock";
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

/** Build 6-month revenue + booking count data (includes handyman) */
async function fetchMonthlyRevenue() {
  const months: { month: string; revenue: number; bookings: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const start = monthStartOffsetET(-i);
    const end = monthStartOffsetET(-i + 1);
    const label = start.toLocaleString("en-US", { month: "short", timeZone: "UTC" });

    const [rev, count, hmCount] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "SUCCEEDED", paidAt: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      prisma.booking.count({
        where: { scheduledDate: { gte: start, lt: end } },
      }),
      prisma.handymanInquiry.count({
        where: { preferredDate: { gte: start, lt: end }, status: { not: "CANCELLED" } },
      }),
    ]);

    months.push({ month: label, revenue: rev._sum.amount ?? 0, bookings: count + hmCount });
  }
  return months;
}

/** Booking counts grouped by status (includes handyman) */
async function fetchBookingsByStatus() {
  const [grouped, hmGrouped] = await Promise.all([
    prisma.booking.groupBy({ by: ["status"], _count: true }),
    prisma.handymanInquiry.groupBy({ by: ["status"], _count: true }),
  ]);

  const map = new Map<string, number>();
  for (const g of grouped) map.set(g.status, (map.get(g.status) ?? 0) + g._count);
  for (const g of hmGrouped) map.set(g.status, (map.get(g.status) ?? 0) + g._count);

  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

/** Revenue totals per service (includes handyman) */
async function fetchRevenueByService() {
  const [bookingsWithPayments, hmWithPayments] = await Promise.all([
    prisma.booking.findMany({
      where: { payments: { some: { status: "SUCCEEDED" } } },
      select: {
        service: { select: { name: true } },
        payments: {
          where: { status: "SUCCEEDED" },
          select: { amount: true },
        },
      },
    }),
    prisma.handymanInquiry.findMany({
      where: { payments: { some: { status: "SUCCEEDED" } } },
      select: {
        payments: {
          where: { status: "SUCCEEDED" },
          select: { amount: true },
        },
      },
    }),
  ]);

  const map = new Map<string, number>();
  for (const b of bookingsWithPayments) {
    const name = b.service.name;
    const total = b.payments.reduce((s, p) => s + p.amount, 0);
    map.set(name, (map.get(name) ?? 0) + total);
  }
  for (const hm of hmWithPayments) {
    const total = hm.payments.reduce((s, p) => s + p.amount, 0);
    map.set("Handyman Service", (map.get("Handyman Service") ?? 0) + total);
  }

  return Array.from(map.entries())
    .map(([service, revenue]) => ({ service, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);
}

const timeLabels: Record<string, string> = {
  morning: "8:00 AM",
  afternoon: "12:00 PM",
  evening: "5:00 PM",
};

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
  let todaysJobs: { id: string; customerName: string; serviceName: string; date: string; time: string; cleaner: string; status: string }[] = [];
  let activeEmployees: { name: string; clockIn: string }[] = [];

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
      _todaysJobs,
      _activeClocks,
      _hmTotal,
      _hmPending,
      _hmConfirmedToday,
      _hmTodaysJobs,
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
      prisma.booking.findMany({
        where: {
          scheduledDate: { gte: todayStart },
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "PENDING"] },
        },
        include: {
          customer: { select: { name: true } },
          service: { select: { name: true } },
          assignments: { include: { employee: { select: { name: true } } } },
        },
        orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
        take: 10,
      }),
      prisma.timeEntry.findMany({
        where: { clockOut: null },
        include: { employee: { select: { name: true } } },
        orderBy: { clockIn: "asc" },
      }),
      // Handyman counts
      prisma.handymanInquiry.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.handymanInquiry.count({ where: { status: "PENDING" } }),
      prisma.handymanInquiry.count({
        where: {
          status: { in: ["CONFIRMED", "IN_PROGRESS"] },
          preferredDate: { gte: todayStart, lt: tomorrowStart },
        },
      }),
      prisma.handymanInquiry.findMany({
        where: {
          preferredDate: { gte: todayStart },
          status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "PENDING"] },
        },
        include: {
          user: { select: { name: true } },
        },
        orderBy: [{ preferredDate: "asc" }, { preferredTime: "asc" }],
        take: 10,
      }),
    ]);

    totalBookings = _totalBookings + _hmTotal;
    pendingBookings = _pendingBookings + _hmPending;
    confirmedToday = _confirmedToday + _hmConfirmedToday;
    employeeCount = _employeeCount;
    customerCount = _customerCount;
    revenue = monthRevenue._sum.amount ?? 0;
    recentBookings = _recentBookings;
    newApplicants = _newApplicants;
    newInquiries = _newInquiries;
    monthlyRevenue = _monthlyRevenue;
    bookingsByStatus = _bookingsByStatus;
    revenueByService = _revenueByService;

    // Transform regular bookings
    const regularJobs = _todaysJobs.map((b) => {
      const primary = b.assignments.find((a) => a.isPrimary);
      const cleaner = primary?.employee.name ?? b.assignments[0]?.employee.name ?? "\u2014";
      return {
        id: b.id,
        customerName: b.customer.name ?? "Unknown",
        serviceName: b.service.name,
        date: formatDateShort(b.scheduledDate),
        time: timeLabels[b.scheduledTime] ?? b.scheduledTime,
        cleaner,
        status: b.status,
      };
    });

    // Transform handyman jobs for upcoming table
    const hmJobs = _hmTodaysJobs.map((hm) => ({
      id: hm.id,
      customerName: hm.user?.name || hm.fullName || "Unknown",
      serviceName: "Handyman Service",
      date: hm.preferredDate ? formatDateShort(hm.preferredDate) : "\u2014",
      time: timeLabels[hm.preferredTime || ""] ?? (hm.preferredTime || "\u2014"),
      cleaner: "\u2014",
      status: hm.status,
    }));

    todaysJobs = [...regularJobs, ...hmJobs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);

    activeEmployees = _activeClocks.map((e) => ({
      name: e.employee.name ?? "Unknown",
      clockIn: e.clockIn.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const stats = [
    { label: "Monthly Revenue", value: formatCurrency(revenue), color: "text-green", href: "/admin/revenue" },
    { label: "Total Bookings", value: totalBookings.toString(), color: "text-amber", href: "/admin/bookings" },
    { label: "Today's Jobs", value: confirmedToday.toString(), color: "text-teal", href: "/admin/schedule" },
    { label: "Pending", value: pendingBookings.toString(), color: "text-gold", href: "/admin/bookings" },
    { label: "Employees", value: employeeCount.toString(), color: "text-green", href: "/admin/staff" },
    { label: "Customers", value: customerCount.toString(), color: "text-caribbean", href: "/admin/clients" },
    { label: "New Applicants", value: newApplicants.toString(), color: "text-amber", href: "/admin/applicants" },
    { label: "New Inquiries", value: newInquiries.toString(), color: "text-teal", href: "/admin/commercial" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} prefetch={false} className="bg-white rounded-xl p-5 border border-[#ece6d9] shadow-sm hover:border-green/30 hover:shadow-md transition-all">
            <div className="text-[11px] text-gray-400 uppercase tracking-wider">{stat.label}</div>
            <div className={`font-display text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* Today's Jobs + Live Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl p-5 border border-[#ece6d9]">
          <h3 className="font-display text-base mb-4">Upcoming Jobs</h3>
          {todaysJobs.length === 0 ? (
            <p className="text-gray-400 text-sm">No upcoming jobs.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-[0.82rem]">
                  <thead>
                    <tr className="text-left text-[0.7rem] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="pb-2 font-medium">Client</th>
                      <th className="pb-2 font-medium">Service</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium text-center">Cleaner</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysJobs.map((job) => (
                      <tr key={job.id} className={`border-b border-gray-50 last:border-0 ${
                        job.status === "COMPLETED" ? "bg-green-50" :
                        job.status === "IN_PROGRESS" ? "bg-teal-50" :
                        job.status === "CONFIRMED" ? "bg-blue-50" :
                        job.status === "CANCELLED" ? "bg-red-50" :
                        "bg-yellow-50"
                      }`}>
                        <td className="py-2.5 font-medium text-tobacco">{job.customerName}</td>
                        <td className="py-2.5">{job.serviceName}</td>
                        <td className="py-2.5 text-gray-500">{job.date}</td>
                        <td className="py-2.5">{job.time}</td>
                        <td className="py-2.5 text-center">{job.cleaner}</td>
                        <td className="py-2.5">
                          <span className={`text-[0.78rem] font-medium ${
                            job.status === "COMPLETED" ? "text-green-700" :
                            job.status === "IN_PROGRESS" ? "text-teal" :
                            job.status === "CONFIRMED" ? "text-blue-700" :
                            job.status === "CANCELLED" ? "text-red-700" :
                            "text-yellow-800"
                          }`}>{formatStatus(job.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {todaysJobs.map((job) => (
                  <div key={job.id} className={`border border-gray-100 rounded-lg p-3 ${
                    job.status === "COMPLETED" ? "bg-green-50" :
                    job.status === "IN_PROGRESS" ? "bg-teal-50" :
                    job.status === "CONFIRMED" ? "bg-blue-50" :
                    job.status === "CANCELLED" ? "bg-red-50" :
                    "bg-yellow-50"
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-tobacco text-[0.85rem]">{job.customerName}</span>
                      <span className={`text-[0.75rem] font-medium ${
                        job.status === "COMPLETED" ? "text-green-700" :
                        job.status === "IN_PROGRESS" ? "text-teal" :
                        job.status === "CONFIRMED" ? "text-blue-700" :
                        job.status === "CANCELLED" ? "text-red-700" :
                        "text-yellow-800"
                      }`}>{formatStatus(job.status)}</span>
                    </div>
                    <div className="text-gray-500 text-[0.78rem]">{job.serviceName} &middot; {job.date} &middot; {job.time}</div>
                    <div className="text-gray-400 text-[0.75rem] mt-0.5">Cleaner: {job.cleaner}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <LiveClock activeEmployees={activeEmployees} />
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
            <div className="space-y-1">
              {recentBookings.map((b) => (
                <div key={b.id} className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${
                  b.status === "COMPLETED" ? "bg-green-50" :
                  b.status === "IN_PROGRESS" ? "bg-teal-50" :
                  b.status === "CONFIRMED" ? "bg-blue-50" :
                  b.status === "CANCELLED" ? "bg-red-50" :
                  "bg-yellow-50"
                }`}>
                  <div>
                    <div className="text-[0.85rem] font-medium flex items-center gap-1.5"><ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}</div>
                    <div className="text-gray-400 text-[0.78rem]">{b.customer.name} &middot; {formatDate(b.scheduledDate)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[0.82rem] font-medium">{formatCurrency(b.total)}</div>
                    <span className={`text-[0.78rem] font-medium ${
                      b.status === "COMPLETED" ? "text-green-700" :
                      b.status === "IN_PROGRESS" ? "text-teal" :
                      b.status === "CONFIRMED" ? "text-blue-700" :
                      b.status === "CANCELLED" ? "text-red-700" :
                      "text-yellow-800"
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
