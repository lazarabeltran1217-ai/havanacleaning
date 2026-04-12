"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
  X,
  CheckCircle,
  Wrench,
  Zap,
  MessageSquare,
  Pencil,
} from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { BookingPayment } from "@/components/website/BookingPayment";
import { HandymanPayment } from "@/components/website/HandymanPayment";
import { PortalBookingWizard } from "@/components/website/PortalBookingWizard";
import { PortalHandymanWizard } from "@/components/website/PortalHandymanWizard";

/* ─── Card class helpers (light / dark) ─── */
const CARD = "bg-white dark:bg-[#382618] rounded-2xl border border-gray-200 dark:border-gold/20 shadow-sm dark:shadow-none p-5";
const INNER_BORDER = "border-gray-200 dark:border-gold/15";
const INNER_BG = "bg-gray-50 dark:bg-[#2f1f14]";
const TEXT_PRIMARY = "text-tobacco dark:text-cream";
const TEXT_MUTED = "text-gray-500 dark:text-sand/70";
const INPUT_CLS = "w-full px-3 py-2 border border-gray-300 dark:border-gold/20 rounded-lg text-sm bg-white dark:bg-[#2f1f14] text-tobacco dark:text-cream placeholder:text-gray-400 dark:placeholder:text-sand/40 focus:outline-none focus:ring-2 focus:ring-gold/30";

/* ─── Helpers ─── */
const statusColors: Record<string, string> = {
  CONFIRMED: "bg-gold/10 text-gold",
  PENDING: "bg-amber/10 text-amber",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-gold/20 text-gold",
  CANCELLED: "bg-red-500/10 text-red-400",
  NO_SHOW: "bg-gray-100 dark:bg-white/[0.04] text-gray-400 dark:text-sand/50",
};

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

function fmtPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
  service: { name: string; nameEs?: string | null; icon: string | null };
  address: { street: string; unit: string | null; city: string; state: string; zipCode: string } | null;
  payments: { status: string }[];
  assignments: { employee: { name: string } }[];
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  customerCanEdit?: boolean;
  customerNotes?: string | null;
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

interface ServiceData {
  id: string;
  name: string;
  nameEs?: string | null;
  slug: string;
  icon: string | null;
  basePrice: number;
  pricePerBedroom: number;
  pricePerBathroom: number;
  estimatedHours: number;
  includedItems: number;
  extraItemPrice: number;
  items: { id: string; name: string; nameEs: string | null; icon: string | null }[];
}

interface AddOnData {
  id: string;
  name: string;
  nameEs?: string | null;
  price: number;
}

interface HandymanInquiryData {
  id: string;
  bookingNumber: string;
  serviceCategories: string[] | null;
  projectDescription: string;
  preferredDate: string | null;
  preferredTime: string | null;
  rush: boolean;
  status: string;
  address: string;
  quotedPrice: number | null;
  estimatedTotal: number | null;
  createdAt: string;
  payments: { status: string }[];
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  customerCanEdit?: boolean;
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
  stripeKey: string;
  services: ServiceData[];
  addOns: AddOnData[];
  handymanInquiries: HandymanInquiryData[];
  handymanPrices: { key: string; basePrice: number }[];
}

/* ─── Main Dashboard ─── */
const STATUS_KEY: Record<string, string> = {
  CONFIRMED: "status_confirmed",
  PENDING: "status_pending",
  IN_PROGRESS: "status_in_progress",
  COMPLETED: "status_completed",
  CANCELLED: "status_cancelled",
  NO_SHOW: "status_no_show",
};

const handymanStatusColors: Record<string, string> = {
  PENDING: "bg-amber/10 text-amber",
  CONFIRMED: "bg-gold/10 text-gold",
  IN_PROGRESS: "bg-teal/10 text-teal",
  COMPLETED: "bg-gold/20 text-gold",
  CANCELLED: "bg-red-500/10 text-red-400",
  NO_SHOW: "bg-gray-100 dark:bg-white/[0.04] text-gray-400 dark:text-sand/50",
};

