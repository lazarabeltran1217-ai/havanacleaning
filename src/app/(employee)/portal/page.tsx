"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, MapPin, Clock, Package, DollarSign, Calendar, User } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { useTranslations } from "next-intl";

/* ─── Type Definitions ─── */

interface TodayJob {
  id: string;
  booking: {
    id: string;
    bookingNumber: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
    customerNotes: string | null;
    service: { name: string; icon: string | null };
    customer: { name: string; phone: string | null };
    address: { street: string; unit: string | null; city: string; state: string; zipCode: string } | null;
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

interface CheckoutItem {
  id: string;
  quantity: number;
  returnedQty: number;
  checkedOutAt: string;
  inventoryItem: { name: string; unit: string };
  booking?: { bookingNumber: string } | null;
}

interface TimeEntryData {
  id: string;
  clockIn: string;
  clockOut: string | null;
  hoursWorked: number | null;
  booking: { bookingNumber: string; service: { name: string } } | null;
}

interface HoursSummary {
  totalHours: number;
  totalEntries: number;
  hourlyRate: number;
  estimatedEarnings: number;
}

interface PayStub {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalHours: number;
  hourlyRate: number;
  grossPay: number;
  deductions: number;
  bonuses: number;
  tips: number;
  mileageReimbursement: number;
  netPay: number;
  paidAt: string;
  paidVia: string | null;
}

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

/* ─── Helpers ─── */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green/10 text-green",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green/20 text-green",
  PENDING: "bg-amber-100 text-amber-600",
};

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

/* ─── Dark mode card class helpers ─── */
const CARD = "bg-white dark:bg-[#231c16] rounded-2xl border border-gray-100 dark:border-[#3a2f25] shadow-sm p-5";
const INNER_BORDER = "border-gray-100 dark:border-[#3a2f25]";
const INNER_BG = "bg-ivory/50 dark:bg-[#1a1410]";
const TEXT_PRIMARY = "text-tobacco dark:text-cream";
const TEXT_MUTED = "text-gray-400 dark:text-sand/70";
const TEXT_FAINT = "text-gray-300 dark:text-sand/50";
const INPUT_CLS = "w-full px-3 py-2 border border-gray-200 dark:border-[#3a2f25] rounded-lg text-sm bg-white dark:bg-[#1a1410] dark:text-cream focus:outline-none focus:ring-2 focus:ring-green/30";

/* ─── Main Dashboard ─── */

export default function EmployeeDashboard() {
  const { data: session } = useSession();
  const t = useTranslations("portal");
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Clock state
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [currentEntry, setCurrentEntry] = useState<ClockEntry | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const [clockLoading, setClockLoading] = useState(false);
  const [clockMessage, setClockMessage] = useState("");
  const [todayJobs, setTodayJobs] = useState<TodayJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);

