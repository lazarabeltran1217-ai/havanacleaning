"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, Zap, MapPin } from "lucide-react";
import {
  Wrench, Package, Tv, DoorOpen, Lightbulb, Grid3x3,
  Paintbrush, Droplets, Waves, Wifi, Fence, LayoutGrid,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HANDYMAN_SERVICES, NYC_BOROUGHS } from "@/lib/handyman-constants";
import { useTranslations } from "next-intl";

const ICON_MAP: Record<string, LucideIcon> = {
  Wrench, Package, Tv, DoorOpen, Lightbulb, Grid3x3,
  Paintbrush, Droplets, Waves, Wifi, Fence, LayoutGrid,
};

const INNER_BORDER = "border-gray-200 dark:border-gold/15";
const INNER_BG = "bg-gray-50 dark:bg-[#2f1f14]";
const TEXT_PRIMARY = "text-tobacco dark:text-cream";
const TEXT_MUTED = "text-gray-500 dark:text-sand/70";
const INPUT_CLS =
  "w-full px-3 py-2.5 border border-gray-300 dark:border-gold/20 rounded-lg text-sm bg-white dark:bg-[#2f1f14] text-tobacco dark:text-cream placeholder:text-gray-400 dark:placeholder:text-sand/40 focus:outline-none focus:ring-2 focus:ring-gold/30";
const LABEL_CLS = "block text-[0.72rem] font-medium uppercase tracking-wider mb-1.5";

