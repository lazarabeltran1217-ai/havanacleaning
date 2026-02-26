"use client";

import { useState, useEffect, useCallback } from "react";
import { QuickBookForm } from "./QuickBookForm";

interface Employee {
  id: string;
  name: string;
}

interface Assignment {
  employee: { id: string; name: string };
}

interface BookingItem {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedHours: number | null;
  status: string;
  service: { name: string; icon: string | null };
  customer: { name: string; phone: string | null };
  address: { street: string; city: string } | null;
  assignments: Assignment[];
}

const TIME_LABELS: Record<string, string> = {
  morning: "Morning (8–12)",
  afternoon: "Afternoon (12–5)",
  evening: "Evening (5–8)",
};

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const statusColors: Record<string, string> = {
  PENDING: "border-l-amber",
  CONFIRMED: "border-l-green",
  IN_PROGRESS: "border-l-teal",
  COMPLETED: "border-l-green/50",
};

export function ScheduleView() {
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek(new Date()));
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/schedule?start=${weekStart.toISOString()}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setEmployees(data.employees || []);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getMondayOfWeek(new Date()));

  const assignEmployee = async (bookingId: string, employeeId: string) => {
    setAssigning(bookingId);
    await fetch(`/api/bookings/${bookingId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    await fetchSchedule();
    setAssigning(null);
  };

  const unassignEmployee = async (bookingId: string, employeeId: string) => {
    setAssigning(bookingId);
    await fetch(`/api/bookings/${bookingId}/assign`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    await fetchSchedule();
    setAssigning(null);
  };

  // Build 7 days starting from Monday
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const weekEndDate = days[6];
  const today = new Date();

  return (
    <div>
      {/* Week navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={prevWeek} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-ivory">
            ← Prev
          </button>
          <button onClick={goToday} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-ivory font-medium">
            Today
          </button>
          <button onClick={nextWeek} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-ivory">
            Next →
          </button>
          <QuickBookForm onCreated={fetchSchedule} />
        </div>
        <div className="font-display text-base sm:text-lg">
          {formatShortDate(weekStart)} — {formatShortDate(weekEndDate)},{" "}
          {weekEndDate.getFullYear()}
        </div>
      </div>

      {/* Employee legend */}
      {employees.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <span className="text-[0.72rem] uppercase tracking-wider text-gray-400">Employees:</span>
          {employees.map((emp, i) => (
            <span key={emp.id} className="flex items-center gap-1.5 text-sm">
              <span
                className={`w-3 h-3 rounded-full ${
                  i === 0 ? "bg-teal" : i === 1 ? "bg-gold" : "bg-green"
                }`}
              />
              {emp.name}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-[#ece6d9] p-12 text-center text-gray-400">
          Loading schedule...
        </div>
      ) : (
        /* Weekly grid */
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">
          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const dayBookings = bookings.filter((b) =>
              isSameDay(new Date(b.scheduledDate), day)
            );

            return (
              <div key={day.toISOString()} className="min-h-[180px]">
                {/* Day header */}
                <div
                  className={`text-center py-2 rounded-t-lg text-sm font-medium ${
                    isToday
                      ? "bg-green text-white"
                      : "bg-ivory border border-[#ece6d9]"
                  }`}
                >
                  <div className="text-[0.72rem] uppercase tracking-wider">
                    {formatDayLabel(day)}
                  </div>
                  <div className="text-lg">{day.getDate()}</div>
                </div>

                {/* Day body */}
                <div className="bg-white border border-t-0 border-[#ece6d9] rounded-b-lg p-1.5 space-y-1.5 min-h-[140px]">
                  {dayBookings.length === 0 && (
                    <div className="text-gray-300 text-[0.72rem] text-center pt-6">
                      No jobs
                    </div>
                  )}
                  {dayBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`rounded-lg border-l-4 bg-ivory/50 p-2 text-[0.75rem] ${
                        statusColors[b.status] || "border-l-gray-300"
                      }`}
                    >
                      <div className="font-medium truncate">
                        {b.service.icon} {b.service.name}
                      </div>
                      <div className="text-gray-500 truncate">{b.customer.name}</div>
                      <div className="text-gray-400 text-[0.68rem]">
                        {TIME_LABELS[b.scheduledTime] || b.scheduledTime}
                      </div>
                      {b.address && (
                        <div className="text-gray-400 text-[0.68rem] truncate">
                          {b.address.street}
                        </div>
                      )}

                      {/* Assigned employees */}
                      {b.assignments.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {b.assignments.map((a) => {
                            const empIdx = employees.findIndex(
                              (e) => e.id === a.employee.id
                            );
                            return (
                              <span
                                key={a.employee.id}
                                className={`inline-flex items-center gap-1 text-[0.65rem] px-1.5 py-0.5 rounded-full text-white ${
                                  empIdx === 0
                                    ? "bg-teal"
                                    : empIdx === 1
                                    ? "bg-gold"
                                    : "bg-green"
                                }`}
                              >
                                {a.employee.name.split(" ")[0]}
                                <button
                                  onClick={() => unassignEmployee(b.id, a.employee.id)}
                                  className="hover:opacity-70 ml-0.5"
                                  title="Remove"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Assign dropdown */}
                      {employees.length > 0 && (
                        <div className="mt-1">
                          <select
                            className="w-full text-[0.68rem] border rounded px-1 py-0.5 bg-white text-gray-500"
                            value=""
                            disabled={assigning === b.id}
                            onChange={(e) => {
                              if (e.target.value) assignEmployee(b.id, e.target.value);
                            }}
                          >
                            <option value="">
                              {assigning === b.id ? "Saving..." : "+ Assign"}
                            </option>
                            {employees
                              .filter(
                                (emp) =>
                                  !b.assignments.some(
                                    (a) => a.employee.id === emp.id
                                  )
                              )
                              .map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* Empty state message */}
      {!loading && bookings.length === 0 && (
        <div className="mt-6 bg-white rounded-xl border border-[#ece6d9] p-8 text-center">
          <div className="text-3xl mb-3">📋</div>
          <p className="text-gray-500 text-[0.9rem] mb-2">
            No bookings this week.
          </p>
          <p className="text-gray-400 text-[0.8rem]">
            Bookings appear here when customers book online, or you can create one
            from the <a href="/admin/bookings" className="text-teal hover:underline">Bookings</a> page.
          </p>
        </div>
      )}
    </div>
  );
}