const FILTER_KEY: Record<string, string> = {
  all: "filter_all",
  upcoming: "filter_upcoming",
  completed: "filter_completed",
  cancelled: "filter_cancelled",
};

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const t = useTranslations("account");
  const th = useTranslations("handyman");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  // Bookings filter
  const [bookingsFilter, setBookingsFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  const [showAllBookings, setShowAllBookings] = useState(false);

  // Payment modal
  const [payingBooking, setPayingBooking] = useState<BookingData | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Booking wizard
  const [showBookingWizard, setShowBookingWizard] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Handyman wizard
  const [showHandymanWizard, setShowHandymanWizard] = useState(false);
  const [handymanSuccess, setHandymanSuccess] = useState(false);

  // Handyman payment
  const [payingHandyman, setPayingHandyman] = useState<HandymanInquiryData | null>(null);

  // Editing booking
  const [editingBooking, setEditingBooking] = useState<BookingData | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editSaving, setEditSaving] = useState(false);

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
  const fetchDashboard = useCallback(() => {
    return fetch("/api/account/dashboard")
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

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  /* ─── Handle 3DS redirect back ─── */
  useEffect(() => {
    const redirectStatus = searchParams.get("redirect_status");
    const paymentIntent = searchParams.get("payment_intent");
    if (redirectStatus === "succeeded" && paymentIntent) {
      fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: paymentIntent }),
      })
        .then(() => {
          setPaymentSuccess(true);
          fetchDashboard();
          // Clean URL
          window.history.replaceState({}, "", "/account");
        })
        .catch(() => {});
    }
  }, [searchParams, fetchDashboard]);

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
    setProfileMessage(res.ok ? "saved" : "failed");
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

  /* ─── Edit Booking (customer) ─── */
  const startEditBooking = (b: BookingData) => {
    setEditingBooking(b);
    setEditDate(b.scheduledDate.slice(0, 10));
    setEditTime(b.scheduledTime || "morning");
    setEditNotes((b as BookingData & { customerNotes?: string }).customerNotes || "");
  };

  const handleEditBooking = async () => {
    if (!editingBooking) return;
    setEditSaving(true);
    const res = await fetch(`/api/bookings/${editingBooking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerEdit: true,
        scheduledDate: editDate,
        scheduledTime: editTime,
        customerNotes: editNotes || undefined,
      }),
    });
    setEditSaving(false);
    if (res.ok) {
      setEditingBooking(null);
      fetchDashboard();
    }
  };

  /* ─── Derived ─── */
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const greeting = now.getHours() < 12 ? t("greeting_morning") : now.getHours() < 17 ? t("greeting_afternoon") : t("greeting_evening");
  const firstName = data?.profile?.name?.split(" ")[0] || session?.user?.name?.split(" ")[0] || "there";

  // Locale-aware helpers
  const locale = data?.profile?.locale || "en";
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const capitalize = (s: string) => s.replace(/(^|\s)[a-záéíóúñü]/gi, (c) => c.toUpperCase());
  const fmtDate = (dateStr: string) => capitalize(new Date(dateStr).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" }));
  const fmtStatus = (status: string) => t(STATUS_KEY[status] || "status_pending");
  const loc = (en: string, es?: string | null) => (locale === "es" && es ? es : en);
  const TIME_KEY: Record<string, string> = { morning: "time_morning", midday: "time_midday", afternoon: "time_afternoon" };
  const fmtTime = (slot: string) => t(TIME_KEY[slot] || TIME_KEY.morning);
  const ADDR_LABEL_KEY: Record<string, string> = { Home: "addr_Home", Work: "addr_Work", Other: "addr_Other" };
  const fmtAddrLabel = (label: string) => t(ADDR_LABEL_KEY[label] || label);

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
        <div className={`${TEXT_MUTED} text-sm`}>{t("loading")}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={`${TEXT_MUTED} text-sm`}>{t("loadFailed")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ═══ WELCOME BANNER ═══ */}
      <div className="bg-gradient-to-r from-green to-green-light rounded-2xl p-6 text-white text-center">
        <h1 className="font-display text-2xl">
          {greeting}, {firstName}
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {capitalize(now.toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric" }))}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {data.upcomingBookings.length > 0 && (
            <span className="bg-white/20 text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {t("badge_upcoming", { count: data.upcomingBookings.length })}
            </span>
          )}
          <span className="bg-white/20 text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <ClipboardList className="w-3 h-3" /> {t("badge_totalBookings", { count: data.stats.totalBookings })}
          </span>
          {data.addresses.length > 0 && (
            <span className="bg-white/20 text-[0.72rem] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {t("badge_addresses", { count: data.addresses.length })}
            </span>
          )}
        </div>
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ─── UPCOMING BOOKINGS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <Calendar className="w-4 h-4 text-gold" /> {t("upcomingBookings")}
          </h3>

          {(() => {
            const scheduledHandyman = (data.handymanInquiries || []).filter(
              (inq) => inq.status === "CONFIRMED" && (inq.quotedPrice || inq.estimatedTotal) && !inq.payments.some((p) => p.status === "SUCCEEDED")
            );
            const hasUpcoming = data.upcomingBookings.length > 0 || scheduledHandyman.length > 0;

            if (!hasUpcoming) {
              return (
                <div className="text-center py-6">
                  <Sparkles className={`w-8 h-8 mx-auto mb-2 ${TEXT_MUTED}`} />
                  <p className={`${TEXT_MUTED} text-sm`}>{t("noUpcoming")}</p>
                  <button onClick={() => setShowBookingWizard(true)} className="text-gold text-[0.82rem] font-medium hover:underline mt-1 inline-block">
                    {t("bookCleaning")} &rarr;
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {/* Cleaning bookings */}
                {data.upcomingBookings.map((b) => {
                  const isPaid = b.payments.some((p) => p.status === "SUCCEEDED");
                  return (
                    <div key={b.id} className={`border ${INNER_BORDER} rounded-xl p-3`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-[0.85rem] flex items-center gap-1.5 ${TEXT_PRIMARY}`}>
                          <ServiceIcon emoji={b.service.icon} className="w-4 h-4 text-gold" /> {loc(b.service.name, b.service.nameEs)}
                        </span>
                        <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-500"}`}>
                          {fmtStatus(b.status)}
                        </span>
                      </div>
                      <div className="text-gray-500 dark:text-sand/60 text-[0.78rem] space-y-0.5">
                        <div>{fmtDate(b.scheduledDate)} &middot; <span className="capitalize">{fmtTime(b.scheduledTime)}</span></div>
                        {b.address && (
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400 dark:text-sand/50" />
                            {b.address.street}{b.address.unit && ` ${b.address.unit}`}, {b.address.city}
                          </div>
                        )}
                        {b.assignments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 shrink-0 text-gray-400 dark:text-sand/50" />
                            {b.assignments.map((a) => a.employee.name).join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-amber font-semibold text-[0.88rem]">{fmtCurrency(b.total)}</span>
                        {b.status === "CONFIRMED" && !isPaid && (
                          <button
                            onClick={() => setPayingBooking(b)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green text-white rounded-lg text-[0.75rem] font-semibold hover:bg-green-light transition-colors"
                          >
                            <CreditCard className="w-3 h-3" /> {t("payNow")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Confirmed handyman inquiries */}
                {scheduledHandyman.map((inq) => (
                  <div key={inq.id} className={`border ${INNER_BORDER} rounded-xl p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-[0.85rem] flex items-center gap-1.5 ${TEXT_PRIMARY}`}>
                        <Wrench className="w-4 h-4 text-gold" /> {t("handymanService")}
                      </span>
                      <span className="text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-green/10 text-green">
                        {t("status_confirmed")}
                      </span>
                    </div>
                    <div className="text-gray-500 dark:text-sand/60 text-[0.78rem] space-y-0.5">
                      {inq.preferredDate && (
                        <div>{fmtDate(inq.preferredDate)} {inq.preferredTime && <>&middot; <span className="capitalize">{inq.preferredTime}</span></>}</div>
                      )}
                      {inq.address && (
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-gray-400 dark:text-sand/50" />
                          {inq.address}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-amber font-semibold text-[0.88rem]">{fmtCurrency((inq.quotedPrice ?? inq.estimatedTotal)!)}</span>
                      <button
                        onClick={() => setPayingHandyman(inq)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green text-white rounded-lg text-[0.75rem] font-semibold hover:bg-green-light transition-colors"
                      >
                        <CreditCard className="w-3 h-3" /> {t("payNow")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ─── QUICK ACTIONS + STATS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <Sparkles className="w-4 h-4 text-gold" /> {t("quickActions")}
          </h3>

          <button
            onClick={() => setShowBookingWizard(true)}
            className="flex items-center gap-3 w-full px-4 py-3.5 bg-green text-white rounded-[3px] font-semibold text-[0.88rem] tracking-[0.06em] uppercase hover:bg-green-light transition-colors mb-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t("bookACleaning")}</span>
          </button>

          <button
            onClick={() => setShowHandymanWizard(true)}
            className="flex items-center gap-3 w-full px-4 py-3.5 bg-green text-white rounded-[3px] font-semibold text-[0.88rem] tracking-[0.06em] uppercase hover:bg-green-light transition-colors mb-3"
          >
            <Wrench className="w-5 h-5" />
            <span>{t("bookAHandyman")}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{data.stats.totalBookings}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("totalBookings")}</div>
            </div>
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className="text-xl font-bold text-amber">{fmtCurrency(data.stats.totalSpent)}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("totalSpent")}</div>
            </div>
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{data.upcomingBookings.length}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("upcoming")}</div>
            </div>
            <div className={`${INNER_BG} rounded-lg p-3 text-center`}>
              <div className={`text-xl font-bold ${TEXT_PRIMARY}`}>{data.addresses.length}</div>
              <div className={`${TEXT_MUTED} text-[0.68rem]`}>{t("addresses")}</div>
            </div>
          </div>
        </div>

        {/* ─── ALL BOOKINGS CARD ─── */}
        <div className={CARD}>
          <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-3 flex items-center gap-2`}>
            <ClipboardList className="w-4 h-4 text-gold" /> {t("myBookings")}
          </h3>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {(["all", "upcoming", "completed", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setBookingsFilter(f); setShowAllBookings(false); }}
                className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-colors ${bookingsFilter === f ? "bg-green text-white" : "bg-gray-100 dark:bg-white/[0.04] text-gray-500 dark:text-sand/70"}`}
              >
                {t(FILTER_KEY[f])}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <p className={`${TEXT_MUTED} text-sm text-center py-4`}>{t("noBookings")}</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {displayedBookings.map((b) => {
                const isPaid = b.payments.some((p) => p.status === "SUCCEEDED");
                return (
                  <div key={b.id} className={`border ${INNER_BORDER} rounded-xl p-3`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <ServiceIcon emoji={b.service.icon} className="w-3.5 h-3.5 text-gold" />
                          <span className={`font-medium text-[0.82rem] ${TEXT_PRIMARY}`}>{loc(b.service.name, b.service.nameEs)}</span>
                          <span className={`text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${statusColors[b.status] || "bg-gray-100 text-gray-500"}`}>
                            {fmtStatus(b.status)}
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-sand/60 text-[0.72rem] space-y-0.5">
                          <div>{fmtDate(b.scheduledDate)} &middot; <span className="capitalize">{fmtTime(b.scheduledTime)}</span></div>
                          <div className={TEXT_MUTED}>#{b.bookingNumber}</div>
                          {b.address && (
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                              {b.address.street}, {b.address.city}
                            </div>
                          )}
                          {b.assignments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 shrink-0" />
                              {b.assignments.map((a) => a.employee.name).join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-amber font-semibold text-[0.85rem]">{fmtCurrency(b.total)}</div>
                        {b.status === "CONFIRMED" && !isPaid && (
                          <button
                            onClick={() => setPayingBooking(b)}
                            className="inline-flex items-center gap-1 bg-green text-white px-3 py-1.5 text-[0.7rem] font-semibold rounded-lg hover:bg-green-light transition-colors"
                          >
                            <CreditCard className="w-3 h-3" /> {t("pay")}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Admin reply */}
                    {b.adminReply && (
                      <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-1 text-[0.68rem] text-blue-500 dark:text-blue-400 font-medium mb-0.5">
                          <MessageSquare className="w-3 h-3" />
                          {t("adminReply")} {b.adminRepliedAt && `— ${new Date(b.adminRepliedAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}`}
                        </div>
                        <div className={`text-[0.78rem] ${TEXT_PRIMARY}`}>{b.adminReply}</div>
                      </div>
                    )}
                    {/* Edit button */}
                    {b.customerCanEdit && (
                      <button
                        onClick={() => startEditBooking(b)}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[0.78rem] font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> {t("editBooking")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredBookings.length > 5 && (
            <button
              onClick={() => setShowAllBookings(!showAllBookings)}
              className="mt-2 w-full py-2 bg-gold/10 text-gold rounded-lg text-[0.78rem] font-semibold flex items-center justify-center gap-1"
            >
              {showAllBookings ? (
                <><ChevronUp className="w-3.5 h-3.5" /> {t("showLess")}</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> {t("showAll", { count: filteredBookings.length })}</>
              )}
            </button>
          )}
        </div>

        {/* ─── MY ADDRESSES CARD ─── */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-display text-lg ${TEXT_PRIMARY} flex items-center gap-2`}>
              <MapPin className="w-4 h-4 text-gold" /> {t("myAddresses")}
            </h3>
            <button
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="text-gold text-[0.75rem] font-semibold hover:underline"
            >
              {showAddressForm ? t("cancel") : t("addNew")}
            </button>
          </div>

          {/* Inline add form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className={`border ${INNER_BORDER} rounded-xl p-3 mb-3 space-y-2`}>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("label")}</label>
                  <select value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} className={INPUT_CLS}>
                    <option value="Home">{t("labelHome")}</option>
                    <option value="Work">{t("labelWork")}</option>
                    <option value="Other">{t("labelOther")}</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("street")}</label>
                  <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} required className={INPUT_CLS} />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("unit")}</label>
                  <input type="text" value={addrUnit} onChange={(e) => setAddrUnit(e.target.value)} className={INPUT_CLS} />
                </div>
                <div className="col-span-2">
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("city")}</label>
                  <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("zip")}</label>
                  <input type="text" value={addrZip} onChange={(e) => setAddrZip(e.target.value)} required className={INPUT_CLS} />
                </div>
              </div>
              <button type="submit" disabled={addrSaving} className="px-4 py-2 bg-green text-white rounded-[3px] text-[0.78rem] font-semibold hover:bg-green-light disabled:opacity-50">
                {addrSaving ? t("saving") : t("saveAddress")}
              </button>
            </form>
          )}

          {data.addresses.length === 0 && !showAddressForm ? (
            <div className="text-center py-4">
              <p className={`${TEXT_MUTED} text-sm`}>{t("noAddresses")}</p>
              <button onClick={() => setShowAddressForm(true)} className="text-gold text-[0.82rem] font-medium hover:underline mt-1">
                {t("addAddress")} &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.addresses.map((addr) => (
                <div key={addr.id} className={`flex items-center gap-3 border ${INNER_BORDER} rounded-xl px-3 py-2.5`}>
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-[0.82rem] ${TEXT_PRIMARY}`}>{fmtAddrLabel(addr.label)}</span>
                      {addr.isDefault && (
                        <span className="text-[0.6rem] bg-gold/10 text-gold px-1.5 py-0.5 rounded-full uppercase tracking-wider">{t("default")}</span>
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

        {/* ─── MY HANDYMAN REQUESTS CARD ─── */}
        <div className={`${CARD} md:col-span-2`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-display text-lg ${TEXT_PRIMARY} flex items-center gap-2`}>
              <Wrench className="w-4 h-4 text-gold" /> {t("myHandymanRequests")}
            </h3>
            <button onClick={() => setShowHandymanWizard(true)} className="text-gold text-[0.75rem] font-semibold hover:underline">
              + {t("bookAHandyman")}
            </button>
          </div>

          {(!data.handymanInquiries || data.handymanInquiries.length === 0) ? (
            <div className="text-center py-6">
              <Wrench className={`w-8 h-8 mx-auto mb-2 ${TEXT_MUTED}`} />
              <p className={`${TEXT_MUTED} text-sm`}>{t("noHandymanRequests")}</p>
              <button onClick={() => setShowHandymanWizard(true)} className="text-gold text-[0.82rem] font-medium hover:underline mt-1 inline-block">
                {t("bookHandymanPrompt")} &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {data.handymanInquiries.map((inq) => (
                <div key={inq.id} className={`border ${INNER_BORDER} rounded-xl p-3`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[0.75rem] tracking-wide font-medium ${TEXT_PRIMARY}`}>{inq.bookingNumber}</span>
                        <span className={`text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${handymanStatusColors[inq.status] || statusColors[inq.status] || "bg-gray-100 text-gray-500"}`}>
                          {fmtStatus(inq.status)}
                        </span>
                        {inq.rush && (
                          <span className="text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium bg-amber/15 text-amber flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> {t("rushLabel")}
                          </span>
                        )}
                      </div>
                      {/* Service category tags */}
                      {inq.serviceCategories && Array.isArray(inq.serviceCategories) && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {(inq.serviceCategories as string[]).map((cat) => (
                            <span key={cat} className={`text-[0.68rem] ${INNER_BG} border ${INNER_BORDER} px-2 py-0.5 rounded-full ${TEXT_MUTED}`}>
                              {th(cat)}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-gray-500 dark:text-sand/60 text-[0.72rem] space-y-0.5">
                        {inq.preferredDate && (
                          <div>{fmtDate(inq.preferredDate)} {inq.preferredTime && <>&middot; <span className="capitalize">{inq.preferredTime}</span></>}</div>
                        )}
                        {inq.address && (
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="truncate">{inq.address}</span>
                          </div>
                        )}
                        {inq.projectDescription && (
                          <p className="truncate">{inq.projectDescription}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-2 shrink-0">
                      {(inq.quotedPrice ?? inq.estimatedTotal) ? (
                        <div className="text-amber font-semibold text-[0.82rem]">{fmtCurrency((inq.quotedPrice ?? inq.estimatedTotal)!)}</div>
                      ) : null}
                      <div className={`${TEXT_MUTED} text-[0.68rem] whitespace-nowrap`}>
                        {fmtDate(inq.createdAt)}
                      </div>
                    </div>
                  </div>
                  {/* Admin reply */}
                  {inq.adminReply && (
                    <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1 text-[0.68rem] text-blue-500 dark:text-blue-400 font-medium mb-0.5">
                        <MessageSquare className="w-3 h-3" />
                        {t("adminReply")} {inq.adminRepliedAt && `— ${new Date(inq.adminRepliedAt).toLocaleDateString(dateLocale, { month: "short", day: "numeric" })}`}
                      </div>
                      <div className={`text-[0.78rem] ${TEXT_PRIMARY}`}>{inq.adminReply}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ PROFILE & SETTINGS ═══ */}
      <div className={CARD}>
        <h3 className={`font-display text-lg ${TEXT_PRIMARY} mb-4 flex items-center gap-2`}>
          <User className="w-4 h-4 text-gold" /> {t("profileSettings")}
        </h3>

        <div className="md:flex md:gap-6">
          {/* Avatar + info */}
          <div className="flex items-center gap-4 mb-4 md:mb-0 md:w-48 md:shrink-0">
            <div className="w-14 h-14 rounded-full bg-gold/10 text-gold flex items-center justify-center text-2xl font-bold">
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
                <label className="text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1">{t("name")}</label>
                <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className="text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1">{t("phone")}</label>
                <input type="tel" value={fmtPhone(profilePhone)} onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className={INPUT_CLS} />
              </div>
              <div>
                <label className="text-[0.72rem] font-medium text-gray-500 dark:text-sand/60 block mb-1">{t("language")}</label>
                <select value={profileLocale} onChange={(e) => setProfileLocale(e.target.value)} className={INPUT_CLS}>
                  <option value="en">{t("english")}</option>
                  <option value="es">{t("espanol")}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="px-5 py-2 bg-green text-white rounded-[3px] text-sm font-semibold hover:bg-green-light disabled:opacity-50"
              >
                {profileSaving ? t("saving") : t("saveChanges")}
              </button>
              {profileMessage && (
                <span className={`text-sm ${profileMessage === "failed" ? "text-red" : "text-gold"}`}>{profileMessage === "saved" ? t("saved") : t("failedSave")}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PAYMENT MODAL ═══ */}
      {payingBooking && data.stripeKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayingBooking(null)} />
          {/* Modal */}
          <div className="relative bg-white dark:bg-[#382618] rounded-2xl border border-gray-200 dark:border-gold/15 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between p-5 border-b ${INNER_BORDER}`}>
              <h3 className={`font-display text-lg ${TEXT_PRIMARY}`}>{t("completePayment")}</h3>
              <button onClick={() => setPayingBooking(null)} className={`${TEXT_MUTED} hover:text-tobacco dark:hover:text-cream`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {/* Booking summary */}
              <div className={`${INNER_BG} rounded-xl p-4 mb-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <ServiceIcon emoji={payingBooking.service.icon} className="w-5 h-5 text-gold" />
                  <span className={`font-display text-[1rem] ${TEXT_PRIMARY}`}>{loc(payingBooking.service.name, payingBooking.service.nameEs)}</span>
                </div>
                <div className="text-gray-500 dark:text-sand/60 text-[0.82rem] space-y-1">
                  <div>{fmtDate(payingBooking.scheduledDate)} &middot; <span className="capitalize">{fmtTime(payingBooking.scheduledTime)}</span></div>
                  {payingBooking.address && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      {payingBooking.address.street}{payingBooking.address.unit && ` ${payingBooking.address.unit}`}, {payingBooking.address.city}, {payingBooking.address.state} {payingBooking.address.zipCode}
                    </div>
                  )}
                </div>
                <div className={`mt-3 pt-3 border-t ${INNER_BORDER} flex justify-between font-semibold`}>
                  <span className={TEXT_PRIMARY}>{t("total")}</span>
                  <span className="text-amber text-lg">{fmtCurrency(payingBooking.total)}</span>
                </div>
              </div>
              {/* Stripe payment form */}
              <BookingPayment
                bookingId={payingBooking.id}
                amount={payingBooking.total}
                stripeKey={data.stripeKey}
                returnUrl="/account"
                onSuccess={() => {
                  setPayingBooking(null);
                  setPaymentSuccess(true);
                  fetchDashboard();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ HANDYMAN PAYMENT MODAL ═══ */}
      {payingHandyman && data.stripeKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayingHandyman(null)} />
          <div className="relative bg-white dark:bg-[#382618] rounded-2xl border border-gray-200 dark:border-gold/15 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between p-5 border-b ${INNER_BORDER}`}>
              <h3 className={`font-display text-lg ${TEXT_PRIMARY}`}>{t("completePayment")}</h3>
              <button onClick={() => setPayingHandyman(null)} className={`${TEXT_MUTED} hover:text-tobacco dark:hover:text-cream`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className={`${INNER_BG} rounded-xl p-4 mb-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-5 h-5 text-gold" />
                  <span className={`font-display text-[1rem] ${TEXT_PRIMARY}`}>{t("handymanService")}</span>
                </div>
                <div className="text-gray-500 dark:text-sand/60 text-[0.82rem] space-y-1">
                  {payingHandyman.preferredDate && (
                    <div>{fmtDate(payingHandyman.preferredDate)} {payingHandyman.preferredTime && <>&middot; <span className="capitalize">{payingHandyman.preferredTime}</span></>}</div>
                  )}
                  {payingHandyman.address && (
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      {payingHandyman.address}
                    </div>
                  )}
                </div>
                <div className={`mt-3 pt-3 border-t ${INNER_BORDER} flex justify-between font-semibold`}>
                  <span className={TEXT_PRIMARY}>{t("total")}</span>
                  <span className="text-amber text-lg">{fmtCurrency((payingHandyman.quotedPrice ?? payingHandyman.estimatedTotal)!)}</span>
                </div>
              </div>
              <HandymanPayment
                inquiryId={payingHandyman.id}
                amount={(payingHandyman.quotedPrice ?? payingHandyman.estimatedTotal)!}
                stripeKey={data.stripeKey}
                returnUrl="/account"
                onSuccess={() => {
                  setPayingHandyman(null);
                  setPaymentSuccess(true);
                  fetchDashboard();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT BOOKING MODAL ═══ */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingBooking(null)} />
          <div className="relative bg-white dark:bg-[#382618] rounded-2xl border border-gray-200 dark:border-gold/15 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className={`flex items-center justify-between p-5 border-b ${INNER_BORDER}`}>
              <h3 className={`font-display text-lg ${TEXT_PRIMARY}`}>{t("editBooking")}</h3>
              <button onClick={() => setEditingBooking(null)} className={`${TEXT_MUTED} hover:text-tobacco dark:hover:text-cream`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {editingBooking.adminReply && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1 text-[0.68rem] text-blue-500 dark:text-blue-400 font-medium mb-0.5">
                    <MessageSquare className="w-3 h-3" /> {t("adminReply")}
                  </div>
                  <div className={`text-[0.78rem] ${TEXT_PRIMARY}`}>{editingBooking.adminReply}</div>
                </div>
              )}
              <div>
                <label className={`text-[0.72rem] font-medium ${TEXT_MUTED} block mb-1`}>{t("editDate")}</label>
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className={INPUT_CLS} />
              </div>
              <div>
                <label className={`text-[0.72rem] font-medium ${TEXT_MUTED} block mb-1`}>{t("editTime")}</label>
                <select value={editTime} onChange={(e) => setEditTime(e.target.value)} className={INPUT_CLS}>
                  <option value="morning">{fmtTime("morning")}</option>
                  <option value="midday">{fmtTime("midday")}</option>
                  <option value="afternoon">{fmtTime("afternoon")}</option>
                </select>
              </div>
              <div>
                <label className={`text-[0.72rem] font-medium ${TEXT_MUTED} block mb-1`}>{t("editNotes")}</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder={t("editNotesPlaceholder")}
                  className={`${INPUT_CLS} resize-none`}
                />
              </div>
              <p className={`${TEXT_MUTED} text-[0.72rem]`}>{t("editDisclaimer")}</p>
              <button
                onClick={handleEditBooking}
                disabled={editSaving}
                className="w-full py-2.5 bg-green text-white rounded-[3px] text-sm font-semibold hover:bg-green-light disabled:opacity-50 transition-colors"
              >
                {editSaving ? t("saving") : t("submitEdit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BOOKING WIZARD MODAL ═══ */}
      {showBookingWizard && data.services.length > 0 && (
        <PortalBookingWizard
          services={data.services}
          addOns={data.addOns}
          addresses={data.addresses}
          locale={locale}
          onClose={() => setShowBookingWizard(false)}
          onSuccess={() => {
            setShowBookingWizard(false);
            setBookingSuccess(true);
            fetchDashboard();
          }}
        />
      )}

      {/* ═══ HANDYMAN WIZARD MODAL ═══ */}
      {showHandymanWizard && (
        <PortalHandymanWizard
          handymanPrices={data.handymanPrices}
          onClose={() => setShowHandymanWizard(false)}
          onSuccess={() => {
            setShowHandymanWizard(false);
            setHandymanSuccess(true);
            fetchDashboard();
          }}
        />
      )}

      {/* ═══ SUCCESS TOASTS ═══ */}
      {paymentSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green text-white px-6 py-3 rounded-[3px] shadow-lg flex items-center gap-2 text-[0.88rem] font-medium">
          <CheckCircle className="w-5 h-5" /> {t("paymentSuccess")}
          <button onClick={() => setPaymentSuccess(false)} className="ml-2 text-tobacco/70 hover:text-tobacco">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {bookingSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green text-white px-6 py-3 rounded-[3px] shadow-lg flex items-center gap-2 text-[0.88rem] font-medium">
          <CheckCircle className="w-5 h-5" /> {t("bookingSuccess")}
          <button onClick={() => setBookingSuccess(false)} className="ml-2 text-tobacco/70 hover:text-tobacco">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {handymanSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green text-white px-6 py-3 rounded-[3px] shadow-lg flex items-center gap-2 text-[0.88rem] font-medium">
          <CheckCircle className="w-5 h-5" /> {t("handymanBookingSuccess")}
          <button onClick={() => setHandymanSuccess(false)} className="ml-2 text-tobacco/70 hover:text-tobacco">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
