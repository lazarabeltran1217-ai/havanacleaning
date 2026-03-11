import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { AddCustomerButton } from "@/components/admin/AddCustomerButton";
import { ClientsTable } from "@/components/admin/ClientsTable";

export default async function AdminClientsPage() {
  const fetchCustomers = () =>
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        _count: { select: { bookings: true } },
        bookings: { select: { total: true }, where: { status: { not: "CANCELLED" } } },
      },
      orderBy: { createdAt: "desc" },
    });
  let customers: Awaited<ReturnType<typeof fetchCustomers>> = [];
  try {
    customers = await fetchCustomers();
  } catch (error) {
    console.error("Failed to fetch customers:", error);
  }

  const totalCustomers = customers.length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = customers.filter((c) => new Date(c.createdAt) >= monthStart).length;
  const totalBookings = customers.reduce((sum, c) => sum + c._count.bookings, 0);
  const lifetimeRevenue = customers.reduce(
    (sum, c) => sum + c.bookings.reduce((s, b) => s + b.total, 0),
    0
  );

  const serialized = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
    bookingCount: c._count.bookings,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Customers</h2>
        <AddCustomerButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Customers</div>
          <div className="text-2xl font-display text-tobacco">{totalCustomers}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">New This Month</div>
          <div className="text-2xl font-display text-green">{newThisMonth}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Bookings</div>
          <div className="text-2xl font-display text-tobacco">{totalBookings}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Lifetime Revenue</div>
          <div className="text-2xl font-display text-green">{formatCurrency(lifetimeRevenue)}</div>
        </div>
      </div>

      <ClientsTable customers={serialized} />
    </div>
  );
}
