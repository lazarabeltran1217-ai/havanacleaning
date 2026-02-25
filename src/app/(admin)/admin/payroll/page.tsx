import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminPayrollPage() {
  const payrolls = await prisma.payroll.findMany({
    include: {
      employee: { select: { name: true } },
    },
    orderBy: { periodStart: "desc" },
    take: 50,
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber/10 text-amber",
    APPROVED: "bg-teal/10 text-teal",
    PAID: "bg-green/10 text-green",
  };

  return (
    <div>
      <h2 className="font-display text-xl mb-6">Payroll</h2>

      <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Employee</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Period</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Hours</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Rate</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Gross</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium text-right">Net Pay</th>
              <th className="px-4 py-3 text-[0.72rem] uppercase tracking-wider text-sand font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{p.employee.name}</td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(p.periodStart)} — {formatDate(p.periodEnd)}
                </td>
                <td className="px-4 py-3">{p.totalHours.toFixed(1)}h</td>
                <td className="px-4 py-3">{formatCurrency(p.hourlyRate)}/hr</td>
                <td className="px-4 py-3">{formatCurrency(p.grossPay)}</td>
                <td className="px-4 py-3 text-right font-medium text-green">{formatCurrency(p.netPay)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payrolls.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No payroll records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
