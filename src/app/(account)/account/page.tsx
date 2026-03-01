"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Plus,
  ClipboardList,
  CreditCard,
  User,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";

/* ─── Dark mode card class helpers (same as employee portal) ─── */
const CARD = "bg-white dark:bg-[#231c16] rounded-2xl border border-gray-100 dark:border-[#3a2f25] shadow-sm p-5";
const INNER_BORDER = "border-gray-100 dark:border-[#3a2f25]";
const INNER_BG = "bg-ivory/50 dark:bg-[#1a1410]";
const TEXT_PRIMARY = "text-tobacco dark:text-cream";
const TEXT_MUTED = "text-gray-400 dark:text-sand/70";
const INPUT_CLS = "w-full px-3 py-2 border border-gray-200 dark:border-[#3a2f25] rounded-lg text-sm bg-white dark:bg-[#1a1410] dark:text-cream focus:outline-none focus:ring-2 focus:ring-green/30";

/* ─── Helpers ─── */
const statusColors: Record<string, string> = {
  CONFIRMED: "bg-green/10 text-green",
  PENDING: "bg-amber-100 text-amber-600",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-green/20 text-green",
  CANCELLED: "bg-red/10 text-red-500",
  NO_SHOW: "bg-gray-100 text-gray-500 dark:bg-[#1a1410] dark:text-sand/50",
};

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtStatus(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

/* ─── Types ─── */
interface BookingData {
  id: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  total: number;
  recurrence?: string;
  service: { name: string; icon: string | null };
  address: { street: string; unit: string | null; city: string; state: string; zipCode: string } | null;
  payments: { status: string }[];
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
  upcomingBookings: BookingData[];
  allBookings: BookingData[];
  addresses: AddressData[];
  stats: { totalBookings: number; totalSpent: number };
}

/* ─── Main Dashboard ─── */
export default function CustomerDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  // Bookings filter
  const [bookingsFilter, setBookingsFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [showAllBookings, setShowAllBookings] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrUnit, setAddrUnit] = useState("");
  const [addrCity, setAddrCity] = useState("Miami");
  const [addrZip, setAddrZip] = useState("");
  const [addrSaving, setAddrSaving] = useState(false);

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileLocale, setProfileLocale] = useState("en");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  /* ─── Fetch All Data ─── */
  useEffect(() => {
    fetch("/api/account/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) {
          setData(d);
          if (d.profile) {
            setProfileName(d.profile.name || "");
            setProfilePhone(d.profile.phone || "");
            setProfileLocale(d.profile.locale || "en");
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
    setProfileMessage(res.ok ? "Saved!" : "Failed to save.");
  };

  /* ─── Address Add ─── */
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrSaving(true);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: addrLabel, street: addrStreet, unit: addrUnit, city: addrCity, state: "FL", zipCode: addrZip }),
    });
    const result = await res.json();
    if (res.ok && data) {
      setData({ ...data, addresses: [result.address, ...data.addresses] });
      setShowAddressForm(false);
      setAddrStreet("");
      setAddrUnit("");
      setAddrZip("");
    }
    setAddrSaving(false);
  };

  /* ─── Derived ─── */
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const firstName = data?.profile?.name?.split(" ")[0] || session?.user?.name?.split(" ")[0] || "there";

  // Filtered bookings
  const filteredBookings = data?.allBookings.filter((b) => {
    if (bookingsFilter === "upcoming") return ["PENDING", "CONFIRMED"].includes(b.status);
    if (bookingsFilter === "completed") return b.status === "COMPLETED";
    if (bookingsFilter === "cancelled") return b.status === "CANCELLED";
    return true;
  }) || [];
  const displayedBookings = showAllBookings ? filteredBookings : filteredBookings.slice(0, 5);

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
        <div className={`${TEXT_MUTED} text-sm`}>Failed to load dashboard. Please refresh.</div>
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
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {data.upcomingBookings.length > 0 && (
            <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {data.upcomingBookings.length} upcoming
            </span>
          )}
          <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <ClipboardList className="w-3 h-3" /> {data.stats.totalBookings} total bookings
          </span>
          {data.addresses.length > 0 && (
            <span className="bg-white/15 backdrop-blur text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {data.addresses.length} addresses
            </span>
          )}
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ─── UPCOMING BOOKINGS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <Calendar className="w-4 h-4 text-green" /> Upcoming Bookings
          </h3>

          {data.upcomingBookings.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className={`w-8 h-8 mx-auto mb-2 ${TEXT_MUTED}`} />
              <p className={`${TEXT_MUTED} text-sm`}>No upcoming bookings</p>
              <Link href="/book" className="text-green text-[0.82rem] font-medium hover:underline mt-1 inline-block">
                Book a cleaning &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingBookings.map((b) => {
                const isPaid = b.payments.some((p) => p.status === "SUCCEEDED");
                return (
                  <div key={b.id} className={`border ${INNER_BORDER} rounded-xl p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-[0.85rem] flex items-center gap-1.5 ${TEXT_PRIMARY}`}>
                        <ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-green" /> {b.service.name}
                      </span>
                      <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-500"}`}>
                        {fmtStatus(b.status)}
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-sand/60 text-[0.78rem] space-y-0.5">
                      <div>{fmtDate(b.scheduledDate)} &middot; <span className="capitalize">{b.scheduledTime}</span></div>
                      {b.address && (
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400 dark:text-sand/50" />
                          {b.address.street}{b.address.unit && ` ${b.address.unit}`}, {b.address.city}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-green font-semibold text-[0.88rem]">{fmtCurrency(b.total)}</span>
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

        {/* ─── QUICK ACTIONS + STATS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <Sparkles className="w-4 h-4 text-green" /> Quick Actions
          </h3>

          <Link
            href="/book"
            className="flex items-center gap-3 w-full px-4 py-3.5 bg-gradient-to-r from-green to-green-light text-white rounded-xl font-semibold text-[0.88rem] hover:opacity-90 transition-opacity mb-3"
          >
            <Plus className="w-5 h-5" />
            <span>Book a Cleaning</span>
          </Link>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{data.stats.totalBookings}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>Total Bookings</div>
            </div>
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className="text-xl font-bold text-green">{fmtCurrency(data.stats.totalSpent)}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>Total Spent</div>
            </div>
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{data.upcomingBookings.length}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>Upcoming</div>
            </div>
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{data.addresses.length}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>Addresses</div>
            </div>
          </div>
        </div>

        {/* ─── ALL BOOKINGS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <ClipboardList className="w-4 h-4 text-green" /> My Bookings
          </h3>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setBookingsFilter(f); setShowAllBookings(false); }}
                className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors capitalize ${bookingsFilter === f ? "bg-green text-white" : "bg-gray-100 dark:bg-[#1a1410] text-gray-500 dark:text-sand/70"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <p className={`${TEXT_MUTED} text-sm text-center py-4`}>No bookings found.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {displayedBookings.map((b) => {
                const isPaid = b.payments.some((p) => p.status === "SUCCEEDED");
                return (
                  <div key={b.id} className={`border ${INNER_BORDER} rounded-xl p-3`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <ServiceIcon emoji={b.service.icon} className="w-3.5 h-3.5 text-green" />
                          <span className={`font-medium text-[0.82rem] ${TEXT_PRIMARY}`}>{b.service.name}</span>
                          <span className={`text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-500"}`}>
                            {fmtStatus(b.status)}
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-sand/60 text-[0.72rem] space-y-0.5">
                          <div>{fmtDate(b.scheduledDate)} &middot; <span className="capitalize">{b.scheduledTime}</span></div>
                          <div className={TEXT_MUTED}>#{b.bookingNumber}</div>
                          {b.address && (
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                              {b.address.street}, {b.address.city}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-green font-semibold text-[0.85rem]">{fmtCurrency(b.total)}</div>
                        {b.status === "CONFIRMED" && !isPaid && (
                          <Link
                            href={`/account/bookings/${b.id}/pay`}
                            className="inline-flex items-center gap-1 bg-green text-white px-3 py-1.5 text-[0.7rem] font-semibold rounded-lg hover:bg-green/90 transition-colors"
                          >
                            <CreditCard className="w-3 h-3" /> Pay
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredBookings.length > 5 && (
            <button
              onClick={() => setShowAllBookings(!showAllBookings)}
              className="mt-2 w-full py-2 bg-green/10 text-green rounded-lg text-[0.78rem] font-semibold flex items-center justify-center gap-1"
            >
              {showAllBookings ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> Show All ({filteredBookings.length})</>
              )}
            </button>
          )}
        </div>

        {/* ─── MY ADDRESSES CARD ─── */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-display text-lg ${TEXT_PRIMARY} flex items-center gap-2`}>
              <MapPin className="w-4 h-4 text-green" /> My Addresses
            </h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-green text-[0.75rem] font-semibold hover:underline"
            >
              {showAddressForm ? "Cancel" : "+ Add"}
            </button>
          </div>

          {/* Inline add form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className={`border ${INNER_BORDER} rounded-xl p-3 mb-3 space-y-2`}>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>Label</label>
                  <select value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} className={INPUT_CLS}>
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>Street</label>
                  <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} required className={INPUT_CLS} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>Unit</label>
                  <input type="text" value={addrUnit} onChange={(e) => setAddrUnit(e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="col-span-2">
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>City</label>
                  <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>ZIP</label>
                  <input type="text" value={addrZip} onChange={(e) => setAddrZip(e.target.value)} required className={INPUT_CLS} />
                </div>
              </div>
              <button type="submit" disabled={addrSaving} className="px-4 py-2 bg-green text-white rounded-lg text-[0.78rem] font-semibold hover:bg-green/90 disabled:opacity-50">
                {addrSaving ? "Saving..." : "Save Address"}
              </button>
            </form>
          )}

          {data.addresses.length === 0 && !showAddressForm ? (
            <div className="text-center py-4">
              <p className={`${TEXT_MUTED} text-sm`}>No saved addresses</p>
              <button onClick={() => setShowAddressForm(true)} className="text-green text-[0.82rem] font-medium hover:underline mt-1">
                Add an address &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.addresses.map((addr) => (
                <div key={addr.id} className={`flex items-center gap-3 border ${INNER_BORDER} rounded-xl px-3 py-2.5`}>
                  <MapPin className="w-4 h-4 text-green shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-[0.82rem] ${TEXT_PRIMARY}`}>{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[0.6rem] bg-green/10 text-green px-1.5 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                      )}
                    </div>
                    <div className="text-gray-500 dark:text-sand/60 text-[0.72rem] truncate">
                      {addr.street}{addr.unit && ` ${addr.unit}`}, {addr.city}, {addr.state} {addr.zipCode}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ PROFILE & SETTINGS ═══ */}
      <div className={CARD}>
        <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
          <User className="w-4 h-4 text-green" /> Profile & Settings
        </h3>

        <div className="md:flex md:gap-6">
          {/* Avatar + info */}
          <div className="flex items-center gap-4 mb-4 md:mb-0 md:w-48 md:shrink-0">
            <div className="w-14 h-14 rounded-full bg-green/10 text-green flex items-center justify-center text-2xl font-bold">
              {profileName.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <div className={`font-medium ${TEXT_PRIMARY}`}>{profileName}</div>
              <div className={`${TEXT_MUTED} text-[0.78rem]`}>{data.profile?.email}</div>
            </div>
          </div>

          {/* Edit fields */}
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1">Name</label>
                <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1">Phone</label>
                <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1">Language</label>
                <select value={profileLocale} onChange={(e) => setProfileLocale(e.target.value)} className={INPUT_CLS}>
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
                {profileSaving ? "Saving..." : "Save Changes"}
              </button>
              {profileMessage && (
                <span className={`text-sm ${profileMessage === "Failed to save." ? "text-red" : "text-green"}`}>{profileMessage}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
