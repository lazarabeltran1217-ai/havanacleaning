"use client";

import { useEffect, useState } from "react";

interface ActiveEmployee {
  name: string;
  clockIn: string;
}

export function LiveClock({ activeEmployees }: { activeEmployees: ActiveEmployee[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now
    ? now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      })
    : "--:--:-- --";

  const date = now
    ? now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      })
    : "\u00A0";

  return (
    <div className="bg-white rounded-xl p-5 border border-[#ece6d9] text-center h-full">
      <h3 className="font-display text-base mb-4 underline underline-offset-4">Live Clock</h3>
      <div className="font-display text-3xl font-bold text-tobacco tracking-tight">{time}</div>
      <div className="text-gray-400 text-sm mt-1">{date}</div>

      {activeEmployees.length > 0 && (
        <div className="mt-5 text-left space-y-1.5">
          {activeEmployees.map((e) => {
            const clockInTime = new Date(e.clockIn).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              timeZone: "America/New_York",
            });
            return (
              <div key={e.name + e.clockIn} className="text-[0.82rem] text-gray-500">
                {e.name} — In {clockInTime}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