const RUSH_FEE = 50;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function PortalHandymanWizard({ onClose, onSuccess }: Props) {
  const t = useTranslations("handymanBooking");
  const th = useTranslations("handyman");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Services
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);

  // Step 2 — Schedule
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("morning");
  const [rush, setRush] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");

  // Step 3 — Address
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("New York");
  const [borough, setBorough] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Anti-bot
  const [jsToken, setJsToken] = useState("");
  useEffect(() => { setJsToken(btoa(String(Date.now()))); }, []);

  function toggleService(key: string) {
    setServiceCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  // Min date
  const etNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const etMinDay = new Date(etNow.getFullYear(), etNow.getMonth(), etNow.getDate() + (rush ? 0 : 1));
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
          fullName: "__FROM_SESSION__",
          email: "__FROM_SESSION__",
          phone: "",
          borough,
          address: [street, unit].filter(Boolean).join(", ") + `, ${city}, NY ${zipCode}`,
          serviceCategories,
          projectDescription,
          preferredDate: scheduledDate || null,
          preferredTime: scheduledTime || null,
          rush,
          jsToken,
          fromPortal: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("failedCreate"));
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError(t("somethingWrong"));
      setLoading(false);
    }
  }

  const canSubmit = street && zipCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#382618] rounded-2xl border border-gray-200 dark:border-gold/15 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${INNER_BORDER}`}>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className={`${TEXT_MUTED} hover:text-gold transition-colors`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className={`font-display text-lg ${TEXT_PRIMARY}`}>
              {step === 1 ? t("step1") : step === 2 ? t("step2") : t("step3")}
            </h3>
          </div>
          <button onClick={onClose} className={`${TEXT_MUTED} hover:text-tobacco dark:hover:text-cream`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 py-4 px-5">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.8rem] font-semibold transition-colors ${s <= step ? "bg-green text-white" : `${INNER_BG} ${TEXT_MUTED}`}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-gold" : "bg-gray-200 dark:bg-gold/20"}`} />}
            </div>
          ))}
        </div>

        <div className="p-5 pt-0">
          {/* STEP 1 — SERVICES */}
          {step === 1 && (
            <div className="space-y-5">
              <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("services")}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {HANDYMAN_SERVICES.map((service) => {
                  const Icon = ICON_MAP[service.icon] || Wrench;
                  return (
                    <button
                      key={service.key}
                      type="button"
                      onClick={() => toggleService(service.key)}
                      className={`border rounded-xl p-3 text-center transition-all ${
                        serviceCategories.includes(service.key)
                          ? "border-gold bg-gold/10 ring-2 ring-gold/30"
                          : `${INNER_BORDER} hover:border-gold/30`
                      }`}
                    >
                      <Icon className={`w-7 h-7 mx-auto mb-1 ${TEXT_MUTED}`} />
                      <div className={`text-[0.78rem] font-medium ${TEXT_PRIMARY}`}>{th(service.key)}</div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => serviceCategories.length > 0 && setStep(2)}
                disabled={serviceCategories.length === 0}
                className="w-full bg-green text-white py-3.5 text-[0.88rem] font-semibold tracking-[0.06em] uppercase rounded-xl hover:bg-green-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t("continue")}
              </button>
            </div>
          )}

          {/* STEP 2 — SCHEDULE & DETAILS */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("preferredDate")}</label>
                  <input type="date" min={minDate} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("preferredTime")}</label>
                  <select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className={INPUT_CLS}>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rush */}
              <button
                type="button"
                onClick={() => setRush((prev) => !prev)}
                className={`w-full border rounded-xl px-4 py-3 text-left transition-all flex items-center justify-between ${
                  rush
                    ? "border-amber bg-amber/10 ring-2 ring-amber/30"
                    : `${INNER_BORDER} hover:border-amber/30`
                }`}
              >
                <div>
                  <div className={`text-[0.85rem] font-semibold ${TEXT_PRIMARY} flex items-center gap-1.5`}>
                    <Zap className="w-4 h-4 text-amber" /> {t("rushTitle")}
                  </div>
                  <div className={`text-[0.72rem] ${TEXT_MUTED} mt-0.5`}>{t("rushDescription")}</div>
                </div>
                <span className="text-amber font-bold text-[0.88rem] whitespace-nowrap ml-4">+${RUSH_FEE}</span>
              </button>

              {/* Description */}
              <div>
                <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("projectDescription")}</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={3}
                  placeholder={t("projectPlaceholder")}
                  className={`${INPUT_CLS} resize-none`}
                />
              </div>

              <button
                type="button"
                onClick={() => scheduledDate && setStep(3)}
                disabled={!scheduledDate}
                className="w-full bg-green text-white py-3.5 text-[0.88rem] font-semibold tracking-[0.06em] uppercase rounded-xl hover:bg-green-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t("continue")}
              </button>
            </div>
          )}

          {/* STEP 3 — ADDRESS & REVIEW */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("serviceAddress")}</label>
                <div className="space-y-3">
                  <div>
                    <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("streetAddress")}</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main Street" className={INPUT_CLS} />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("unitApt")}</label>
                      <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="#4B" className={INPUT_CLS} />
                    </div>
                    <div>
                      <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("borough")}</label>
                      <select value={borough} onChange={(e) => setBorough(e.target.value)} className={INPUT_CLS}>
                        <option value="">{t("select")}</option>
                        {NYC_BOROUGHS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("city")}</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={INPUT_CLS} />
                    </div>
                    <div>
                      <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("zip")}</label>
                      <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="10001" className={INPUT_CLS} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className={`${INNER_BG} rounded-xl p-4`}>
                <h4 className={`font-display text-[0.95rem] ${TEXT_PRIMARY} mb-3`}>{t("bookingSummary")}</h4>
                <div className="space-y-2 text-[0.85rem]">
                  <div className={`text-[0.72rem] ${TEXT_MUTED} uppercase tracking-wider mb-1`}>{t("selectedServices")}</div>
                  {serviceCategories.map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green rounded-full" />
                      <span className={TEXT_PRIMARY}>{th(key)}</span>
                    </div>
                  ))}
                  {rush && (
                    <div className="flex justify-between text-amber mt-2 pt-2 border-t border-gray-200 dark:border-gold/15">
                      <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {t("rush")}</span>
                      <span>+${RUSH_FEE}</span>
                    </div>
                  )}
                  {scheduledDate && (
                    <div className={`${TEXT_MUTED} text-[0.82rem] mt-2 pt-2 border-t border-gray-200 dark:border-gold/15`}>
                      {new Date(scheduledDate + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "long", month: "long", day: "numeric",
                      })}{" "}
                      &middot; {timeSlots.find((s) => s.value === scheduledTime)?.label}
                    </div>
                  )}
                  {street && (
                    <div className={`${TEXT_MUTED} text-[0.82rem] flex items-start gap-1`}>
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {street}{unit && ` ${unit}`}, {city}, NY {zipCode}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red/10 border border-red/30 text-red text-[0.82rem] px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="w-full bg-green text-white py-3.5 text-[0.88rem] font-semibold tracking-[0.06em] uppercase rounded-xl hover:bg-green-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t("processing") : t("submitBooking")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
