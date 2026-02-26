import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PayrollActions, PayrollStatusButtonClient } from "@/components/admin/PayrollActions";

const fetchPayrolls = () =>
  prisma.payroll.findMany({
    include: { employee: { select: { name: true } } },
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

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber/10 text-amber",
    APPROVED: "bg-teal/10 text-teal",
    PAID: "bg-green/10 text-green",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl">Payroll</h2>
        <PayrollActions />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {payrolls.map((p) => {
          const adjustments = p.bonuses + p.tips + p.mileageReimbursement - p.deductions;
          return (
            <div key={p.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{p.employee.name}</span>
                <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                  {p.status}
                </span>
              </div>
              <div className="space-y-2 text-[0.82rem]">
                <div className="flex justify-between">
                  <span className="text-sand">Period</span>
                  <span className="text-gray-500">{formatDate(p.periodStart)} — {formatDate(p.periodEnd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Hours</span>
                  <span>{p.totalHours.toFixed(1)}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Rate</span>
                  <span>{formatCurrency(p.hourlyRate)}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sand">Gross</span>
                  <span>{formatCurrency(p.grossPay)}</span>
                </div>
                {adjustments !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-sand">Adjustments</span>
                    <span className={adjustments > 0 ? "text-green" : "text-red"}>
                      {adjustments > 0 ? "+" : ""}{formatCurrency(adjustments)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-sand font-medium">Net Pay</span>
                  <span className="font-medium text-green">{formatCurrency(p.netPay)}</span>
                </div>
                {p.status !== "PAID" && (
                  <div className="pt-2 flex justify-end">
                    <PayrollStatusButtonClient id={p.id} status={p.status} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {payrolls.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            No payroll records yet. Click &quot;Generate Payroll&quot; to create from time entries.
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Employee</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Period</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Hours</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Rate</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Gross</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Adjustments</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium text-right">Net Pay</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => {
              const adjustments = p.bonuses + p.tips + p.mileageReimbursement - p.deductions;
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-ivory/30">
                  <td className="px-4 py-3 font-medium">{p.employee.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(p.periodStart)} — {formatDate(p.periodEnd)}
                  </td>
                  <td className="px-4 py-3">{p.totalHours.toFixed(1)}h</td>
                  <td className="px-4 py-3">{formatCurrency(p.hourlyRate)}/hr</td>
                  <td className="px-4 py-3">{formatCurrency(p.grossPay)}</td>
                  <td className="px-4 py-3">
                    {adjustments !== 0 ? (
                      <span className={adjustments > 0 ? "text-green" : "text-red"}>
                        {adjustments > 0 ? "+" : ""}{formatCurrency(adjustments)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green">{formatCurrency(p.netPay)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.status !== "PAID" && (
                      <PayrollStatusButtonClient id={p.id} status={p.status} />
                    )}
                  </td>
                </tr>
              );
            })}
            {payrolls.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  No payroll records yet. Click &quot;Generate Payroll&quot; to create from time entries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
