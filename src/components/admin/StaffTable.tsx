"use client";

import { formatDate, formatCurrency } from "@/lib/utils";
import { StaffEditButton } from "./StaffEditButton";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

type Employee = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  hourlyRate: number | null;
  hireDate: string | null;
  isActive: boolean;
  stripeConnectAccountId: string | null;
  stripeConnectOnboarded: boolean;
  jobCount: number;
};

export function StaffTable({ employees }: { employees: Employee[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(employees, {
      searchKeys: ["name", "email", "phone"],
      defaultSortKey: "name",
      defaultSortDir: "asc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search employees..."
        resultCount={filteredData.length}
        totalCount={employees.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((emp) => (
          <div key={emp.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{emp.name}</span>
              <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${emp.isActive ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
                {emp.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Email</span>
                <span className="text-gray-500">{emp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Phone</span>
                <span className="text-gray-500">{emp.phone || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Rate</span>
                <span>{emp.hourlyRate ? `${formatCurrency(emp.hourlyRate)}/hr` : "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Hire Date</span>
                <span className="text-gray-500">{emp.hireDate ? formatDate(emp.hireDate) : "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Jobs</span>
                <span>{emp.jobCount}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <StaffEditButton employee={{
                  id: emp.id,
                  name: emp.name,
                  email: emp.email,
                  phone: emp.phone,
                  hourlyRate: emp.hourlyRate,
                  isActive: emp.isActive,
                  stripeConnectAccountId: emp.stripeConnectAccountId,
                  stripeConnectOnboarded: emp.stripeConnectOnboarded,
                }} />
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No employees match your search." : "No employees yet."}
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
              <SortHeader label="Rate" sortKey="hourlyRate" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Hire Date" sortKey="hireDate" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Jobs" sortKey="jobCount" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Payout" />
              <SortHeader label="Status" sortKey="isActive" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((emp) => (
              <tr key={emp.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{emp.name}</td>
                <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                <td className="px-4 py-3 text-gray-500">{emp.phone || "\u2014"}</td>
                <td className="px-4 py-3">{emp.hourlyRate ? `${formatCurrency(emp.hourlyRate)}/hr` : "\u2014"}</td>
                <td className="px-4 py-3 text-gray-500">{emp.hireDate ? formatDate(emp.hireDate) : "\u2014"}</td>
                <td className="px-4 py-3">{emp.jobCount}</td>
                <td className="px-4 py-3">
                  {emp.stripeConnectOnboarded ? (
                    <span className="text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-green/10 text-green">Ready</span>
                  ) : emp.stripeConnectAccountId ? (
                    <span className="text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-amber/10 text-amber">Pending</span>
                  ) : (
                    <span className="text-gray-300">{"\u2014"}</span>
                  )}
                </td>
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
                    stripeConnectAccountId: emp.stripeConnectAccountId,
                    stripeConnectOnboarded: emp.stripeConnectOnboarded,
                  }} />
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  {search ? "No employees match your search." : "No employees yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
