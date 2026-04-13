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

const rowColors: Record<string, string> = {
  PENDING: "bg-amber-50",
  PROCESSING: "bg-teal-50",
  SUCCEEDED: "bg-green-50",
  FAILED: "bg-red-50",
  REFUNDED: "bg-gray-50",
};

const statusTextColors: Record<string, string> = {
  PENDING: "text-amber",
  PROCESSING: "text-teal",
  SUCCEEDED: "text-green",
  FAILED: "text-red-500",
  REFUNDED: "text-gray-500",
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
          <div key={p.id} className={`rounded-xl border border-[#ece6d9] p-4 ${rowColors[p.status] || "bg-white"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{p.customerName}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider font-medium ${statusTextColors[p.status] || ""}`}>
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
              <tr key={p.id} className={`border-b border-gray-50 ${rowColors[p.status] || ""} hover:brightness-95`}>
                <td className="px-4 py-3 font-medium">{p.customerName}</td>
                <td className="px-4 py-3 text-gray-500">{p.bookingInfo || "\u2014"}</td>
                <td className="px-4 py-3 capitalize">{p.method.toLowerCase()}</td>
                <td className={`px-4 py-3 text-[0.82rem] font-medium ${statusTextColors[p.status] || ""}`}>
                  {formatStatus(p.status)}
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
