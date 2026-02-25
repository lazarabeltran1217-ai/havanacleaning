import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
  const [bookingCount, pendingCount, employeeCount, customerCount] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "EMPLOYEE", isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const stats = [
    { label: "Total Bookings", value: bookingCount.toString(), change: "" },
    { label: "Pending", value: pendingCount.toString(), change: "" },
    { label: "Employees", value: employeeCount.toString(), change: "" },
    { label: "Customers", value: customerCount.toString(), change: "" },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-[#ece6d9] shadow-sm">
            <div className="text-[12px] text-gray-400 uppercase tracking-wide">{stat.label}</div>
            <div className="font-display text-3xl font-bold text-tobacco mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-[#ece6d9]">
          <h3 className="font-display text-base mb-4">Recent Bookings</h3>
          <p className="text-gray-400 text-sm">No bookings yet. They will appear here once customers start booking.</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#ece6d9] text-center">
          <h3 className="font-display text-base mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/admin/bookings" className="block bg-gold text-white text-sm py-2.5 rounded-lg font-semibold hover:bg-amber transition-colors">
              New Booking
            </a>
            <a href="/admin/staff" className="block bg-green text-white text-sm py-2.5 rounded-lg font-semibold hover:bg-green-light hover:text-tobacco transition-colors">
              Add Employee
            </a>
            <a href="/admin/applicants" className="block border border-gold text-gold text-sm py-2.5 rounded-lg font-semibold hover:bg-gold hover:text-white transition-colors">
              View Applicants
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
