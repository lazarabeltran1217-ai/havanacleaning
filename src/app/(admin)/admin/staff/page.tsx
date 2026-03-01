import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StaffEditButton } from "@/components/admin/StaffEditButton";

export default async function AdminStaffPage() {
  const fetchEmployees = () =>
    prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      include: { _count: { select: { jobAssignments: true, timeEntries: true } } },
      orderBy: { name: "asc" },
    });
  let employees: Awaited<ReturnType<typeof fetchEmployees>> = [];
  try {
    employees = await fetchEmployees();
  } catch (error) {
    console.error("Failed to fetch employees:", error);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Employees</h2>
        <Link href="/admin/staff/new" className="bg-green text-white px-5 py-2 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 transition-colors">
          + Add Employee
        </Link>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{emp.name}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${emp.isActive ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
                {emp.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Email</span>
                <span className="text-gray-500">{emp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Phone</span>
                <span className="text-gray-500">{emp.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Rate</span>
                <span>{emp.hourlyRate ? `${formatCurrency(emp.hourlyRate)}/hr` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Hire Date</span>
                <span className="text-gray-500">{emp.hireDate ? formatDate(emp.hireDate) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Jobs</span>
                <span>{emp._count.jobAssignments}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <StaffEditButton employee={{
                  id: emp.id,
                  name: emp.name,
                  email: emp.email,
                  phone: emp.phone,
                  hourlyRate: emp.hourlyRate,
                  isActive: emp.isActive,
                  stripeConnectAccountId: emp.stripeConnectAccountId,
                  stripeConnectOnboarded: emp.stripeConnectOnboarded,
                }} />
              </div>
            </div>
          </div>
        ))}
        {employees.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">No employees yet.</div>
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
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Rate</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Hire Date</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Jobs</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Payout</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{emp.name}</td>
                <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                <td className="px-4 py-3 text-gray-500">{emp.phone || "—"}</td>
                <td className="px-4 py-3">{emp.hourlyRate ? `${formatCurrency(emp.hourlyRate)}/hr` : "—"}</td>
                <td className="px-4 py-3 text-gray-500">{emp.hireDate ? formatDate(emp.hireDate) : "—"}</td>
                <td className="px-4 py-3">{emp._count.jobAssignments}</td>
                <td className="px-4 py-3">
                  {emp.stripeConnectOnboarded ? (
                    <span className="text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-green/10 text-green">Ready</span>
                  ) : emp.stripeConnectAccountId ? (
                    <span className="text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-amber/10 text-amber">Pending</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${emp.isActive ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
                    {emp.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StaffEditButton employee={{
                    id: emp.id,
                    name: emp.name,
                    email: emp.email,
                    phone: emp.phone,
                    hourlyRate: emp.hourlyRate,
                    isActive: emp.isActive,
                    stripeConnectAccountId: emp.stripeConnectAccountId,
                    stripeConnectOnboarded: emp.stripeConnectOnboarded,
                  }} />
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">No employees yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
