"use client";

import { useState, useEffect, useCallback } from "react";
import { ServiceIcon } from "@/lib/service-icons";

interface TodayJob {
  id: string;
  booking: {
    id: string;
    bookingNumber: string;
    scheduledTime: string;
    status: string;
    service: { name: string; icon: string | null };
    address?: { street: string; city: string } | null;
  };
}

interface ClockEntry {
  clockIn: string;
  booking?: {
    bookingNumber: string;
    service: { name: string; icon: string | null };
    address?: { street: string; city: string } | null;
  } | null;
}

export default function ClockPage() {
  const [time, setTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [currentEntry, setCurrentEntry] = useState<ClockEntry | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [jobs, setJobs] = useState<TodayJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch clock status and today's jobs
  useEffect(() => {
    fetch("/api/clock/status")
      .then((r) => r.json())
      .then((d) => {
        setIsClockedIn(d.isClockedIn);
        if (d.currentEntry) {
          setClockInTime(new Date(d.currentEntry.clockIn));
          setCurrentEntry(d.currentEntry);
        }
      })
      .catch(() => {});

    fetch("/api/portal/jobs/today")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .catch(() => {});
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (!isClockedIn || !clockInTime) {
      setElapsed("00:00:00");
      return;
    }
    const interval = setInterval(() => {
      const diff = Math.max(0, Date.now() - clockInTime.getTime());
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const getGPS = async () => {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      return { lat: undefined, lng: undefined };
    }
  };

  const handleClockIn = useCallback(async () => {
    if (!selectedJobId) return;
    setLoading(true);
    setMessage("");

    const { lat, lng } = await getGPS();
    const job = jobs.find((j) => j.booking.id === selectedJobId);

    const res = await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clock-in", lat, lng, bookingId: selectedJobId }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to clock in");
      return;
    }

    setIsClockedIn(true);
    setClockInTime(new Date(data.entry.clockIn));
    setCurrentEntry({
      clockIn: data.entry.clockIn,
      booking: job?.booking
        ? { bookingNumber: job.booking.bookingNumber, service: job.booking.service, address: job.booking.address }
        : null,
    });
    setMessage("Clocked in successfully!");
  }, [selectedJobId, jobs]);

  const handleClockOut = useCallback(async (completeJob: boolean) => {
    setShowCompletePrompt(false);
    setLoading(true);
    setMessage("");

    const { lat, lng } = await getGPS();

    const res = await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clock-out", lat, lng, completeJob }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed to clock out");
      return;
    }

    setIsClockedIn(false);
    setClockInTime(null);
    setCurrentEntry(null);
    setSelectedJobId(null);
    const hours = data.entry.hoursWorked?.toFixed(1) || "0";
    setMessage(`Clocked out! ${hours} hours worked.${completeJob ? " Job marked as completed." : ""}`);

    // Refresh jobs list
    fetch("/api/portal/jobs/today")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* LIVE CLOCK */}
      <div className="text-gray-400 text-sm mb-2">
        {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </div>
      <div className="font-display text-3xl font-bold text-tobacco mb-6">
        {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </div>

      {isClockedIn ? (
        <>
          {/* ACTIVE JOB INFO */}
          {currentEntry?.booking && (
            <div className="bg-green/5 border border-green/20 rounded-xl px-5 py-3 mb-4 w-full max-w-sm">
              <div className="text-[0.72rem] uppercase tracking-wider text-green font-medium mb-1">Working on</div>
              <div className="flex items-center justify-center gap-1.5 text-[0.9rem] font-medium text-tobacco">
                <ServiceIcon emoji={currentEntry.booking.service.icon} className="w-4 h-4 text-green" />
                {currentEntry.booking.service.name}
              </div>
              {currentEntry.booking.address && (
                <div className="text-gray-400 text-[0.78rem] mt-0.5">
                  {currentEntry.booking.address.street}, {currentEntry.booking.address.city}
                </div>
              )}
            </div>
          )}

          {/* ELAPSED */}
          <div className="mb-4">
            <div className="text-gray-400 text-[0.75rem] uppercase tracking-wider mb-1">Time Worked</div>
            <div className="font-mono text-2xl text-green font-bold">{elapsed}</div>
          </div>

          {/* CLOCK OUT BUTTON */}
          <button
            onClick={() => setShowCompletePrompt(true)}
            disabled={loading}
            className="w-48 h-48 rounded-full text-white font-display text-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "#C0392B" }}
          >
            {loading ? "..." : <><span>CLOCK</span><br /><span>OUT</span></>}
          </button>

          {/* COMPLETE JOB PROMPT */}
          {showCompletePrompt && (
            <div className="mt-5 bg-white border border-gray-200 rounded-xl p-4 w-full max-w-sm shadow-sm">
              <p className="text-[0.85rem] font-medium text-tobacco mb-3">Mark this job as completed?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleClockOut(false)}
                  className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium"
                >
                  Just Clock Out
                </button>
                <button
                  onClick={() => handleClockOut(true)}
                  className="flex-1 px-4 py-2.5 bg-green text-white rounded-lg text-sm font-medium"
                >
                  Complete Job
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* JOB SELECTION */}
          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-sm mb-6">
              <p className="text-gray-400 text-sm">No jobs assigned for today.</p>
              <p className="text-gray-300 text-[0.75rem] mt-1">Ask your manager to assign you a job.</p>
            </div>
          ) : (
            <div className="w-full max-w-sm mb-6">
              <div className="text-[0.72rem] uppercase tracking-wider text-gray-400 font-medium mb-2">Select a job to clock in</div>
              <div className="space-y-2">
                {jobs.map((j) => {
                  const isSelected = selectedJobId === j.booking.id;
                  return (
                    <button
                      key={j.id}
                      onClick={() => setSelectedJobId(j.booking.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                        isSelected
                          ? "border-green bg-green/5"
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ServiceIcon emoji={j.booking.service.icon} className="w-4 h-4 text-green" />
                          <span className="text-[0.85rem] font-medium text-tobacco">{j.booking.service.name}</span>
                        </div>
                        <span className="text-gray-400 text-[0.75rem] capitalize">{j.booking.scheduledTime}</span>
                      </div>
                      {j.booking.address && (
                        <div className="text-gray-400 text-[0.78rem] mt-1 ml-6">
                          {j.booking.address.street}, {j.booking.address.city}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLOCK IN BUTTON */}
          <button
            onClick={handleClockIn}
            disabled={loading || !selectedJobId}
            className="w-48 h-48 rounded-full text-white font-display text-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: selectedJobId ? "#2D6A4F" : "#9CA3AF" }}
          >
            {loading ? "..." : <><span>CLOCK</span><br /><span>IN</span></>}
          </button>
        </>
      )}

      {/* GPS INDICATOR */}
      <p className="text-gray-400 text-[0.75rem] mt-4">
        GPS location will be recorded
      </p>

      {/* STATUS MESSAGE */}
      {message && (
        <div
          className={`mt-4 px-4 py-2 rounded-lg text-[0.85rem] ${
            message.includes("Failed") || message.includes("error")
              ? "bg-red/10 text-red"
              : "bg-green/10 text-green"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
