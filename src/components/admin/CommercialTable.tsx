"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

type Inquiry = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  industry: string | null;
  squareFootage: string | null;
  budgetRange: string | null;
  status: string;
  spamScore: number;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  NEW: "bg-amber/10 text-amber",
  CONTACTED: "bg-teal/10 text-teal",
  QUOTE_SENT: "bg-blue-50 text-blue-600",
  NEGOTIATING: "bg-purple-50 text-purple-600",
  WON: "bg-green/20 text-green",
  LOST: "bg-red/10 text-red",
};

export function CommercialTable({ inquiries }: { inquiries: Inquiry[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(inquiries, {
      searchKeys: ["companyName", "contactName", "contactEmail", "industry", "status"],
      defaultSortKey: "createdAt",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search inquiries..."
        resultCount={filteredData.length}
        totalCount={inquiries.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((inq) => (
          <div key={inq.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{inq.companyName}</span>
              <div className="flex items-center gap-1">
                <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[inq.status] || ""}`}>
                  {inq.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Contact</span>
                <span className="text-right">
                  <div>{inq.contactName}</div>
                  <div className="text-gray-400 text-[0.75rem]">{inq.contactEmail}</div>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Industry</span>
                <span className="text-gray-500">{inq.industry || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Sq Ft</span>
                <span className="text-gray-500">{inq.squareFootage || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Budget</span>
                <span className="text-gray-500">{inq.budgetRange || "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Received</span>
                <span className="text-gray-500">{formatDate(inq.createdAt)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <Link href={`/admin/commercial/${inq.id}`} className="text-green text-[0.78rem] font-medium hover:underline">View</Link>
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No inquiries match your search." : "No commercial inquiries yet."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Company" sortKey="companyName" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Contact" sortKey="contactName" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Industry" sortKey="industry" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Sq Ft" sortKey="squareFootage" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Budget" sortKey="budgetRange" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Received" sortKey="createdAt" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Status" sortKey="status" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((inq) => (
              <tr key={inq.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{inq.companyName}</td>
                <td className="px-4 py-3">
                  <div>{inq.contactName}</div>
                  <div className="text-gray-400 text-[0.78rem]">{inq.contactEmail}</div>
                </td>
                <td className="px-4 py-3 text-gray-500">{inq.industry || "\u2014"}</td>
                <td className="px-4 py-3 text-gray-500">{inq.squareFootage || "\u2014"}</td>
                <td className="px-4 py-3 text-gray-500">{inq.budgetRange || "\u2014"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(inq.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[inq.status] || ""}`}>
                    {inq.status.replace(/_/g, " ")}
                  </span>
                  {inq.spamScore > 2 && (
                    <span className="ml-1 text-[0.65rem] text-red">Spam?</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/commercial/${inq.id}`} className="text-green text-[0.78rem] hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                {search ? "No inquiries match your search." : "No commercial inquiries yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
