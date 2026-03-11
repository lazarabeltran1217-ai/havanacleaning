"use client";

import { formatDate, formatTime } from "@/lib/utils";
import { ClockEditButton } from "./ClockEditButton";
import { useAdminTable, TableSearch, SortHeader, PlainHeader } from "./AdminTable";

type TimeEntry = {
  id: string;
  clockIn: string;
  clockOut: string | null;
  hoursWorked: number | null;
  notes: string | null;
  bookingId: string | null;
  employeeName: string;
  jobInfo: string | null;
};

export function ClockTable({ entries }: { entries: TimeEntry[] }) {
  const { search, setSearch, filteredData, sortKey, sortDir, requestSort } =
    useAdminTable(entries, {
      searchKeys: ["employeeName", "jobInfo"],
      defaultSortKey: "clockIn",
      defaultSortDir: "desc",
    });

  return (
    <>
      <TableSearch
        value={search}
        onChange={setSearch}
        placeholder="Search time entries..."
        resultCount={filteredData.length}
        totalCount={entries.length}
      />

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {filteredData.map((e) => (
          <div key={e.id} className="bg-white rounded-xl border border-[#ece6d9] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{e.employeeName}</span>
              {!e.clockOut && <span className="text-[0.68rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-green/10 text-green">Active</span>}
            </div>
            <div className="space-y-2 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-sand">Date</span>
                <span className="text-gray-500">{formatDate(e.clockIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Clock In</span>
                <span>{formatTime(e.clockIn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Clock Out</span>
                <span>{e.clockOut ? formatTime(e.clockOut) : <span className="text-green font-medium">Active</span>}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Hours</span>
                <span className="font-medium">{e.hoursWorked ? `${e.hoursWorked.toFixed(1)}h` : "\u2014"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand">Job</span>
                <span className="text-gray-500">{e.jobInfo || "\u2014"}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <ClockEditButton entry={{
                  id: e.id,
                  employeeName: e.employeeName,
                  clockIn: e.clockIn,
                  clockOut: e.clockOut,
                  hoursWorked: e.hoursWorked,
                  notes: e.notes,
                  bookingId: e.bookingId,
                }} />
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div className="bg-white rounded-xl border border-[#ece6d9] px-4 py-12 text-center text-gray-400">
            {search ? "No entries match your search." : "No time entries yet."}
          </div>
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
        <table className="w-full text-left text-[0.85rem]">
          <thead>
            <tr className="bg-ivory/50 border-b border-[#ece6d9]">
              <SortHeader label="Employee" sortKey="employeeName" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Date" sortKey="clockIn" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader label="Clock In" />
              <PlainHeader label="Clock Out" />
              <SortHeader label="Hours" sortKey="hoursWorked" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <SortHeader label="Job" sortKey="jobInfo" currentSortKey={sortKey} currentSortDir={sortDir} onSort={requestSort} />
              <PlainHeader />
            </tr>
          </thead>
          <tbody>
            {filteredData.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 hover:bg-ivory/30">
                <td className="px-4 py-3 font-medium">{e.employeeName}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(e.clockIn)}</td>
                <td className="px-4 py-3">{formatTime(e.clockIn)}</td>
                <td className="px-4 py-3">{e.clockOut ? formatTime(e.clockOut) : <span className="text-green font-medium">Active</span>}</td>
                <td className="px-4 py-3 font-medium">{e.hoursWorked ? `${e.hoursWorked.toFixed(1)}h` : "\u2014"}</td>
                <td className="px-4 py-3 text-gray-500">{e.jobInfo || "\u2014"}</td>
                <td className="px-4 py-3">
                  <ClockEditButton entry={{
                    id: e.id,
                    employeeName: e.employeeName,
                    clockIn: e.clockIn,
                    clockOut: e.clockOut,
                    hoursWorked: e.hoursWorked,
                    notes: e.notes,
                    bookingId: e.bookingId,
                  }} />
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                {search ? "No entries match your search." : "No time entries yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