  // Schedule state
  const [allJobs, setAllJobs] = useState<ScheduleJob[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  // Hours state
  const [hoursPeriod, setHoursPeriod] = useState<"week" | "month">("week");
  const [hoursEntries, setHoursEntries] = useState<TimeEntryData[]>([]);
  const [hoursSummary, setHoursSummary] = useState<HoursSummary | null>(null);

  // Supplies state
  const [supplies, setSupplies] = useState<CheckoutItem[]>([]);
  const [returningId, setReturningId] = useState<string | null>(null);

  // Pay stubs state
  const [payStubs, setPayStubs] = useState<PayStub[]>([]);
  const [expandedStubId, setExpandedStubId] = useState<string | null>(null);

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileLocale, setProfileLocale] = useState("en");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  /* ─── Live Clock ─── */
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  /* ─── Elapsed Timer ─── */
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
      setElapsed(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  /* ─── Fetch All Data ─── */
  useEffect(() => {
    Promise.all([
      fetch("/api/clock/status").then((r) => r.json()).catch(() => ({ isClockedIn: false })),
      fetch("/api/portal/jobs/today").then((r) => r.json()).catch(() => ({ jobs: [] })),
      fetch("/api/portal/jobs").then((r) => r.json()).catch(() => ({ jobs: [] })),
      fetch("/api/portal/hours?period=week").then((r) => r.json()).catch(() => ({ entries: [], summary: null })),
      fetch("/api/portal/pay-stubs").then((r) => r.json()).catch(() => ({ payStubs: [] })),
      fetch("/api/portal/supplies").then((r) => r.json()).catch(() => ({ checkouts: [] })),
      fetch("/api/account/profile").then((r) => r.json()).catch(() => ({ user: null })),
    ]).then(([clock, today, all, hours, stubs, sups, profile]) => {
      // Clock
      setIsClockedIn(clock.isClockedIn);
      if (clock.currentEntry) {
        setClockInTime(new Date(clock.currentEntry.clockIn));
        setCurrentEntry(clock.currentEntry);
      }
      // Jobs
      setTodayJobs(today.jobs || []);
      setAllJobs(all.jobs || []);
      // Hours
      setHoursEntries(hours.entries || []);
      setHoursSummary(hours.summary || null);
      // Pay stubs
      setPayStubs(stubs.payStubs || []);
      // Supplies
      setSupplies(sups.checkouts || []);
      // Profile
      if (profile.user) {
        setProfileName(profile.user.name || "");
        setProfilePhone(profile.user.phone || "");
        setProfileLocale(profile.user.locale || "en");
      }
      setLoading(false);
    });
  }, []);

  /* ─── Refetch hours when period changes ─── */
  useEffect(() => {
    fetch(`/api/portal/hours?period=${hoursPeriod}`)
      .then((r) => r.json())
      .then((d) => {
        setHoursEntries(d.entries || []);
        setHoursSummary(d.summary || null);
      })
      .catch(() => {});
  }, [hoursPeriod]);

  /* ─── Clock Actions ─── */
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
    setClockLoading(true);
    setClockMessage("");
    const { lat, lng } = await getGPS();
    const job = todayJobs.find((j) => j.booking.id === selectedJobId);
    const res = await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clock-in", lat, lng, bookingId: selectedJobId }),
    });
    const data = await res.json();
    setClockLoading(false);
    if (!res.ok) {
      setClockMessage(data.error || t("clock_failed_in"));
      return;
    }
    setIsClockedIn(true);
    setClockInTime(new Date(data.entry.clockIn));
    setCurrentEntry({
      clockIn: data.entry.clockIn,
      booking: job?.booking ? { bookingNumber: job.booking.bookingNumber, service: job.booking.service, address: job.booking.address } : null,
    });
    setClockMessage(t("clock_clocked_in"));
  }, [selectedJobId, todayJobs, t]);

  const handleClockOut = useCallback(async (completeJob: boolean) => {
    setShowCompletePrompt(false);
    setClockLoading(true);
    setClockMessage("");
    const { lat, lng } = await getGPS();
    const res = await fetch("/api/clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clock-out", lat, lng, completeJob }),
    });
    const data = await res.json();
    setClockLoading(false);
    if (!res.ok) {
      setClockMessage(data.error || t("clock_failed_out"));
      return;
    }
    setIsClockedIn(false);
    setClockInTime(null);
    setCurrentEntry(null);
    setSelectedJobId(null);
    const hours = data.entry.hoursWorked?.toFixed(1) || "0";
    setClockMessage(`Clocked out! ${hours}h worked.${completeJob ? " Job completed." : ""}`);
    fetch("/api/portal/jobs/today").then((r) => r.json()).then((d) => setTodayJobs(d.jobs || [])).catch(() => {});
  }, [t]);

  /* ─── Supply Return ─── */
  const handleReturn = async (checkoutId: string) => {
    setReturningId(checkoutId);
    const res = await fetch("/api/portal/supplies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
    });
    setReturningId(null);
    if (res.ok) setSupplies((prev) => prev.filter((s) => s.id !== checkoutId));
  };

  /* ─── Profile Save ─── */
  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profileName, phone: profilePhone, locale: profileLocale }),
    });
    setProfileSaving(false);
    setProfileMessage(res.ok ? t("profile_saved") : t("profile_failed"));
  };

  /* ─── Schedule Helpers ─── */
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  }), [weekStart]);

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  const getJobsForDay = (d: Date) => {
    const dateStr = d.toISOString().split("T")[0];
    return allJobs.filter((j) => new Date(j.booking.scheduledDate).toISOString().split("T")[0] === dateStr);
  };

  const formatWeekRange = () => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString("en-US", opts)} — ${end.toLocaleDateString("en-US", opts)}`;
  };

  /* ─── Hours grouped by day ─── */
  const groupedHours = useMemo(() => {
    const groups: Record<string, TimeEntryData[]> = {};
    for (const entry of hoursEntries) {
      const date = new Date(entry.clockIn).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      if (!groups[date]) groups[date] = [];
      groups[date].push(entry);
    }
    return groups;
  }, [hoursEntries]);

  /* ─── Derived ─── */
  const greeting = time.getHours() < 12 ? t("greeting_morning") : time.getHours() < 17 ? t("greeting_afternoon") : t("greeting_evening");
  const firstName = session?.user?.name?.split(" ")[0] || profileName.split(" ")[0] || "Team";
  const totalEarned = payStubs.reduce((sum, p) => sum + p.netPay, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={TEXT_MUTED + " text-sm"}>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ═══ WELCOME BANNER ═══ */}
      <div className="bg-gradient-to-r from-green-light to-green dark:from-green dark:to-[#1a3a2a] rounded-2xl p-6 text-white text-center">
        <h1 className="font-display text-2xl">
          {greeting}, {firstName}
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {todayJobs.length > 0 && (
            <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {t("badge_jobs", { count: todayJobs.length })}
            </span>
          )}
          <span className={`backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${isClockedIn ? "bg-green/30" : "bg-white/15"}`}>
            <Clock className="w-3 h-3" /> {isClockedIn ? t("badge_clocked_in") : t("badge_not_clocked")}
          </span>
          {supplies.length > 0 && (
            <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Package className="w-3 h-3" /> {t("badge_supplies", { count: supplies.length })}
            </span>
          )}
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ─── CLOCK IN/OUT CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <Clock className="w-4 h-4 text-green" /> {t("clock_title")}
          </h3>

          <div className="text-center mb-4">
            <div className={`font-display text-3xl font-bold ${TEXT_PRIMARY}`}>
              {time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>

          {isClockedIn ? (
            <>
              {currentEntry?.booking && (
                <div className="bg-green/5 border border-green/20 rounded-xl px-4 py-3 mb-3">
                  <div className="text-[0.7rem] uppercase tracking-wider text-green font-medium mb-0.5">{t("clock_working_on")}</div>
                  <div className={`flex items-center gap-1.5 text-[0.88rem] font-medium ${TEXT_PRIMARY}`}>
                    <ServiceIcon emoji={currentEntry.booking.service.icon} className="w-4 h-4 text-green" />
                    {currentEntry.booking.service.name}
                  </div>
                  {currentEntry.booking.address && (
                    <div className={`${TEXT_MUTED} text-[0.75rem] mt-0.5`}>{currentEntry.booking.address.street}, {currentEntry.booking.address.city}</div>
                  )}
                </div>
              )}

              <div className="text-center mb-4">
                <div className={`${TEXT_MUTED} text-[0.72rem] uppercase tracking-wider mb-0.5`}>{t("clock_time_worked")}</div>
                <div className="font-mono text-2xl text-green font-bold tabular-nums tracking-widest">{elapsed}</div>
              </div>

              <button
                onClick={() => setShowCompletePrompt(true)}
                disabled={clockLoading}
                className="w-full py-3 bg-[#C0392B] text-white rounded-xl font-semibold text-sm transition-colors hover:bg-[#A93226] disabled:opacity-50"
              >
                {clockLoading ? "..." : t("clock_out")}
              </button>

              {showCompletePrompt && (
                <div className={`mt-3 border ${INNER_BORDER} rounded-xl p-3`}>
                  <p className={`text-[0.82rem] font-medium ${TEXT_PRIMARY} mb-2`}>{t("clock_complete_prompt")}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleClockOut(false)} className={`flex-1 px-3 py-2 border ${INNER_BORDER} rounded-lg text-sm font-medium ${TEXT_PRIMARY}`}>{t("clock_just_out")}</button>
                    <button onClick={() => handleClockOut(true)} className="flex-1 px-3 py-2 bg-green text-white rounded-lg text-sm font-medium">{t("clock_complete")}</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {(() => {
                const clockableJobs = todayJobs.filter((j) => j.booking.status !== "COMPLETED");
                return clockableJobs.length === 0 ? (
                  <div className="text-center py-4">
                    <p className={`${TEXT_MUTED} text-sm`}>{t("clock_no_jobs")}</p>
                    <p className={`${TEXT_FAINT} text-[0.72rem] mt-1`}>{t("clock_no_jobs_sub")}</p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <div className={`text-[0.7rem] uppercase tracking-wider ${TEXT_MUTED} font-medium mb-2`}>{t("clock_select_job")}</div>
                    <div className="space-y-2">
                      {clockableJobs.map((j) => (
                        <button
                          key={j.id}
                          onClick={() => setSelectedJobId(j.booking.id)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${selectedJobId === j.booking.id ? "border-green bg-green/5" : `${INNER_BORDER} hover:border-gray-200 dark:hover:border-[#4a3f35]`}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[0.82rem] font-medium ${TEXT_PRIMARY} flex items-center gap-1.5`}>
                              <ServiceIcon emoji={j.booking.service.icon} className="w-3.5 h-3.5 text-green" /> {j.booking.service.name}
                            </span>
                            <span className={`${TEXT_MUTED} text-[0.72rem] capitalize`}>{j.booking.scheduledTime}</span>
                          </div>
                          {j.booking.address && (
                            <div className={`${TEXT_MUTED} text-[0.72rem] mt-0.5 ml-5`}>{j.booking.address.street}, {j.booking.address.city}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <button
                onClick={handleClockIn}
                disabled={clockLoading || !selectedJobId}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: selectedJobId ? "#2D6A4F" : "#9CA3AF" }}
              >
                {clockLoading ? "..." : t("clock_in")}
              </button>
            </>
          )}

          <p className={`${TEXT_FAINT} text-[0.68rem] text-center mt-2`}>{t("clock_gps")}</p>

          {clockMessage && (
            <div className={`mt-2 px-3 py-2 rounded-lg text-[0.82rem] text-center ${clockMessage.includes("Failed") || clockMessage.includes("error") ? "bg-red/10 text-red" : "bg-green/10 text-green"}`}>
              {clockMessage}
            </div>
          )}
        </div>

        {/* ─── TODAY'S JOBS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <Calendar className="w-4 h-4 text-green" /> {t("jobs_title")}
          </h3>

          {todayJobs.length === 0 ? (
            <p className={`${TEXT_MUTED} text-sm py-4 text-center`}>{t("jobs_none")}</p>
          ) : (
            <div className="space-y-3">
              {todayJobs.map((j) => (
                <div key={j.id} className={`border ${INNER_BORDER} rounded-xl p-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-[0.85rem] flex items-center gap-1.5 ${TEXT_PRIMARY}`}>
                      <ServiceIcon emoji={j.booking.service.icon} className="w-4 h-4 text-green" /> {j.booking.service.name}
                    </span>
                    <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[j.booking.status] || "bg-gray-100 text-gray-500"}`}>
                      {fmtStatus(j.booking.status)}
                    </span>
                  </div>
                  <div className={`text-gray-500 dark:text-sand/60 text-[0.78rem] space-y-0.5`}>
                    <div className="capitalize">{j.booking.scheduledTime}</div>
                    <div>{t("jobs_client")}: {j.booking.customer.name}{j.booking.customer.phone && ` — ${j.booking.customer.phone}`}</div>
                    {j.booking.address && (
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400 dark:text-sand/50" />
                        {j.booking.address.street}{j.booking.address.unit && ` ${j.booking.address.unit}`}, {j.booking.address.city}, {j.booking.address.state} {j.booking.address.zipCode}
                      </div>
                    )}
                    {j.booking.customerNotes && (
                      <div className="mt-1.5 bg-ivory dark:bg-[#1a1410] rounded-lg px-3 py-2 text-[0.75rem]">
                        <span className="font-medium">{t("jobs_notes")}:</span> {j.booking.customerNotes}
                      </div>
                    )}
                  </div>
                  {j.booking.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${j.booking.address.street}, ${j.booking.address.city}, ${j.booking.address.state} ${j.booking.address.zipCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-teal text-[0.75rem] font-semibold hover:underline"
                    >
                      <MapPin className="w-3 h-3" /> {t("jobs_maps")}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── SCHEDULE CARD ─── */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-display text-lg ${TEXT_PRIMARY} flex items-center gap-2`}>
              <Calendar className="w-4 h-4 text-green" /> {t("schedule_title")}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekOffset((w) => w - 1)} className="text-teal text-[0.75rem] font-semibold px-2 py-1 rounded hover:bg-teal/10">&larr;</button>
              <span className={`${TEXT_MUTED} text-[0.72rem]`}>{formatWeekRange()}</span>
              <button onClick={() => setWeekOffset((w) => w + 1)} className="text-teal text-[0.75rem] font-semibold px-2 py-1 rounded hover:bg-teal/10">&rarr;</button>
            </div>
          </div>

          <div className="space-y-1.5">
            {weekDays.map((day) => {
              const dayJobs = getJobsForDay(day);
              const today = isToday(day);
              return (
                <div key={day.toISOString()} className={`rounded-lg border px-3 py-2 ${today ? "border-green bg-green/5" : `border-gray-50 dark:border-[#3a2f25]`}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[0.65rem] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full ${today ? "bg-green text-white" : "bg-gray-100 dark:bg-[#1a1410] text-gray-500 dark:text-sand/70"}`}>
                      {DAY_NAMES[day.getDay()]}
                    </span>
                    <span className={`${TEXT_MUTED} text-[0.72rem]`}>{day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    {today && <span className="text-green text-[0.65rem] font-medium">{t("schedule_today")}</span>}
                  </div>
                  {dayJobs.length === 0 ? (
                    <p className={`${TEXT_FAINT} text-[0.72rem]`}>{t("schedule_no_jobs")}</p>
                  ) : (
                    dayJobs.map((j) => (
                      <div key={j.id} className="flex items-center justify-between text-[0.78rem] py-0.5">
                        <span className={`font-medium flex items-center gap-1 ${TEXT_PRIMARY}`}>
                          <ServiceIcon emoji={j.booking.service.icon} className="w-3 h-3 text-green" /> {j.booking.service.name}
                        </span>
                        <span className={`${TEXT_MUTED} capitalize text-[0.72rem]`}>{j.booking.scheduledTime}</span>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>

          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="mt-2 w-full py-2 bg-green/10 text-green rounded-lg text-[0.78rem] font-semibold">
              {t("schedule_back")}
            </button>
          )}
        </div>

        {/* ─── HOURS & EARNINGS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <DollarSign className="w-4 h-4 text-green" /> {t("hours_title")}
          </h3>

          <div className="flex gap-2 mb-3">
            <button onClick={() => setHoursPeriod("week")} className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors ${hoursPeriod === "week" ? "bg-green text-white" : "bg-gray-100 dark:bg-[#1a1410] text-gray-500 dark:text-sand/70"}`}>
              {t("hours_week")}
            </button>
            <button onClick={() => setHoursPeriod("month")} className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors ${hoursPeriod === "month" ? "bg-green text-white" : "bg-gray-100 dark:bg-[#1a1410] text-gray-500 dark:text-sand/70"}`}>
              {t("hours_month")}
            </button>
          </div>

          {hoursSummary && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
                <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{hoursSummary.totalHours.toFixed(1)}</div>
                <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("hours_label")}</div>
              </div>
              <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
                <div className="text-xl font-bold text-green">${hoursSummary.estimatedEarnings.toFixed(0)}</div>
                <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("hours_earnings")}</div>
              </div>
              <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
                <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{hoursSummary.totalEntries}</div>
                <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("hours_shifts")}</div>
              </div>
              <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
                <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>${hoursSummary.hourlyRate.toFixed(2)}</div>
                <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("hours_rate")}</div>
              </div>
            </div>
          )}

          {Object.keys(groupedHours).length === 0 ? (
            <p className={`${TEXT_MUTED} text-sm text-center py-3`}>{t("hours_none")}</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(groupedHours).map(([date, dayEntries]) => {
                const dayTotal = dayEntries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
                return (
                  <div key={date}>
                    <div className="flex justify-between px-1 mb-1">
                      <span className={`text-[0.75rem] font-semibold ${TEXT_PRIMARY}`}>{date}</span>
                      <span className="text-[0.72rem] text-green font-medium">{dayTotal.toFixed(1)} hrs</span>
                    </div>
                    <div className={`border border-gray-50 dark:border-[#3a2f25] rounded-lg divide-y divide-gray-50 dark:divide-[#3a2f25]`}>
                      {dayEntries.map((entry) => (
                        <div key={entry.id} className={`px-3 py-2 flex items-center justify-between text-[0.78rem] ${TEXT_PRIMARY}`}>
                          <div>
                            {new Date(entry.clockIn).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            {" — "}
                            {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Active"}
                            {entry.booking && (
                              <span className={`${TEXT_MUTED} text-[0.68rem] ml-1`}>({entry.booking.service.name})</span>
                            )}
                          </div>
                          {entry.hoursWorked ? (
                            <span className="font-medium">{entry.hoursWorked.toFixed(1)}h</span>
                          ) : (
                            <span className="text-[0.65rem] bg-green/10 text-green px-1.5 py-0.5 rounded-full font-medium">Active</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── MY SUPPLIES CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <Package className="w-4 h-4 text-green" /> {t("supplies_title")}
          </h3>

          {supplies.length === 0 ? (
            <p className={`${TEXT_MUTED} text-sm text-center py-4`}>{t("supplies_none")}</p>
          ) : (
            <div className="space-y-2">
              {supplies.map((s) => {
                const remaining = s.quantity - s.returnedQty;
                return (
                  <div key={s.id} className={`flex items-center justify-between border ${INNER_BORDER} rounded-xl px-3 py-2.5`}>
                    <div>
                      <div className={`text-[0.82rem] font-medium ${TEXT_PRIMARY}`}>{s.inventoryItem.name}</div>
                      <div className={`${TEXT_MUTED} text-[0.72rem]`}>
                        {remaining} {s.inventoryItem.unit}
                        {s.booking && ` \u2022 ${s.booking.bookingNumber}`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleReturn(s.id)}
                      disabled={returningId === s.id}
                      className="px-3 py-1.5 text-[0.75rem] font-medium border border-green/30 text-green rounded-lg hover:bg-green/5 disabled:opacity-50"
                    >
                      {returningId === s.id ? "..." : t("supplies_return")}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── PAY STUBS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <DollarSign className="w-4 h-4 text-green" /> {t("pay_title")}
          </h3>

          {payStubs.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
                <div className="text-xl font-bold text-green">${totalEarned.toFixed(2)}</div>
                <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("pay_total")}</div>
              </div>
              <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
                <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{payStubs.length}</div>
                <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("pay_count")}</div>
              </div>
            </div>
          )}

          {payStubs.length === 0 ? (
            <p className={`${TEXT_MUTED} text-sm text-center py-4`}>{t("pay_none")}</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {payStubs.map((stub) => {
                const isExpanded = expandedStubId === stub.id;
                return (
                  <div key={stub.id} className={`border ${INNER_BORDER} rounded-xl overflow-hidden`}>
                    <button onClick={() => setExpandedStubId(isExpanded ? null : stub.id)} className={`w-full px-3 py-3 flex items-center justify-between text-left`}>
                      <div>
                        <div className={`text-[0.82rem] font-medium ${TEXT_PRIMARY}`}>{fmtDate(stub.periodStart)} — {fmtDate(stub.periodEnd)}</div>
                        <div className={`${TEXT_MUTED} text-[0.68rem] mt-0.5`}>
                          {t("pay_paid")} {fmtDate(stub.paidAt)}{stub.paidVia && ` via ${fmtStatus(stub.paidVia)}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-green">${stub.netPay.toFixed(2)}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className={`px-3 pb-3 border-t border-gray-50 dark:border-[#3a2f25] space-y-1.5 text-[0.78rem] pt-2`}>
                        <div className="flex justify-between"><span className={`text-gray-500 dark:text-sand/60`}>{t("pay_hours")}</span><span className={TEXT_PRIMARY}>{stub.totalHours.toFixed(1)}h</span></div>
                        <div className="flex justify-between"><span className={`text-gray-500 dark:text-sand/60`}>{t("pay_rate")}</span><span className={TEXT_PRIMARY}>${stub.hourlyRate.toFixed(2)}/hr</span></div>
                        <div className="flex justify-between"><span className={`text-gray-500 dark:text-sand/60`}>{t("pay_gross")}</span><span className={TEXT_PRIMARY}>${stub.grossPay.toFixed(2)}</span></div>
                        {stub.bonuses > 0 && <div className="flex justify-between"><span className={`text-gray-500 dark:text-sand/60`}>{t("pay_bonuses")}</span><span className="text-green">+${stub.bonuses.toFixed(2)}</span></div>}
                        {stub.tips > 0 && <div className="flex justify-between"><span className={`text-gray-500 dark:text-sand/60`}>{t("pay_tips")}</span><span className="text-green">+${stub.tips.toFixed(2)}</span></div>}
                        {stub.mileageReimbursement > 0 && <div className="flex justify-between"><span className={`text-gray-500 dark:text-sand/60`}>{t("pay_mileage")}</span><span className="text-green">+${stub.mileageReimbursement.toFixed(2)}</span></div>}
                        {stub.deductions > 0 && <div className="flex justify-between"><span className={`text-gray-500 dark:text-sand/60`}>{t("pay_deductions")}</span><span className="text-red">-${stub.deductions.toFixed(2)}</span></div>}
                        <div className={`flex justify-between pt-1.5 border-t ${INNER_BORDER} font-medium`}>
                          <span className={TEXT_PRIMARY}>{t("pay_net")}</span>
                          <span className="font-bold text-green">${stub.netPay.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ PROFILE & SETTINGS ═══ */}
      <div className={CARD}>
        <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
          <User className="w-4 h-4 text-green" /> {t("profile_title")}
        </h3>

        <div className="md:flex md:gap-6">
          {/* Avatar + info */}
          <div className="flex items-center gap-4 mb-4 md:mb-0 md:w-48 md:shrink-0">
            <div className="w-14 h-14 rounded-full bg-green/10 text-green flex items-center justify-center text-2xl font-bold">
              {profileName.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className={`font-medium ${TEXT_PRIMARY}`}>{profileName}</div>
              <div className={`${TEXT_MUTED} text-[0.78rem]`}>{session?.user?.email}</div>
            </div>
          </div>

          {/* Edit fields */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={`text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1`}>{t("profile_name")}</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={`text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1`}>{t("profile_phone")}</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className={`text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1`}>{t("profile_language")}</label>
                <select
                  value={profileLocale}
                  onChange={(e) => setProfileLocale(e.target.value)}
                  className={INPUT_CLS}
                >
                  <option value="en">English</option>
                  <option value="es">Espa&ntilde;ol</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="px-5 py-2 bg-green text-white rounded-lg text-sm font-semibold hover:bg-green/90 disabled:opacity-50"
              >
                {profileSaving ? t("profile_saving") : t("profile_save")}
              </button>
              {profileMessage && (
                <span className={`text-sm ${profileMessage === t("profile_failed") ? "text-red" : "text-green"}`}>{profileMessage}</span>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="ml-auto px-4 py-2 border border-red/30 text-red rounded-lg text-sm font-medium hover:bg-red/5"
              >
                {t("profile_signout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
