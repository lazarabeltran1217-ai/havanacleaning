"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { TIME_SLOTS } from "@/lib/constants";
import { ServiceIcon } from "@/lib/service-icons";

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

interface Props {
  services: ServiceOption[];
  addOns: AddOnOption[];
}

type RecurrenceType = "ONCE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";

const RECURRENCE_DISCOUNT: Record<RecurrenceType, number> = {
  ONCE: 0,
  WEEKLY: 0.2,
  BIWEEKLY: 0.15,
  MONTHLY: 0.1,
};

const RUSH_FEE = 50;

export function BookingWizard({ services, addOns }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedSlug = searchParams.get("service");
  const preselected = services.find((s) => s.slug === preselectedSlug);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Service selection (multi-select)
  const [serviceIds, setServiceIds] = useState<string[]>(preselected ? [preselected.id] : []);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [recurrence, setRecurrence] = useState<RecurrenceType>("ONCE");

  // Step 2 — Date, time, add-ons, notes
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("morning");
  const [rush, setRush] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Step 3 — Contact info + Address
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("Miami");
  const [state] = useState("FL");
  const [zipCode, setZipCode] = useState("");

  // Price calculation (supports multiple selected services)
  const selectedServices = services.filter((s) => serviceIds.includes(s.id));
  const serviceCalc = (s: ServiceOption) =>
    Math.max(0, s.basePrice + (bedrooms - 2) * s.pricePerBedroom + (bathrooms - 2) * s.pricePerBathroom);
  const servicesPrice = selectedServices.reduce((sum, s) => sum + serviceCalc(s), 0);
  const addOnsTotal = addOns
    .filter((a) => selectedAddOns.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const discountRate = RECURRENCE_DISCOUNT[recurrence];
  const rushCharge = rush ? RUSH_FEE : 0;
  const subtotal = servicesPrice + addOnsTotal + rushCharge;
  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const afterDiscount = subtotal - discount;
  const tax = Math.round(afterDiscount * 0.07 * 100) / 100;
  const total = Math.round((afterDiscount + tax) * 100) / 100;

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

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

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceIds,
          bedrooms,
          bathrooms,
          recurrence,
          rush,
          scheduledDate,
          scheduledTime,
          addOnIds: selectedAddOns,
          customerNotes: notes,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          customerPassword: customerPassword || undefined,
          address: { street, unit, city, state, zipCode },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create booking");
        setLoading(false);
        return;
      }

      const ids = data.bookings
        ? data.bookings.map((b: { id: string }) => b.id).join(",")
        : data.booking.id;
      router.push(`/book/confirm?bookingId=${ids}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const canSubmit =
    street &&
    zipCode &&
    customerName.trim() &&
    customerEmail.trim() &&
    customerPassword.length >= 6;

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

      <div className="text-center text-[0.78rem] text-sand uppercase tracking-wider mb-8">
        {step === 1
          ? "Choose Service"
          : step === 2
            ? "Schedule & Add-Ons"
            : "Your Info & Address"}
      </div>

      {/* STEP 1 — SERVICE */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServiceIds((prev) => prev.includes(s.id) ? prev.filter((sid) => sid !== s.id) : [...prev, s.id])}
                className={`border rounded-lg p-4 text-center transition-all ${
                  serviceIds.includes(s.id)
                    ? "border-green bg-green/5 ring-2 ring-green/30"
                    : "border-tobacco/10 hover:border-green/30"
                }`}
              >
                <ServiceIcon
                  emoji={s.icon}
                  className="w-7 h-7 mx-auto mb-1 text-tobacco/60"
                />
                <div className="text-[0.8rem] font-medium">{s.name}</div>
                <div className="text-amber text-[0.75rem] mt-1">
                  {s.basePrice > 0
                    ? formatCurrency(
                        Math.max(
                          0,
                          s.basePrice +
                            (bedrooms - 2) * s.pricePerBedroom +
                            (bathrooms - 2) * s.pricePerBathroom
                        )
                      )
                    : "Quote"}
                </div>
              </button>
            ))}
          </div>

          {/* Bed/Bath */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value))}
                className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Bedroom" : "Bedrooms"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                Bathrooms
              </label>
              <select
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value))}
                className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Bathroom" : "Bathrooms"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
              How Often?
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(
                [
                  { value: "ONCE", label: "One-Time" },
                  { value: "WEEKLY", label: "Weekly", discount: "20% off" },
                  {
                    value: "BIWEEKLY",
                    label: "Bi-Weekly",
                    discount: "15% off",
                  },
                  { value: "MONTHLY", label: "Monthly", discount: "10% off" },
                ] as const
              ).map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRecurrence(r.value)}
                  className={`border rounded-lg py-3 px-2 text-center transition-all text-[0.82rem] ${
                    recurrence === r.value
                      ? "border-green bg-green/5 ring-2 ring-green/30"
                      : "border-tobacco/10 hover:border-green/30"
                  }`}
                >
                  <div className="font-medium">{r.label}</div>
                  {"discount" in r && (
                    <div className="text-green text-[0.72rem] mt-0.5">
                      {r.discount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => serviceIds.length > 0 && setStep(2)}
            disabled={serviceIds.length === 0}
            className="w-full bg-gold text-tobacco py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2 — SCHEDULE & ADD-ONS */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                min={minDate}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
              />
            </div>
            <div>
              <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                Preferred Time
              </label>
              <select
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
              >
                {TIME_SLOTS.map((slot) => (
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
              <div className="text-[0.9rem] font-semibold">
                Rush / Same-Day Service
              </div>
              <div className="text-[0.78rem] text-sand mt-0.5">
                Need it done today or ASAP? We&apos;ll prioritize your booking.
              </div>
            </div>
            <span className="text-amber font-bold text-[0.9rem] whitespace-nowrap ml-4">
              +{formatCurrency(RUSH_FEE)}
            </span>
          </button>

          {/* ADD-ONS */}
          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-3">
              Add-On Services (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {addOns.map((addon) => (
                <button
                  key={addon.id}
                  type="button"
                  onClick={() => toggleAddOn(addon.id)}
                  className={`border rounded-md px-4 py-3 text-left transition-all text-[0.85rem] flex items-center justify-between ${
                    selectedAddOns.includes(addon.id)
                      ? "border-green bg-green/5"
                      : "border-tobacco/10 hover:border-green/30"
                  }`}
                >
                  <span>{addon.name}</span>
                  <span className="text-amber font-medium text-[0.8rem]">
                    +{formatCurrency(addon.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
              Special Instructions (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Gate code, parking info, pet details, areas to focus on..."
              className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-tobacco/20 rounded-[3px] text-[0.85rem] hover:bg-tobacco/5 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => scheduledDate && setStep(3)}
              disabled={!scheduledDate}
              className="flex-1 bg-gold text-tobacco py-3 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-amber disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — CONTACT + ADDRESS + REVIEW */}
      {step === 3 && (
        <div className="space-y-6">
          {/* CONTACT INFO */}
          <div>
            <div className="text-[0.78rem] text-sand uppercase tracking-wider mb-3">
              Your Contact Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
                />
              </div>
              <div>
                <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
                />
              </div>
              <div>
                <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(305) 555-1234"
                  className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
                />
              </div>
              <div>
                <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  Create Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={customerPassword}
                  onChange={(e) => setCustomerPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                  className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
                />
                <p className="text-[0.72rem] text-sand mt-1">
                  Use this to log in and track your bookings
                </p>
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          <div>
            <div className="text-[0.78rem] text-sand uppercase tracking-wider mb-3">
              Service Address
            </div>
            <div>
              <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Main Street"
                className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  Unit/Apt
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="#201"
                  className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
                />
              </div>
              <div>
                <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
                />
              </div>
              <div>
                <label className="block text-[0.78rem] uppercase tracking-wider text-sand mb-2">
                  ZIP
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="33130"
                  className="w-full border border-tobacco/15 rounded-md px-4 py-3 bg-white text-[0.9rem]"
                />
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-white border border-tobacco/10 rounded-lg p-6 mt-6">
            <h3 className="font-display text-lg mb-4">Order Summary</h3>
            {customerName && (
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-tobacco/10">
                <div className="w-8 h-8 bg-green/10 rounded-full flex items-center justify-center text-green text-[0.8rem] font-semibold">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[0.88rem] font-medium">
                    {customerName}
                  </div>
                  <div className="text-[0.78rem] text-sand">
                    {customerEmail}
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2 text-[0.9rem]">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between">
                  <span>
                    {s.name} ({bedrooms} bed / {bathrooms} bath)
                  </span>
                  <span>{formatCurrency(serviceCalc(s))}</span>
                </div>
              ))}
              {addOns
                .filter((a) => selectedAddOns.includes(a.id))
                .map((a) => (
                  <div key={a.id} className="flex justify-between text-sand">
                    <span>+ {a.name}</span>
                    <span>{formatCurrency(a.price)}</span>
                  </div>
                ))}
              {rush && (
                <div className="flex justify-between text-amber">
                  <span>Rush / Same-Day</span>
                  <span>+{formatCurrency(RUSH_FEE)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-green">
                  <span>
                    Recurring Discount ({Math.round(discountRate * 100)}%)
                  </span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sand">
                <span>Tax (7%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-tobacco/10">
                <span>Total</span>
                <span className="text-green">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red/10 border border-red/30 text-red text-[0.85rem] px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-tobacco/20 rounded-[3px] text-[0.85rem] hover:bg-tobacco/5 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="flex-1 bg-green text-white py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Submit Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
