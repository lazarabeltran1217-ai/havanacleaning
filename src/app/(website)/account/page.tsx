"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Plus,
  ClipboardList,
  Sparkles,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";

/* ─── Dark mode card class helpers ─── */
const CARD =
  "bg-white dark:bg-[#231c16] rounded-2xl border border-gray-100 dark:border-[#3a2f25] shadow-sm p-5";
const TEXT_PRIMARY = "text-tobacco dark:text-cream";
const TEXT_MUTED = "text-gray-400 dark:text-sand/70";
const INNER_BORDER = "border-gray-100 dark:border-[#3a2f25]";

/* ─── Helpers ─── */
const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green/10 text-green",
  PENDING: "bg-amber-100 text-amber-600",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green/20 text-green",
  CANCELLED: "bg-red/10 text-red-500",
};

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/* ─── Types ─── */
interface UpcomingBooking {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  total: number;
  service: { name: string; icon: string | null };
  address: {
    street: string;
    unit: string | null;
    city: string;
    state: string;
    zipCode: string;
  } | null;
  payments: { status: string }[];
}

interface RecentBooking {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  total: number;
  status: string;
  service: { name: string; icon: string | null };
  address: { street: string; city: string } | null;
}

interface AddressData {
  id: string;
  label: string;
  street: string;
  unit: string | null;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface DashboardData {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    locale: string;
    createdAt: string;
  } | null;
  upcomingBookings: UpcomingBooking[];
  recentBookings: RecentBooking[];
  addresses: AddressData[];
  stats: { totalBookings: number; totalSpent: number };
}

