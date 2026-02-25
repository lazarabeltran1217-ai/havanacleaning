"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EmployeeToday() {
  const { data: session } = useSession();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const greeting = time.getHours() < 12 ? "Good Morning" : time.getHours() < 17 ? "Good Afternoon" : "Good Evening";

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
        <p className="text-gray-400 text-sm mt-2">Not clocked in</p>
        <Link
          href="/portal/clock"
          className="mt-4 inline-block bg-green text-white font-semibold py-3 px-8 rounded-xl text-sm hover:bg-green-light hover:text-tobacco transition-colors"
        >
          Clock In
        </Link>
      </div>

      {/* Today's Jobs */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-display text-lg text-tobacco mb-3">Today&apos;s Jobs</h2>
        <p className="text-gray-400 text-sm">No jobs assigned for today.</p>
      </div>
    </div>
  );
}
