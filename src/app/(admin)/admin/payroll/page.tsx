import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { PayrollActions } from "@/components/admin/PayrollActions";
import { PayrollTable } from "@/components/admin/PayrollTable";

const fetchPayrolls = () =>
  prisma.payroll.findMany({
    include: {
      employee: { select: { name: true, stripeConnectOnboarded: true } },
    },
    orderBy: { periodStart: "desc" },
    take: 50,
  });

export default async function AdminPayrollPage() {
  let payrolls: Awaited<ReturnType<typeof fetchPayrolls>> = [];
  try {
    payrolls = await fetchPayrolls();
  } catch (error) {
    console.error("Failed to fetch payroll:", error);
  }

  const totalPaid = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.netPay, 0);
  const draftCount = payrolls.filter((p) => p.status === "DRAFT").length;
  const approvedCount = payrolls.filter((p) => p.status === "APPROVED").length;
  const paidCount = payrolls.filter((p) => p.status === "PAID").length;

  const serialized = payrolls.map((p) => ({
    id: p.id,
    status: p.status,
    periodStart: p.periodStart.toISOString(),
    periodEnd: p.periodEnd.toISOString(),
    totalHours: p.totalHours,
    hourlyRate: p.hourlyRate,
    grossPay: p.grossPay,
    bonuses: p.bonuses,
    tips: p.tips,
    mileageReimbursement: p.mileageReimbursement,
    deductions: p.deductions,
    netPay: p.netPay,
    paidVia: p.paidVia,
    employeeName: p.employee.name ?? "",
    stripeConnectOnboarded: p.employee.stripeConnectOnboarded,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Payroll</h2>
        <PayrollActions />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Total Paid Out</div>
          <div className="text-2xl font-display text-green">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Draft</div>
          <div className="text-2xl font-display text-amber">{draftCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Approved</div>
          <div className="text-2xl font-display text-teal">{approvedCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-[#ece6d9] p-4">
          <div className="text-[0.72rem] uppercase tracking-wider text-sand mb-1">Paid</div>
          <div className="text-2xl font-display text-green">{paidCount}</div>
        </div>
      </div>

      <PayrollTable payrolls={serialized} />
    </div>
  );
}
