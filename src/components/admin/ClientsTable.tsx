"use client";

import { formatDate } from "@/lib/utils";
import { useAdminTable, TableSearch, SortHeader } from "./AdminTable";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  bookingCount: number;
};

export function ClientsTable({ customers }: { customers: Customer[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(customers, {
      searchKeys: ["name", "email", "phone"],
      defaultSortKey: "createdAt",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search customers..."
        resultCount={filteredData.length}
        totalCount={customers.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="font-medium mb-3">{c.name}</div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Email</span>
                <span className="text-gray-500">{c.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Phone</span>
                <span className="text-gray-500">{c.phone || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Bookings</span>
                <span>{c.bookingCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Joined</span>
                <span className="text-gray-500">{formatDate(c.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No customers match your search." : "No customers yet."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Name" sortKey="name" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Email" sortKey="email" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Phone" sortKey="phone" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Bookings" sortKey="bookingCount" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Joined" sortKey="createdAt" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.email}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone || "\u2014"}</td>
                <td className="px-4 py-3">{c.bookingCount}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                {search ? "No customers match your search." : "No customers yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
