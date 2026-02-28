"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
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

interface ClockStatus {
  isClockedIn: boolean;
  currentEntry?: {
    clockIn: string;
    booking?: {
      bookingNumber: string;
      service: { name: string; icon: string | null };
      address?: { street: string; city: string } | null;
    } | null;
  } | null;
}

interface CheckoutItem {
  id: string;
  quantity: number;
  returnedQty: number;
  checkedOutAt: string;
  inventoryItem: { name: string; unit: string };
  booking?: { bookingNumber: string } | null;
}

export default function EmployeeToday() {
  const { data: session } = useSession();
  const [time, setTime] = useState(new Date());
  const [clockStatus, setClockStatus] = useState<ClockStatus>({ isClockedIn: false });
  const [jobs, setJobs] = useState<TodayJob[]>([]);
  const [supplies, setSupplies] = useState<CheckoutItem[]>([]);
  const [returningId, setReturningId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/clock/status")
      .then((r) => r.json())
      .then((d) => setClockStatus(d))
      .catch(() => {});
    fetch("/api/portal/jobs/today")
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs || []))
      .catch(() => {});
    fetch("/api/portal/supplies")
      .then((r) => r.json())
      .then((d) => setSupplies(d.checkouts || []))
      .catch(() => {});
  }, []);

  const handleReturn = async (checkoutId: string) => {
    setReturningId(checkoutId);
    const res = await fetch("/api/portal/supplies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
    });
    setReturningId(null);
    if (res.ok) {
      setSupplies((prev) => prev.filter((s) => s.id !== checkoutId));
    }
  };

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

        {clockStatus.isClockedIn && clockStatus.currentEntry?.booking ? (
          <div className="mt-2">
            <div className="flex items-center justify-center gap-1.5 text-[0.85rem] text-green font-medium">
              <ServiceIcon emoji={clockStatus.currentEntry.booking.service.icon} className="w-4 h-4" />
              Working on: {clockStatus.currentEntry.booking.service.name}
            </div>
            <p className="text-gray-400 text-[0.75rem] mt-0.5">
              Since {new Date(clockStatus.currentEntry.clockIn).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm mt-2">
            {clockStatus.isClockedIn
              ? `Clocked in since ${new Date(clockStatus.currentEntry?.clockIn || "").toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
              : "Not clocked in"}
          </p>
        )}

        <Link
          href="/portal/clock"
          className={`mt-4 inline-block font-semibold py-3 px-8 rounded-xl text-sm transition-colors ${
            clockStatus.isClockedIn ? "bg-red text-white hover:bg-red/90" : "bg-green text-white hover:bg-green/90"
          }`}
        >
          {clockStatus.isClockedIn ? "Clock Out" : "Clock In"}
        </Link>
      </div>

      {/* Today's Jobs */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-5">
        <h2 className="font-display text-lg text-tobacco mb-3">Today&apos;s Jobs</h2>
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm">No jobs assigned for today.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[0.9rem] flex items-center gap-1.5">
                    <ServiceIcon emoji={j.booking.service.icon} className="w-4 h-4 text-green" /> {j.booking.service.name}
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

      {/* My Supplies */}
      {supplies.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-display text-lg text-tobacco mb-3">My Supplies</h2>
          <div className="space-y-2">
            {supplies.map((s) => {
              const remaining = s.quantity - s.returnedQty;
              return (
                <div key={s.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-[0.85rem] font-medium text-tobacco">{s.inventoryItem.name}</div>
                    <div className="text-gray-400 text-[0.75rem]">
                      {remaining} {s.inventoryItem.unit}
                      {s.booking && ` \u2022 ${s.booking.bookingNumber}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleReturn(s.id)}
                    disabled={returningId === s.id}
                    className="px-3 py-1.5 text-[0.78rem] font-medium border border-green/30 text-green rounded-lg hover:bg-green/5 disabled:opacity-50"
                  >
                    {returningId === s.id ? "..." : "Return"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
