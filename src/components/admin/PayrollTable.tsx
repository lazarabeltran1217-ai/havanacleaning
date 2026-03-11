"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { PayrollStatusButtonClient } from "./PayrollActions";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

type PayrollRecord = {
  id: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  hourlyRate: number;
  grossPay: number;
  bonuses: number;
  tips: number;
  mileageReimbursement: number;
  deductions: number;
  netPay: number;
  paidVia: string | null;
  employeeName: string;
  stripeConnectOnboarded: boolean;
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-amber/10 text-amber",
  APPROVED: "bg-teal/10 text-teal",
  PAID: "bg-green/10 text-green",
};

export function PayrollTable({ payrolls }: { payrolls: PayrollRecord[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(payrolls, {
      searchKeys: ["employeeName", "status"],
      defaultSortKey: "periodStart",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search payroll..."
        resultCount={filteredData.length}
        totalCount={payrolls.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((p) => {
          const adjustments = p.bonuses + p.tips + p.mileageReimbursement - p.deductions;
          return (
            <div key={p.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">{p.employeeName}</span>
                <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                  {p.status}
                </span>
              </div>
              <div className="space-y-2 text-[0.82rem]">
                <div className="flex justify-between">
                  <span className="text-sand">Period</span>
                  <span className="text-gray-500">{formatDate(p.periodStart)} &mdash; {formatDate(p.periodEnd)}</span>
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
                <div className="pt-2 flex justify-end">
                  <PayrollStatusButtonClient
                    id={p.id}
                    status={p.status}
                    netPay={p.netPay}
                    stripeConnectOnboarded={p.stripeConnectOnboarded}
                    paidVia={p.paidVia}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No records match your search." : "No payroll records yet. Click \"Generate Payroll\" to create from time entries."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Employee" sortKey="employeeName" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Period" sortKey="periodStart" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Hours" sortKey="totalHours" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Rate" sortKey="hourlyRate" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Gross" sortKey="grossPay" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Adjustments" />
              <SortHeader label="Net Pay" sortKey="netPay" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} align="right" />
              <SortHeader label="Status" sortKey="status" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((p) => {
              const adjustments = p.bonuses + p.tips + p.mileageReimbursement - p.deductions;
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-ivory/30">
                  <td className="px-4 py-3 font-medium">{p.employeeName}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(p.periodStart)} &mdash; {formatDate(p.periodEnd)}
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
                      <span className="text-gray-300">{"\u2014"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green">{formatCurrency(p.netPay)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <PayrollStatusButtonClient
                      id={p.id}
                      status={p.status}
                      netPay={p.netPay}
                      stripeConnectOnboarded={p.stripeConnectOnboarded}
                      paidVia={p.paidVia}
                    />
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  {search ? "No records match your search." : "No payroll records yet. Click \"Generate Payroll\" to create from time entries."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
