"use client";

import { useState, useEffect, useCallback } from "react";

export default function ClockPage() {
  const [time, setTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/clock/status")
      .then((r) => r.json())
      .then((d) => {
        setIsClockedIn(d.isClockedIn);
        if (d.currentEntry?.clockIn) {
          setClockInTime(new Date(d.currentEntry.clockIn));
        }
      })
      .catch(() => {});
  }, []);

  // Update elapsed timer
  useEffect(() => {
    if (!isClockedIn || !clockInTime) {
      setElapsed("00:00:00");
      return;
    }
    const interval = setInterval(() => {
      const diff = Date.now() - clockInTime.getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const handleClock = useCallback(async () => {
    setLoading(true);
    setMessage("");

    // Get GPS
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch {
      // GPS not available — continue without it
    }

    const action = isClockedIn ? "clock-out" : "clock-in";

    const res = await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, lat, lng }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Failed");
      return;
    }

    if (action === "clock-in") {
      setIsClockedIn(true);
      setClockInTime(new Date(data.entry.clockIn));
      setMessage("Clocked in successfully!");
    } else {
      setIsClockedIn(false);
      setClockInTime(null);
      const hours = data.entry.hoursWorked?.toFixed(1) || "0";
      setMessage(`Clocked out! ${hours} hours worked.`);
    }
  }, [isClockedIn]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* LIVE CLOCK */}
      <div className="text-gray-400 text-sm mb-2">
        {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </div>
      <div className="font-display text-3xl font-bold text-tobacco mb-8">
        {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </div>

      {/* ELAPSED */}
      {isClockedIn && (
        <div className="mb-4">
          <div className="text-gray-400 text-[0.75rem] uppercase tracking-wider mb-1">Time Worked</div>
          <div className="font-mono text-2xl text-green font-bold">{elapsed}</div>
        </div>
      )}

      {/* BIG CLOCK BUTTON */}
      <button
        onClick={handleClock}
        disabled={loading}
        className={`w-48 h-48 rounded-full text-white font-display text-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
          isClockedIn
            ? "bg-red hover:bg-red/90"
            : "bg-green hover:bg-green/90"
        }`}
      >
        {loading ? "..." : isClockedIn ? "CLOCK\nOUT" : "CLOCK\nIN"}
      </button>

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
