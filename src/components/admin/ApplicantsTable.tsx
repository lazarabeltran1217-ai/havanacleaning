"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

type Application = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  yearsExperience: string | number | null;
  employmentType: string | null;
  status: string;
  createdAt: string;
};

const rowColors: Record<string, string> = {
  NEW: "bg-amber-100",
  UNDER_REVIEW: "bg-teal-50",
  PHONE_SCREEN: "bg-blue-50",
  INTERVIEW: "bg-emerald-50",
  BACKGROUND_CHECK: "bg-purple-50",
  HIRED: "bg-green-100",
  REJECTED: "bg-red-50",
};

export function ApplicantsTable({ applications }: { applications: Application[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(applications, {
      searchKeys: ["firstName", "lastName", "email", "phone", "status"],
      defaultSortKey: "createdAt",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search applicants..."
        resultCount={filteredData.length}
        totalCount={applications.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((app) => (
          <div key={app.id} className={`rounded-xl border border-[#ece6d9] p-4 ${rowColors[app.status] || "bg-white"}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{app.firstName} {app.lastName}</span>
              <span className="text-[0.68rem] uppercase tracking-wider font-medium text-tobacco/70">
                {app.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Email</span>
                <span className="text-gray-500">{app.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Phone</span>
                <span className="text-gray-400">{app.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Experience</span>
                <span>{app.yearsExperience || "N/A"} yrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Type</span>
                <span className="text-gray-500">{app.employmentType || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Applied</span>
                <span className="text-gray-500">{formatDate(app.createdAt)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <Link href={`/admin/applicants/${app.id}`} className="text-green text-[0.78rem] font-medium hover:underline">Review</Link>
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No applicants match your search." : "No applications yet."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Name" sortKey="lastName" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Contact" sortKey="email" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Experience" sortKey="yearsExperience" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Type" sortKey="employmentType" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Applied" sortKey="createdAt" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Status" sortKey="status" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((app) => (
              <tr key={app.id} className={`border-b border-gray-50 ${rowColors[app.status] || ""} hover:brightness-95`}>
                <td className="px-4 py-3 font-medium">{app.firstName} {app.lastName}</td>
                <td className="px-4 py-3">
                  <div className="text-gray-500">{app.email}</div>
                  <div className="text-gray-400 text-[0.78rem]">{app.phone}</div>
                </td>
                <td className="px-4 py-3">{app.yearsExperience || "N/A"} yrs</td>
                <td className="px-4 py-3 text-gray-500">{app.employmentType || "\u2014"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(app.createdAt)}</td>
                <td className="px-4 py-3 text-[0.82rem] capitalize">
                  {app.status.replace(/_/g, " ").toLowerCase()}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/applicants/${app.id}`} className="text-green text-[0.78rem] hover:underline">Review</Link>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                {search ? "No applicants match your search." : "No applications yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
