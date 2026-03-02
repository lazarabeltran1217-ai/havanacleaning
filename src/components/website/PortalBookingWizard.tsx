"use client";

import { useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import { ServiceIcon } from "@/lib/service-icons";
import { TIME_SLOTS } from "@/lib/constants";
import { useTranslations } from "next-intl";

/* ─── Card constants (light / dark) ─── */
const INNER_BORDER = "border-gray-200 dark:border-gold/15";
const INNER_BG = "bg-gray-50 dark:bg-[#2f1f14]";
const TEXT_PRIMARY = "text-tobacco dark:text-cream";
const TEXT_MUTED = "text-gray-500 dark:text-sand/70";
const INPUT_CLS =
  "w-full px-3 py-2.5 border border-gray-300 dark:border-gold/20 rounded-lg text-sm bg-white dark:bg-[#2f1f14] text-tobacco dark:text-cream placeholder:text-gray-400 dark:placeholder:text-sand/40 focus:outline-none focus:ring-2 focus:ring-gold/30";
const LABEL_CLS = "block text-[0.72rem] font-medium uppercase tracking-wider mb-1.5";

interface ServiceOption {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  basePrice: number;
  pricePerBedroom: number;
  pricePerBathroom: number;
  estimatedHours: number;
}

interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

interface AddressOption {
  id: string;
  label: string;
  street: string;
  unit: string | null;
  city: string;
  state: string;
  zipCode: string;
}

interface Props {
  services: ServiceOption[];
  addOns: AddOnOption[];
  addresses: AddressOption[];
  locale?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type RecurrenceType = "ONCE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";

const RECURRENCE_DISCOUNT: Record<RecurrenceType, number> = {
  ONCE: 0,
  WEEKLY: 0.2,
  BIWEEKLY: 0.15,
  MONTHLY: 0.1,
};

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

export function PortalBookingWizard({ services, addOns, addresses, locale = "en", onClose, onSuccess }: Props) {
  const t = useTranslations("account");
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [serviceId, setServiceId] = useState("");
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [recurrence, setRecurrence] = useState<RecurrenceType>("ONCE");

  // Step 2
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("morning");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Step 3
  const [addressId, setAddressId] = useState(addresses[0]?.id || "");
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
  const [newStreet, setNewStreet] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newCity, setNewCity] = useState("Miami");
  const [newZip, setNewZip] = useState("");

  // Price calculation
  const selectedService = services.find((s) => s.id === serviceId);
  const servicePrice = selectedService
    ? Math.max(0, selectedService.basePrice + (bedrooms - 2) * selectedService.pricePerBedroom + (bathrooms - 2) * selectedService.pricePerBathroom)
    : 0;
  const addOnsTotal = addOns.filter((a) => selectedAddOns.includes(a.id)).reduce((sum, a) => sum + a.price, 0);
  const discountRate = RECURRENCE_DISCOUNT[recurrence];
  const subtotal = servicePrice + addOnsTotal;
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const afterDiscount = subtotal - discount;
  const tax = Math.round(afterDiscount * 0.07 * 100) / 100;
  const total = Math.round((afterDiscount + tax) * 100) / 100;

  // Tomorrow's date as minimum (Eastern Time)
  const etNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  const etTomorrow = new Date(etNow.getFullYear(), etNow.getMonth(), etNow.getDate() + 1);
  const minDate = `${etTomorrow.getFullYear()}-${String(etTomorrow.getMonth() + 1).padStart(2, "0")}-${String(etTomorrow.getDate()).padStart(2, "0")}`;

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        serviceId,
        bedrooms,
        bathrooms,
        recurrence,
        scheduledDate,
        scheduledTime,
        addOnIds: selectedAddOns,
        customerNotes: notes,
      };

      if (useNewAddress) {
        body.newAddress = { street: newStreet, unit: newUnit, city: newCity, state: "FL", zipCode: newZip };
      } else {
        body.addressId = addressId;
      }

      const res = await fetch("/api/account/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create booking");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError(t("somethingWrong"));
      setLoading(false);
    }
  }

  const canSubmit = useNewAddress ? !!(newStreet && newZip) : !!addressId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
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
              {step === 1 ? t("wizard_step1") : step === 2 ? t("wizard_step2") : t("wizard_step3")}
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
          {/* ═══ STEP 1 — SERVICE ═══ */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServiceId(s.id)}
                    className={`border rounded-xl p-3 text-center transition-all ${serviceId === s.id ? "border-gold bg-gold/10 ring-2 ring-gold/30" : `${INNER_BORDER} hover:border-gold/30`}`}
                  >
                    <ServiceIcon emoji={s.icon} className={`w-7 h-7 mx-auto mb-1 ${TEXT_MUTED}`} />
                    <div className={`text-[0.78rem] font-medium ${TEXT_PRIMARY}`}>{s.name}</div>
                    <div className="text-amber text-[0.72rem] mt-0.5">
                      {s.basePrice > 0 ? fmtCurrency(Math.max(0, s.basePrice + (bedrooms - 2) * s.pricePerBedroom + (bathrooms - 2) * s.pricePerBathroom)) : t("quote")}
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("bedrooms")}</label>
                  <select value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className={INPUT_CLS}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? t("bedroom_singular") : t("bedrooms_plural")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("bathrooms")}</label>
                  <select value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} className={INPUT_CLS}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? t("bathroom_singular") : t("bathrooms_plural")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("howOften")}</label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { value: "ONCE", labelKey: "oneTime" },
                    { value: "WEEKLY", labelKey: "weekly", discountKey: "discount_weekly" },
                    { value: "BIWEEKLY", labelKey: "biWeekly", discountKey: "discount_biweekly" },
                    { value: "MONTHLY", labelKey: "monthly", discountKey: "discount_monthly" },
                  ] as const).map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRecurrence(r.value)}
                      className={`border rounded-xl py-2.5 px-2 text-center transition-all text-[0.78rem] ${recurrence === r.value ? "border-gold bg-gold/10 ring-2 ring-gold/30" : `${INNER_BORDER} hover:border-gold/30`}`}
                    >
                      <div className={`font-medium ${TEXT_PRIMARY}`}>{t(r.labelKey)}</div>
                      {"discountKey" in r && <div className="text-gold text-[0.68rem] mt-0.5">{t(r.discountKey)}</div>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => serviceId && setStep(2)}
                disabled={!serviceId}
                className="w-full bg-green text-white py-3.5 text-[0.88rem] font-semibold tracking-[0.06em] uppercase rounded-xl hover:bg-green-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t("continue")}
              </button>
            </div>
          )}

          {/* ═══ STEP 2 — SCHEDULE & ADD-ONS ═══ */}
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
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {addOns.length > 0 && (
                <div>
                  <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("addOnServices")}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {addOns.map((addon) => (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddOn(addon.id)}
                        className={`border rounded-xl px-3 py-2.5 text-left transition-all text-[0.82rem] flex items-center justify-between ${selectedAddOns.includes(addon.id) ? "border-gold bg-gold/10" : `${INNER_BORDER} hover:border-gold/30`}`}
                      >
                        <span className={TEXT_PRIMARY}>{addon.name}</span>
                        <span className="text-amber font-medium text-[0.78rem]">+{fmtCurrency(addon.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("specialInstructions")}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={t("instructionsPlaceholder")}
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

          {/* ═══ STEP 3 — ADDRESS & REVIEW ═══ */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Address selection */}
              <div>
                <label className={`${LABEL_CLS} ${TEXT_MUTED}`}>{t("serviceAddress")}</label>
                {addresses.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => { setAddressId(addr.id); setUseNewAddress(false); }}
                        className={`w-full border rounded-xl px-3 py-2.5 text-left transition-all ${!useNewAddress && addressId === addr.id ? "border-gold bg-gold/10 ring-2 ring-gold/30" : `${INNER_BORDER} hover:border-gold/30`}`}
                      >
                        <div className={`font-medium text-[0.82rem] ${TEXT_PRIMARY}`}>{addr.label}</div>
                        <div className="text-gray-500 dark:text-sand/60 text-[0.72rem]">
                          {addr.street}{addr.unit && ` ${addr.unit}`}, {addr.city}, {addr.state} {addr.zipCode}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUseNewAddress(!useNewAddress)}
                      className="text-gold text-[0.78rem] font-semibold hover:underline"
                    >
                      {useNewAddress ? t("useSaved") : t("useNew")}
                    </button>
                  </div>
                )}

                {useNewAddress && (
                  <div className={`border ${INNER_BORDER} rounded-xl p-3 space-y-2`}>
                    <div>
                      <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("street")}</label>
                      <input type="text" value={newStreet} onChange={(e) => setNewStreet(e.target.value)} placeholder="123 Main Street" className={INPUT_CLS} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("unit")}</label>
                        <input type="text" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="#201" className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("city")}</label>
                        <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)} className={INPUT_CLS} />
                      </div>
                      <div>
                        <label className={`text-[0.65rem] font-medium ${TEXT_MUTED} block mb-0.5`}>{t("zip")}</label>
                        <input type="text" value={newZip} onChange={(e) => setNewZip(e.target.value)} placeholder="33130" className={INPUT_CLS} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className={`${INNER_BG} rounded-xl p-4`}>
                <h4 className={`font-display text-[0.95rem] ${TEXT_PRIMARY} mb-3`}>{t("orderSummary")}</h4>
                <div className="space-y-2 text-[0.85rem]">
                  <div className="flex justify-between">
                    <span className={TEXT_PRIMARY}>
                      {selectedService?.name} ({bedrooms} {t("bed")} / {bathrooms} {t("bath")})
                    </span>
                    <span className={TEXT_PRIMARY}>{fmtCurrency(servicePrice)}</span>
                  </div>
                  {addOns.filter((a) => selectedAddOns.includes(a.id)).map((a) => (
                    <div key={a.id} className="flex justify-between">
                      <span className={TEXT_MUTED}>+ {a.name}</span>
                      <span className={TEXT_MUTED}>{fmtCurrency(a.price)}</span>
                    </div>
                  ))}
                  {discount > 0 && (
                    <div className="flex justify-between text-gold">
                      <span>{t("recurringDiscount", { percent: Math.round(discountRate * 100) })}</span>
                      <span>-{fmtCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className={TEXT_MUTED}>{t("tax")}</span>
                    <span className={TEXT_MUTED}>{fmtCurrency(tax)}</span>
                  </div>
                  <div className={`flex justify-between font-semibold text-lg pt-3 border-t ${INNER_BORDER}`}>
                    <span className={TEXT_PRIMARY}>{t("total")}</span>
                    <span className="text-gold">{fmtCurrency(total)}</span>
                  </div>
                </div>

                <div className="mt-3 text-gray-500 dark:text-sand/60 text-[0.72rem] space-y-0.5">
                  <div>{scheduledDate && new Date(scheduledDate + "T12:00:00").toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} &middot; <span className="capitalize">{scheduledTime}</span></div>
                  {!useNewAddress && addresses.find((a) => a.id === addressId) && (
                    <div>{addresses.find((a) => a.id === addressId)!.street}, {addresses.find((a) => a.id === addressId)!.city}</div>
                  )}
                  {useNewAddress && newStreet && <div>{newStreet}, {newCity}</div>}
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
