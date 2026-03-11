"use client";

import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { useAdminTable, TableSearch, SortHeader } from "./AdminTable";

type Payment = {
  id: string;
  amount: number;
  status: string;
  method: string;
  paidAt: string | null;
  createdAt: string;
  customerName: string;
  bookingInfo: string | null;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber/10 text-amber",
  PROCESSING: "bg-teal/10 text-teal",
  SUCCEEDED: "bg-green/10 text-green",
  FAILED: "bg-red/10 text-red",
  REFUNDED: "bg-gray-100 text-gray-500",
};

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(payments, {
      searchKeys: ["customerName", "bookingInfo", "status", "method"],
      defaultSortKey: "createdAt",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search payments..."
        resultCount={filteredData.length}
        totalCount={payments.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{p.customerName}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                {formatStatus(p.status)}
              </span>
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Booking</span>
                <span className="text-gray-500">{p.bookingInfo || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Method</span>
                <span className="capitalize">{p.method.toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Date</span>
                <span className="text-gray-500">{formatDate(p.paidAt || p.createdAt)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="text-sand">Amount</span>
                <span className="font-medium text-green">{formatCurrency(p.amount)}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No payments match your search." : "No payments yet."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Customer" sortKey="customerName" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Booking" sortKey="bookingInfo" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Method" sortKey="method" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Status" sortKey="status" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Date" sortKey="createdAt" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Amount" sortKey="amount" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{p.customerName}</td>
                <td className="px-4 py-3 text-gray-500">{p.bookingInfo || "\u2014"}</td>
                <td className="px-4 py-3 capitalize">{p.method.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || ""}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(p.paidAt || p.createdAt)}</td>
                <td className="px-4 py-3 text-right font-medium text-green">{formatCurrency(p.amount)}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                {search ? "No payments match your search." : "No payments yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
