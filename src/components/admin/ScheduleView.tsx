"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardList, CalendarDays, List, Clock } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { formatStatus } from "@/lib/utils";
import { QuickBookForm } from "./QuickBookForm";
import { BookingDetailModal } from "./BookingDetailModal";

interface Employee {
  id: string;
  name: string;
}

interface Assignment {
  employee: { id: string; name: string; addresses?: { street: string; city: string; state: string; zipCode: string }[] };
}

interface BookingItem {
  id: string;
  isHandyman?: boolean;
  isClockedIn?: boolean;
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

function getNowET(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
}

/** Extract the UTC date from a date string for calendar day comparison.
 *  Works for both midnight-UTC and noon-UTC stored dates. */
function toCalendarDate(dateStr: string): Date {
  const d = new Date(dateStr);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function formatShortDateUTC(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function formatFullDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const statusColors: Record<string, string> = {
  PENDING: "border-l-yellow-400",
  CONFIRMED: "border-l-blue-500",
  IN_PROGRESS: "border-l-teal",
  COMPLETED: "border-l-green-500",
  CANCELLED: "border-l-red-400",
};

const statusBadgeColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function BookingCard({
  b,
  employees,
  assigning,
  assignEmployee,
  unassignEmployee,
  compact,
  onSelect,
}: {
  b: BookingItem;
  employees: Employee[];
  assigning: string | null;
  assignEmployee: (bookingId: string, employeeId: string) => void;
  unassignEmployee: (bookingId: string, employeeId: string) => void;
  compact?: boolean;
  onSelect?: (b: BookingItem) => void;
}) {
  return (
    <div
      onClick={() => onSelect?.(b)}
      className={`rounded-lg border-l-4 bg-ivory/50 p-2 text-[0.75rem] cursor-pointer hover:bg-ivory transition-colors ${
        statusColors[b.status] || "border-l-gray-300"
      }`}
    >
      <div className="font-medium truncate flex items-center gap-1">
        <ServiceIcon emoji={b.service.icon} className="w-3.5 h-3.5 shrink-0" />
        {b.service.name}
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

      {b.isClockedIn && (
        <div className="flex items-center gap-0.5 text-[0.65rem] text-teal font-medium mt-0.5">
          <Clock className="w-3 h-3" /> Clocked In
        </div>
      )}

      {/* Mobile-only extra info */}
      {!compact && (
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[0.65rem] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${statusBadgeColors[b.status] || "bg-gray-100 text-gray-500"}`}>
            {formatStatus(b.status)}
          </span>
          {b.customer.phone && (
            <span className="text-gray-400 text-[0.65rem]">{b.customer.phone}</span>
          )}
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
  );
}

/** Build the calendar grid for a given month (Sun–Sat rows). */
function getMonthCalendarDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0=Sun..6=Sat (JS default)
  const gridStart = new Date(year, month, 1 - startDay);

  const days: Date[] = [];
  // Always build 6 rows × 7 cols = 42 cells
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleView() {
  const today = getNowET();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const calendarDays = getMonthCalendarDays(currentYear, currentMonth);
  const gridStart = calendarDays[0];
  const gridEnd = calendarDays[calendarDays.length - 1];

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const start = new Date(gridStart);
    const end = new Date(gridEnd);
    end.setDate(end.getDate() + 1); // inclusive
    const res = await fetch(`/api/schedule?start=${start.toISOString()}&end=${end.toISOString()}`);
    const data = await res.json();
    setBookings(data.bookings || []);
    setEmployees(data.employees || []);
    setLoading(false);
  }, [currentYear, currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const now = getNowET();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const assignEmployee = async (bookingId: string, employeeId: string) => {
    setAssigning(bookingId);
    const item = bookings.find((b) => b.id === bookingId);
    const url = item?.isHandyman
      ? `/api/handyman/${bookingId}/assign`
      : `/api/bookings/${bookingId}/assign`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    await fetchSchedule();
    setAssigning(null);
  };

  const unassignEmployee = async (bookingId: string, employeeId: string) => {
    setAssigning(bookingId);
    const item = bookings.find((b) => b.id === bookingId);
    const url = item?.isHandyman
      ? `/api/handyman/${bookingId}/assign`
      : `/api/bookings/${bookingId}/assign`;
    await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    await fetchSchedule();
    setAssigning(null);
  };

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Month navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={prevMonth} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-ivory">
            ←
          </button>
          <button onClick={goToday} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-ivory font-medium">
            Today
          </button>
          <button onClick={nextMonth} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-ivory">
            →
          </button>
          <QuickBookForm onCreated={fetchSchedule} />
          <div className="flex items-center border rounded-lg overflow-hidden ml-2">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-2.5 py-1.5 text-sm flex items-center gap-1 transition-colors ${viewMode === "calendar" ? "bg-green text-white" : "hover:bg-ivory"}`}
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1.5 text-sm flex items-center gap-1 transition-colors ${viewMode === "list" ? "bg-green text-white" : "hover:bg-ivory"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="font-display text-base sm:text-lg">{monthLabel}</div>
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
      ) : viewMode === "list" ? (
        /* ═══ LIST VIEW ═══ */
        <div className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
          <table className="w-full text-left text-[0.85rem]">
            <thead>
              <tr className="bg-ivory/50 border-b border-[#ece6d9]">
                <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium">Date</th>
                <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium">Time</th>
                <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium">Service</th>
                <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium">Customer</th>
                <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium hidden sm:table-cell">Address</th>
                <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium">Status</th>
                <th className="px-4 py-3 text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium hidden sm:table-cell">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {bookings
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                .map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="border-b border-gray-50 hover:bg-ivory/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{formatShortDateUTC(b.scheduledDate)}</div>
                    <div className="text-gray-400 text-[0.72rem]">{new Date(b.scheduledDate).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{TIME_LABELS[b.scheduledTime] || b.scheduledTime}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5">
                      <ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">{b.customer.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-[0.82rem] hidden sm:table-cell">{b.address?.street || "\u2014"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.7rem] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium ${statusBadgeColors[b.status] || "bg-gray-100 text-gray-500"}`}>
                      {formatStatus(b.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[0.82rem] hidden sm:table-cell">
                    {b.assignments.length > 0
                      ? b.assignments.map((a) => a.employee.name).join(", ")
                      : <span className="text-gray-300">Unassigned</span>}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No bookings this month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Mobile: vertical day list (only days with bookings + today) */}
          <div className="md:hidden space-y-3">
            {calendarDays
              .filter((day) => {
                if (day.getMonth() !== currentMonth) return false;
                const hasBookings = bookings.some((b) => isSameDay(toCalendarDate(b.scheduledDate), day));
                return hasBookings || isSameDay(day, today);
              })
              .map((day) => {
                const isToday = isSameDay(day, today);
                const dayBookings = bookings.filter((b) =>
                  isSameDay(toCalendarDate(b.scheduledDate), day)
                );

                return (
                  <div key={day.toISOString()} className="bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between ${
                        isToday
                          ? "bg-green text-white"
                          : "bg-ivory/50 border-b border-[#ece6d9]"
                      }`}
                    >
                      <span className="font-medium text-[0.88rem]">
                        {formatFullDayLabel(day)}
                      </span>
                      <span className={`text-[0.75rem] ${isToday ? "text-white/80" : "text-gray-400"}`}>
                        {dayBookings.length} job{dayBookings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      {dayBookings.length === 0 ? (
                        <div className="text-gray-300 text-[0.8rem] text-center py-3">
                          No jobs scheduled
                        </div>
                      ) : (
                        dayBookings.map((b) => (
                          <BookingCard
                            key={b.id}
                            b={b}
                            employees={employees}
                            assigning={assigning}
                            assignEmployee={assignEmployee}
                            unassignEmployee={unassignEmployee}
                            onSelect={setSelectedBooking}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            {bookings.length === 0 && (
              <div className="bg-white rounded-xl border border-[#ece6d9] p-8 text-center text-gray-400 text-[0.85rem]">
                No bookings this month.
              </div>
            )}
          </div>

          {/* Desktop: month grid */}
          <div className="hidden md:block bg-white rounded-xl border border-[#ece6d9] overflow-hidden">
            {/* Day-of-week header */}
            <div className="grid grid-cols-7 border-b border-[#ece6d9] bg-ivory/50">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="px-2 py-2 text-center text-[0.7rem] uppercase tracking-wider text-gray-400 font-medium">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const isToday = isSameDay(day, today);
                const isCurrentMonth = day.getMonth() === currentMonth;
                const dayBookings = bookings.filter((b) =>
                  isSameDay(toCalendarDate(b.scheduledDate), day)
                );

                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] border-b border-r border-[#ece6d9]/60 p-1 ${
                      !isCurrentMonth ? "bg-gray-50/50" : ""
                    } ${idx % 7 === 0 ? "border-l-0" : ""}`}
                  >
                    {/* Day number */}
                    <div className="flex items-center justify-between px-1 mb-0.5">
                      <span
                        className={`text-[0.78rem] font-medium inline-flex items-center justify-center ${
                          isToday
                            ? "bg-green text-white w-6 h-6 rounded-full"
                            : isCurrentMonth
                            ? "text-tobacco"
                            : "text-gray-300"
                        }`}
                      >
                        {day.getDate()}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="text-[0.62rem] text-gray-400">
                          {dayBookings.length} job{dayBookings.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Booking cards */}
                    <div className="space-y-1">
                      {dayBookings.map((b) => (
                        <BookingCard
                          key={b.id}
                          b={b}
                          employees={employees}
                          assigning={assigning}
                          assignEmployee={assignEmployee}
                          unassignEmployee={unassignEmployee}
                          onSelect={setSelectedBooking}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Empty state message */}
      {!loading && bookings.length === 0 && viewMode === "calendar" && (
        <div className="mt-6 bg-white rounded-xl border border-[#ece6d9] p-8 text-center hidden md:block">
          <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-[0.9rem] mb-2">
            No bookings this month.
          </p>
          <p className="text-gray-400 text-[0.8rem]">
            Bookings appear here when customers book online, or you can create one
            from the <a href="/admin/bookings" className="text-teal hover:underline">Bookings</a> page.
          </p>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={() => { setSelectedBooking(null); fetchSchedule(); }}
        />
      )}
    </div>
  );
}
