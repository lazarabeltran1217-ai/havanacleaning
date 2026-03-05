"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { HANDYMAN_SERVICES, NYC_BOROUGHS } from "@/lib/handyman-constants";
import { calculateHandymanTotal, HANDYMAN_RUSH_FEE, type HandymanPriceEntry } from "@/lib/handyman-pricing";
import {
  Wrench, Package, Tv, DoorOpen, Lightbulb, Grid3x3,
  Paintbrush, Droplets, Waves, Wifi, Fence, LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Wrench, Package, Tv, DoorOpen, Lightbulb, Grid3x3,
  Paintbrush, Droplets, Waves, Wifi, Fence, LayoutGrid,
};

export function HandymanBookingWizard({ handymanPrices }: { handymanPrices: HandymanPriceEntry[] }) {
  const router = useRouter();
  const t = useTranslations("handymanBooking");
  const th = useTranslations("handyman");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Service selection
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);

  // Step 2 — Schedule & details
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("morning");
  const [rush, setRush] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");

  // Step 3 — Contact + Address
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("New York");
  const [borough, setBorough] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Anti-bot
  const [jsToken, setJsToken] = useState("");
  useEffect(() => {
    setJsToken(btoa(String(Date.now())));
  }, []);

  function toggleService(key: string) {
    setServiceCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  // Pricing
  const pricing = calculateHandymanTotal(handymanPrices, serviceCategories, rush);
  const getPrice = (key: string) => handymanPrices.find((p) => p.key === key)?.basePrice ?? 0;

  // Date minimum: today if rush, otherwise tomorrow (Eastern Time)
  const etNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const etMinDay = new Date(
    etNow.getFullYear(),
    etNow.getMonth(),
    etNow.getDate() + (rush ? 0 : 1)
  );
  const minDate = `${etMinDay.getFullYear()}-${String(etMinDay.getMonth() + 1).padStart(2, "0")}-${String(etMinDay.getDate()).padStart(2, "0")}`;

  const timeSlots = [
    { label: t("timeMorning"), value: "morning" },
    { label: t("timeAfternoon"), value: "afternoon" },
    { label: t("timeEvening"), value: "evening" },
  ];

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/handyman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: customerName.trim(),
          email: customerEmail.trim().toLowerCase(),
          phone: customerPhone.trim(),
          borough,
          address: [street, unit].filter(Boolean).join(", ") + `, ${city}, NY ${zipCode}`,
          serviceCategories,
          projectDescription,
          preferredDate: scheduledDate || null,
          preferredTime: scheduledTime || null,
          rush,
          estimatedTotal: pricing.total,
          jsToken,
          customerPassword: customerPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("failedCreate"));
        setLoading(false);
        return;
      }

      router.push("/handyman/success");
    } catch {
      setError(t("somethingWrong"));
      setLoading(false);
    }
  }

  const canSubmit =
    street &&
    zipCode &&
    customerName.trim() &&
    customerEmail.trim() &&
    customerPassword.length >= 6;

  const inputClass =
    "w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]";
  const labelClass =
    "block text-[0.78rem] uppercase tracking-wider text-tobacco/50 mb-2";

  return (
    <div>
      {/* PROGRESS BAR */}
      <div className="flex items-center justify-center mb-10 gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-[0.85rem] font-semibold transition-colors ${
                s <= step
                  ? "bg-green text-white"
                  : "bg-tobacco/10 text-tobacco/40"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-16 h-0.5 ${
                  s < step ? "bg-green" : "bg-tobacco/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center text-[0.78rem] text-tobacco/50 uppercase tracking-wider mb-8">
        {step === 1 ? t("step1") : step === 2 ? t("step2") : t("step3")}
      </div>

      {/* STEP 1 — CHOOSE SERVICES */}
      {step === 1 && (
        <div className="space-y-6">
          <label className={labelClass}>{t("services")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {HANDYMAN_SERVICES.map((service) => {
              const Icon = ICON_MAP[service.icon] || Wrench;
              return (
                <button
                  key={service.key}
                  type="button"
                  onClick={() => toggleService(service.key)}
                  className={`border rounded-lg p-4 text-center transition-all ${
                    serviceCategories.includes(service.key)
                      ? "border-green bg-green/5 ring-2 ring-green/30"
                      : "border-tobacco/10 hover:border-green/30"
                  }`}
                >
                  <Icon className="w-7 h-7 mx-auto mb-1 text-tobacco/70" />
                  <div className="text-[0.8rem] font-medium text-tobacco">{th(service.key)}</div>
                  <div className="text-green font-semibold text-[0.75rem] mt-0.5">${getPrice(service.key)}</div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => serviceCategories.length > 0 && setStep(2)}
            disabled={serviceCategories.length === 0}
            className="w-full bg-gold text-tobacco py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t("continue")}
          </button>
        </div>
      )}

      {/* STEP 2 — SCHEDULE & DETAILS */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("preferredDate")}</label>
              <input
                type="date"
                min={minDate}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("preferredTime")}</label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={inputClass}
              >
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RUSH OPTION */}
          <button
            type="button"
            onClick={() => setRush((prev) => !prev)}
            className={`w-full border rounded-lg px-5 py-4 text-left transition-all flex items-center justify-between ${
              rush
                ? "border-amber bg-amber/10 ring-2 ring-amber/30"
                : "border-tobacco/10 hover:border-amber/30"
            }`}
          >
            <div>
              <div className="text-[0.9rem] font-semibold">{t("rushTitle")}</div>
              <div className="text-[0.78rem] text-tobacco/50 mt-0.5">{t("rushDescription")}</div>
            </div>
            <span className="text-amber font-bold text-[0.9rem] whitespace-nowrap ml-4">
              +${HANDYMAN_RUSH_FEE}
            </span>
          </button>

          {/* PROJECT DESCRIPTION */}
          <div>
            <label className={labelClass}>{t("projectDescription")}</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
              required
              placeholder={t("projectPlaceholder")}
              className={inputClass + " resize-none"}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-tobacco/20 rounded-[3px] text-[0.85rem] hover:bg-tobacco/5 transition-colors"
            >
              {t("back")}
            </button>
            <button
              type="button"
              onClick={() => scheduledDate && setStep(3)}
              disabled={!scheduledDate}
              className="flex-1 bg-gold text-tobacco py-3 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t("continue")}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — CONTACT + ADDRESS + SUMMARY */}
      {step === 3 && (
        <div className="space-y-6">
          {/* CONTACT INFO */}
          <div>
            <div className="text-[0.78rem] text-tobacco/50 uppercase tracking-wider mb-3">
              {t("contactInfo")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  {t("fullName")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t("email")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("phone")}</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(212) 555-1234"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  {t("createPassword")} <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder={t("minChars")}
                  minLength={6}
                  required
                  className={inputClass}
                />
                <p className="text-[0.72rem] text-tobacco/50 mt-1">{t("passwordHint")}</p>
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <div className="text-[0.78rem] text-tobacco/50 uppercase tracking-wider mb-3">
              {t("serviceAddress")}
            </div>
            <div>
              <label className={labelClass}>{t("streetAddress")}</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main Street"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <label className={labelClass}>{t("unitApt")}</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="#4B"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("borough")}</label>
                <select
                  value={borough}
                  onChange={(e) => setBorough(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t("select")}</option>
                  {NYC_BOROUGHS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("city")}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("zip")}</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="10001"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* BOOKING SUMMARY */}
          <div className="bg-white border border-tobacco/10 rounded-lg p-6 mt-6">
            <h3 className="font-display text-lg mb-4">{t("bookingSummary")}</h3>
            {customerName && (
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-tobacco/10">
                <div className="w-8 h-8 bg-green/10 rounded-full flex items-center justify-center text-green text-[0.8rem] font-semibold">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[0.88rem] font-medium">{customerName}</div>
                  <div className="text-[0.78rem] text-tobacco/50">{customerEmail}</div>
                </div>
              </div>
            )}
            <div className="space-y-2 text-[0.9rem]">
              <div className="text-[0.78rem] text-tobacco/50 uppercase tracking-wider mb-1">
                {t("selectedServices")}
              </div>
              {serviceCategories.map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green rounded-full" />
                    <span>{th(key)}</span>
                  </div>
                  <span className="text-tobacco/50">${getPrice(key)}</span>
                </div>
              ))}
              {rush && (
                <div className="flex justify-between text-amber mt-2 pt-2 border-t border-tobacco/10">
                  <span>{t("rush")}</span>
                  <span>+${HANDYMAN_RUSH_FEE}</span>
                </div>
              )}
              <div className="flex justify-between text-tobacco/50 text-[0.78rem] mt-2 pt-2 border-t border-tobacco/10">
                <span>Tax (7%)</span>
                <span>${pricing.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[0.95rem] mt-1 pt-2 border-t border-tobacco/10">
                <span>Estimated Total</span>
                <span className="text-green">${pricing.total.toFixed(2)}</span>
              </div>
              {scheduledDate && (
                <div className="text-tobacco/50 text-[0.85rem] mt-2 pt-2 border-t border-tobacco/10">
                  {new Date(scheduledDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  &middot; {timeSlots.find((s) => s.value === scheduledTime)?.label}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[0.85rem] px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-tobacco/20 rounded-[3px] text-[0.85rem] hover:bg-tobacco/5 transition-colors"
            >
              {t("back")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="flex-1 bg-green text-white py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t("processing") : t("submitBooking")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
