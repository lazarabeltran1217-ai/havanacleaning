import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { AddCustomerButton } from "@/components/admin/AddCustomerButton";

export default async function AdminClientsPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      _count: { select: { bookings: true } },
      bookings: { select: { total: true }, where: { status: { not: "CANCELLED" } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Customers</h2>
        <AddCustomerButton />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {customers.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="font-medium mb-3">{c.name}</div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Email</span>
                <span className="text-gray-500">{c.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Phone</span>
                <span className="text-gray-500">{c.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Bookings</span>
                <span>{c._count.bookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Joined</span>
                <span className="text-gray-500">{formatDate(c.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">No customers yet.</div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Name</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Email</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Phone</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Bookings</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone || "—"}</td>
                <td className="px-4 py-3">{c._count.bookings}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
