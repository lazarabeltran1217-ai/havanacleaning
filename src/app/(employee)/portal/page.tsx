"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TodayJob {
  id: string;
  booking: {
    bookingNumber: string;
    scheduledTime: string;
    service: { name: string; icon: string | null };
    address?: { street: string; city: string } | null;
  };
}

export default function EmployeeToday() {
  const { data: session } = useSession();
  const [time, setTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState("");
  const [jobs, setJobs] = useState<TodayJob[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/clock/status")
      .then((r) => r.json())
      .then((d) => {
        setClockedIn(d.isClockedIn);
        if (d.currentEntry?.clockIn) setClockInTime(d.currentEntry.clockIn);
      })
      .catch(() => {});
    fetch("/api/portal/jobs/today")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .catch(() => {});
  }, []);

  const greeting =
    time.getHours() < 12 ? "Good Morning" : time.getHours() < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-tobacco">
          {greeting}, {session?.user?.name?.split(" ")[0] || "Team"}
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Clock Status */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center mb-5">
        <div className="font-display text-4xl font-bold text-tobacco">
          {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
        </div>
        <p className="text-gray-400 text-sm mt-2">
          {clockedIn
            ? `Clocked in since ${new Date(clockInTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
            : "Not clocked in"}
        </p>
        <Link
          href="/portal/clock"
          className={`mt-4 inline-block font-semibold py-3 px-8 rounded-xl text-sm transition-colors ${
            clockedIn ? "bg-red text-white hover:bg-red/90" : "bg-green text-white hover:bg-green/90"
          }`}
        >
          {clockedIn ? "Clock Out" : "Clock In"}
        </Link>
      </div>

      {/* Today's Jobs */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-display text-lg text-tobacco mb-3">Today&apos;s Jobs</h2>
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm">No jobs assigned for today.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[0.9rem]">
                    {j.booking.service.icon} {j.booking.service.name}
                  </span>
                  <span className="text-gray-400 text-[0.78rem] capitalize">{j.booking.scheduledTime}</span>
                </div>
                {j.booking.address && (
                  <div className="text-gray-400 text-[0.82rem]">
                    {j.booking.address.street}, {j.booking.address.city}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
