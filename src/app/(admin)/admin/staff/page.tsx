import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { StaffTable } from "@/components/admin/StaffTable";

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

  const totalStaff = employees.length;
  const activeCount = employees.filter((e) => e.isActive).length;
  const ratedEmployees = employees.filter((e) => e.hourlyRate);
  const avgRate = ratedEmployees.length > 0
    ? ratedEmployees.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / ratedEmployees.length
    : 0;
  const totalJobs = employees.reduce((sum, e) => sum + e._count.jobAssignments, 0);

  const serialized = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    hourlyRate: emp.hourlyRate,
    hireDate: emp.hireDate?.toISOString() ?? null,
    isActive: emp.isActive,
    stripeConnectAccountId: emp.stripeConnectAccountId,
    stripeConnectOnboarded: emp.stripeConnectOnboarded,
    jobCount: emp._count.jobAssignments,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Employees</h2>
        <Link href="/admin/staff/new" className="bg-green text-white px-5 py-2 text-[0.82rem] font-semibold rounded-lg hover:bg-green/90 transition-colors">
          + Add Employee
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Staff</div>
          <div className="text-2xl font-display text-tobacco">{totalStaff}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Active</div>
          <div className="text-2xl font-display text-green">{activeCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Avg Rate</div>
          <div className="text-2xl font-display text-tobacco">{formatCurrency(avgRate)}/hr</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Jobs</div>
          <div className="text-2xl font-display text-tobacco">{totalJobs}</div>
        </div>
      </div>

      <StaffTable employees={serialized} />
    </div>
  );
}
