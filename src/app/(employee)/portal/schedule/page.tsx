"use client";

import { useState, useEffect, useMemo } from "react";
import { ServiceIcon } from "@/lib/service-icons";

interface ScheduleJob {
  id: string;
  booking: {
    bookingNumber: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
    service: { name: string; icon: string | null };
    address: { street: string; city: string } | null;
  };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulePage() {
  const [jobs, setJobs] = useState<ScheduleJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  // Get the start (Monday) of the current week + offset
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday = start
    d.setDate(d.getDate() + diff + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/portal/jobs")
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isToday = (d: Date) => {
    const now = new Date();
    return d.toDateString() === now.toDateString();
  };

  const getJobsForDay = (d: Date) => {
    const dateStr = d.toISOString().split("T")[0];
    return jobs.filter((j) => {
      const jobDate = new Date(j.booking.scheduledDate).toISOString().split("T")[0];
      return jobDate === dateStr;
    });
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString("en-US", opts)} — ${end.toLocaleDateString("en-US", opts)}`;
  };

  if (loading) return <p className="text-gray-400 text-sm text-center py-8">Loading schedule...</p>;

  return (
    <div>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="text-teal font-semibold text-sm px-3 py-1 rounded-lg hover:bg-teal/10">
          &larr; Prev
        </button>
        <div className="text-center">
          <h2 className="font-display text-lg text-tobacco">My Schedule</h2>
          <p className="text-gray-400 text-[0.78rem]">{formatWeekRange()}</p>
        </div>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="text-teal font-semibold text-sm px-3 py-1 rounded-lg hover:bg-teal/10">
          Next &rarr;
        </button>
      </div>

      {/* Week Grid */}
      <div className="space-y-2">
        {weekDays.map((day) => {
          const dayJobs = getJobsForDay(day);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`bg-white rounded-xl border p-4 ${
                today ? "border-green shadow-sm" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[0.7rem] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                    today ? "bg-green text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {DAY_NAMES[day.getDay()]}
                </span>
                <span className="text-gray-500 text-sm">
                  {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                {today && <span className="text-green text-[0.7rem] font-medium">Today</span>}
              </div>

              {dayJobs.length === 0 ? (
                <p className="text-gray-300 text-sm">No jobs</p>
              ) : (
                <div className="space-y-2">
                  {dayJobs.map((j) => (
                    <div key={j.id} className="border border-gray-100 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.85rem] font-medium flex items-center gap-1">
                          <ServiceIcon emoji={j.booking.service.icon} className="w-3.5 h-3.5 text-green" /> {j.booking.service.name}
                        </span>
                        <span className="text-gray-400 text-[0.75rem] capitalize">{j.booking.scheduledTime}</span>
                      </div>
                      {j.booking.address && (
                        <div className="text-gray-400 text-[0.78rem] mt-0.5">
                          {j.booking.address.street}, {j.booking.address.city}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back to Today */}
      {weekOffset !== 0 && (
        <button
          onClick={() => setWeekOffset(0)}
          className="mt-4 w-full py-2.5 bg-green/10 text-green rounded-xl text-sm font-semibold"
        >
          Back to This Week
        </button>
      )}
    </div>
  );
}
