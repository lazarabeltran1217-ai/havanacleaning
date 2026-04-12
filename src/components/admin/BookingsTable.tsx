"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { formatCurrency, formatDate, formatStatus } from "@/lib/utils";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

type Booking = {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  total: number;
  service: { name: string; icon: string | null };
  customer: { name: string; email: string; phone: string | null };
  assignments: { employee: { name: string } }[];
  isPaid: boolean;
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-500",
};

export function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(bookings, {
      searchKeys: ["bookingNumber", "customer.name", "customer.email", "service.name", "status"],
      defaultSortKey: "scheduledDate",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search bookings..."
        resultCount={filteredData.length}
        totalCount={bookings.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.8rem] tracking-wide font-medium">{b.bookingNumber}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || ""}`}>
                {formatStatus(b.status)}
              </span>
            </div>
            <div className="text-[0.88rem] font-medium mb-1 flex items-center gap-1.5">
              <ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Customer</span>
                <span className="text-right">
                  <div>{b.customer.name}</div>
                  <div className="text-gray-400 text-[0.75rem]">{b.customer.email}</div>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Date</span>
                <span className="text-right">
                  <div>{formatDate(b.scheduledDate)}</div>
                  <div className="text-gray-400 text-[0.75rem] capitalize">{b.scheduledTime}</div>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Assigned</span>
                <span>
                  {b.assignments.length > 0
                    ? b.assignments.map((a) => a.employee.name).join(", ")
                    : <span className="text-gray-300">Unassigned</span>}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green">{formatCurrency(b.total)}</span>
                  {b.isPaid ? (
                    <span className="text-green flex items-center gap-0.5 text-[0.68rem] font-medium">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="text-gray-300 text-[0.68rem]">Unpaid</span>
                  )}
                </div>
                <Link href={`/admin/bookings/${b.id}`} className="text-green text-[0.78rem] font-medium hover:underline">View</Link>
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No bookings match your search." : "No bookings yet."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Booking #" sortKey="bookingNumber" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Service" sortKey="service.name" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Customer" sortKey="customer.name" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Date" sortKey="scheduledDate" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Status" sortKey="status" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Assigned" />
              <SortHeader label="Total" sortKey="total" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} align="right" />
              <PlainHeader label="Paid" />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((b) => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 text-[0.8rem] tracking-wide">{b.bookingNumber}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5">
                    <ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>{b.customer.name}</div>
                  <div className="text-gray-400 text-[0.75rem]">{b.customer.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{formatDate(b.scheduledDate)}</div>
                  <div className="text-gray-400 text-[0.75rem] capitalize">{b.scheduledTime}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[0.7rem] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${statusColors[b.status] || ""}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[0.82rem]">
                  {b.assignments.length > 0
                    ? b.assignments.map((a) => a.employee.name).join(", ")
                    : <span className="text-gray-300">Unassigned</span>}
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(b.total)}</td>
                <td className="px-4 py-3">
                  {b.isPaid ? (
                    <span className="text-green flex items-center gap-0.5 text-[0.78rem] font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Paid
                    </span>
                  ) : (
                    <span className="text-gray-300 text-[0.78rem]">Unpaid</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${b.id}`} className="text-green text-[0.78rem] hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  {search ? "No bookings match your search." : "No bookings yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