/* ─── Main Dashboard ─── */
export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/account/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const firstName =
    data?.profile?.name?.split(" ")[0] ||
    session?.user?.name?.split(" ")[0] ||
    "there";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`${TEXT_MUTED} text-sm`}>Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`${TEXT_MUTED} text-sm`}>
          Failed to load dashboard. Please refresh.
        </div>
      </div>
    );
  }

  const upcomingCount = data.upcomingBookings.length;
  const addressCount = data.addresses.length;

  return (
    <div className="space-y-5">
      {/* ═══ WELCOME BANNER ═══ */}
      <div className="bg-gradient-to-r from-green-light to-green dark:from-green dark:to-[#1a3a2a] rounded-2xl p-6 text-white text-center">
        <h1 className="font-display text-2xl">
          {greeting}, {firstName}
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {upcomingCount > 0 && (
            <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {upcomingCount} upcoming
            </span>
          )}
          <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <ClipboardList className="w-3 h-3" /> {data.stats.totalBookings}{" "}
            total bookings
          </span>
          {addressCount > 0 && (
            <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {addressCount} addresses
            </span>
          )}
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ─── UPCOMING BOOKINGS CARD ─── */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`font-display text-lg ${TEXT_PRIMARY} flex items-center gap-2`}
            >
              <Calendar className="w-4 h-4 text-green" /> Upcoming Bookings
            </h3>
            <Link
              href="/account/bookings"
              className="text-green text-[0.75rem] font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          {data.upcomingBookings.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles
                className={`w-8 h-8 mx-auto mb-2 ${TEXT_MUTED}`}
              />
              <p className={`${TEXT_MUTED} text-sm`}>No upcoming bookings</p>
              <Link
                href="/book"
                className="text-green text-[0.82rem] font-medium hover:underline mt-1 inline-block"
              >
                Book a cleaning →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingBookings.map((b) => {
                const isPaid = b.payments.some(
                  (p) => p.status === "SUCCEEDED"
                );
                return (
                  <div
                    key={b.id}
                    className={`border ${INNER_BORDER} rounded-xl p-3`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-medium text-[0.85rem] flex items-center gap-1.5 ${TEXT_PRIMARY}`}
                      >
                        <ServiceIcon
                          emoji={b.service.icon}
                          className="w-4 h-4 text-green"
                        />{" "}
                        {b.service.name}
                      </span>
                      <span
                        className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-500"}`}
                      >
                        {fmtStatus(b.status)}
                      </span>
                    </div>
                    <div
                      className={`text-gray-500 dark:text-sand/60 text-[0.78rem] space-y-0.5`}
                    >
                      <div>
                        {fmtDate(b.scheduledDate)} &middot;{" "}
                        <span className="capitalize">{b.scheduledTime}</span>
                      </div>
                      {b.address && (
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400 dark:text-sand/50" />
                          {b.address.street}
                          {b.address.unit && ` ${b.address.unit}`},{" "}
                          {b.address.city}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-green font-semibold text-[0.88rem]">
                        {fmtCurrency(b.total)}
                      </span>
                      {b.status === "CONFIRMED" && !isPaid && (
                        <Link
                          href={`/account/bookings/${b.id}/pay`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green text-white rounded-lg text-[0.75rem] font-semibold hover:bg-green/90 transition-colors"
                        >
                          <CreditCard className="w-3 h-3" /> Pay Now
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── QUICK ACTIONS CARD ─── */}
        <div className={CARD}>
          <h3
            className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}
          >
            <Sparkles className="w-4 h-4 text-green" /> Quick Actions
          </h3>

          <div className="space-y-3">
            <Link
              href="/book"
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-gradient-to-r from-green to-green-light text-white rounded-xl font-semibold text-[0.88rem] hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span>Book a Cleaning</span>
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Link>

            <Link
              href="/account/addresses"
              className={`flex items-center gap-3 w-full px-4 py-3.5 border ${INNER_BORDER} rounded-xl font-medium text-[0.88rem] ${TEXT_PRIMARY} hover:bg-ivory dark:hover:bg-[#1a1410] transition-colors`}
            >
              <MapPin className="w-5 h-5 text-green" />
              <span>Manage Addresses</span>
              <ChevronRight className={`w-4 h-4 ml-auto ${TEXT_MUTED}`} />
            </Link>

            <Link
              href="/account/bookings"
              className={`flex items-center gap-3 w-full px-4 py-3.5 border ${INNER_BORDER} rounded-xl font-medium text-[0.88rem] ${TEXT_PRIMARY} hover:bg-ivory dark:hover:bg-[#1a1410] transition-colors`}
            >
              <ClipboardList className="w-5 h-5 text-green" />
              <span>View All Bookings</span>
              <ChevronRight className={`w-4 h-4 ml-auto ${TEXT_MUTED}`} />
            </Link>
          </div>

          {/* Stats summary */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-ivory/50 dark:bg-[#1a1410] rounded-lg p-3 text-center">
              <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>
                {data.stats.totalBookings}
              </div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>
                Total Bookings
              </div>
            </div>
            <div className="bg-ivory/50 dark:bg-[#1a1410] rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green">
                {fmtCurrency(data.stats.totalSpent)}
              </div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>Total Spent</div>
            </div>
          </div>
        </div>

        {/* ─── RECENT BOOKINGS CARD ─── */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`font-display text-lg ${TEXT_PRIMARY} flex items-center gap-2`}
            >
              <ClipboardList className="w-4 h-4 text-green" /> Recent Bookings
            </h3>
            <Link
              href="/account/bookings"
              className="text-green text-[0.75rem] font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          {data.recentBookings.length === 0 ? (
            <p className={`${TEXT_MUTED} text-sm text-center py-4`}>
              No completed bookings yet.
            </p>
          ) : (
            <div className="space-y-2">
              {data.recentBookings.map((b) => (
                <div
                  key={b.id}
                  className={`flex items-center justify-between border-b ${INNER_BORDER} pb-2.5 last:border-0 last:pb-0`}
                >
                  <div>
                    <div
                      className={`font-medium text-[0.85rem] flex items-center gap-1.5 ${TEXT_PRIMARY}`}
                    >
                      <ServiceIcon
                        emoji={b.service.icon}
                        className="w-3.5 h-3.5 text-green"
                      />{" "}
                      {b.service.name}
                    </div>
                    <div
                      className={`text-gray-500 dark:text-sand/60 text-[0.72rem] mt-0.5`}
                    >
                      {fmtDate(b.scheduledDate)}
                      {b.address && ` · ${b.address.street}, ${b.address.city}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green font-semibold text-[0.85rem]">
                      {fmtCurrency(b.total)}
                    </div>
                    <span className="text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-green/20 text-green">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── MY ADDRESSES CARD ─── */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-3">
            <h3
              className={`font-display text-lg ${TEXT_PRIMARY} flex items-center gap-2`}
            >
              <MapPin className="w-4 h-4 text-green" /> My Addresses
            </h3>
            <Link
              href="/account/addresses"
              className="text-green text-[0.75rem] font-semibold hover:underline"
            >
              Manage
            </Link>
          </div>

          {data.addresses.length === 0 ? (
            <div className="text-center py-4">
              <p className={`${TEXT_MUTED} text-sm`}>No saved addresses</p>
              <Link
                href="/account/addresses"
                className="text-green text-[0.82rem] font-medium hover:underline mt-1 inline-block"
              >
                Add an address →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data.addresses.slice(0, 3).map((addr) => (
                <div
                  key={addr.id}
                  className={`flex items-center gap-3 border ${INNER_BORDER} rounded-xl px-3 py-2.5`}
                >
                  <MapPin className="w-4 h-4 text-green shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium text-[0.82rem] ${TEXT_PRIMARY}`}
                      >
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[0.6rem] bg-green/10 text-green px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <div
                      className={`text-gray-500 dark:text-sand/60 text-[0.72rem] truncate`}
                    >
                      {addr.street}
                      {addr.unit && ` ${addr.unit}`}, {addr.city},{" "}
                      {addr.state} {addr.zipCode}
                    </div>
                  </div>
                </div>
              ))}
              {data.addresses.length > 3 && (
                <Link
                  href="/account/addresses"
                  className={`block text-center text-green text-[0.78rem] font-medium hover:underline pt-1`}
                >
                  +{data.addresses.length - 3} more
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
