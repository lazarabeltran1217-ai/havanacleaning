import { prisma } from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StaffEditButton } from "@/components/admin/StaffEditButton";

export default async function AdminStaffPage() {
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: {
      _count: { select: { jobAssignments: true, timeEntries: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Employees</h2>
        <Link href="/admin/staff/new" className="bg-green text-white px-5 py-2 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 transition-colors">
          + Add Employee
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Name</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Email</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Phone</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Rate</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Hire Date</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Jobs</th>
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
                  }} />
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No employees yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
