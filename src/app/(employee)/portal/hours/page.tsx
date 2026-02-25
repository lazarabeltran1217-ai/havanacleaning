"use client";

import { useState, useEffect, useMemo } from "react";

interface TimeEntryData {
  id: string;
  clockIn: string;
  clockOut: string | null;
  hoursWorked: number | null;
  booking: { bookingNumber: string; service: { name: string } } | null;
}

interface SummaryData {
  totalHours: number;
  totalEntries: number;
  hourlyRate: number;
  estimatedEarnings: number;
}

export default function HoursPage() {
  const [entries, setEntries] = useState<TimeEntryData[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month">("week");

  useEffect(() => {
    fetch(`/api/portal/hours?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries || []);
        setSummary(d.summary || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const grouped = useMemo(() => {
    const groups: Record<string, TimeEntryData[]> = {};
    for (const entry of entries) {
      const date = new Date(entry.clockIn).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    }
    return groups;
  }, [entries]);

  if (loading) return <p className="text-gray-400 text-sm text-center py-8">Loading hours...</p>;

  return (
    <div>
      <h2 className="font-display text-xl text-tobacco mb-1">My Hours</h2>
      <p className="text-gray-400 text-sm mb-5">Track your time and earnings</p>

      {/* Period Toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setPeriod("week")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === "week" ? "bg-green text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === "month" ? "bg-green text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          This Month
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-tobacco">{summary.totalHours.toFixed(1)}</div>
            <div className="text-gray-400 text-[0.75rem] mt-0.5">Hours Worked</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-green">${summary.estimatedEarnings.toFixed(2)}</div>
            <div className="text-gray-400 text-[0.75rem] mt-0.5">Est. Earnings</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-tobacco">{summary.totalEntries}</div>
            <div className="text-gray-400 text-[0.75rem] mt-0.5">Shifts</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-tobacco">${summary.hourlyRate.toFixed(2)}</div>
            <div className="text-gray-400 text-[0.75rem] mt-0.5">Hourly Rate</div>
          </div>
        </div>
      )}

      {/* Time Entries by Day */}
      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <div className="text-3xl mb-3">⏰</div>
          <p className="text-gray-400 text-sm">No time entries for this period.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayEntries]) => {
            const dayTotal = dayEntries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[0.82rem] font-semibold text-tobacco">{date}</span>
                  <span className="text-[0.78rem] text-green font-medium">{dayTotal.toFixed(1)} hrs</span>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                  {dayEntries.map((entry) => (
                    <div key={entry.id} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[0.85rem]">
                            {new Date(entry.clockIn).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            {" — "}
                            {entry.clockOut
                              ? new Date(entry.clockOut).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                              : "Active"}
                          </div>
                          {entry.booking && (
                            <div className="text-gray-400 text-[0.75rem] mt-0.5">
                              {entry.booking.service.name} ({entry.booking.bookingNumber})
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {entry.hoursWorked ? (
                            <span className="text-[0.85rem] font-medium">{entry.hoursWorked.toFixed(1)} hrs</span>
                          ) : (
                            <span className="text-[0.7rem] bg-green/10 text-green px-2 py-0.5 rounded-full font-medium">Active</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
