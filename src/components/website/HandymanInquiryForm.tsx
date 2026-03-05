"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { HANDYMAN_SERVICES, NYC_BOROUGHS } from "@/lib/handyman-constants";

export function HandymanInquiryForm() {
  const router = useRouter();
  const t = useTranslations("handymanForm");
  const th = useTranslations("handyman");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formLoadTime = useRef(Date.now());

  // Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [borough, setBorough] = useState("");
  const [address, setAddress] = useState("");
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");

  // Anti-bot
  const [honeypot1, setHoneypot1] = useState("");
  const [honeypot2, setHoneypot2] = useState("");
  const [jsToken, setJsToken] = useState("");

  useEffect(() => {
    setJsToken(btoa(String(Date.now())));
  }, []);

  function toggleService(key: string) {
    setServiceCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Honeypot check
    if (honeypot1 || honeypot2) return;

    // Time-based validation (must be open > 15 seconds)
    if (Date.now() - formLoadTime.current < 15000) {
      setError(t("errorTooFast"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/handyman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          borough,
          address,
          serviceCategories,
          projectDescription,
          preferredDate: preferredDate || null,
          preferredTime: preferredTime || null,
          jsToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("errorGeneric"));
        setLoading(false);
        return;
      }

      router.push("/handyman/success");
    } catch {
      setError(t("errorGeneric"));
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-tobacco/15 rounded-md px-4 py-3 text-[0.9rem] bg-white";
  const labelClass =
    "block text-[0.78rem] uppercase tracking-wider text-sand mb-1.5";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-tobacco/10 rounded-lg p-8 space-y-8"
    >
      {/* Honeypots (hidden) */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input tabIndex={-1} value={honeypot1} onChange={(e) => setHoneypot1(e.target.value)} />
        <input tabIndex={-1} value={honeypot2} onChange={(e) => setHoneypot2(e.target.value)} />
      </div>

      {/* CONTACT INFO */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t("fullName")}</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t("phone")}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("borough")}</label>
            <select value={borough} onChange={(e) => setBorough(e.target.value)} className={inputClass}>
              <option value="">{t("select")}</option>
              {NYC_BOROUGHS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>{t("address")}</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputClass} />
        </div>
      </div>

      {/* SERVICE CATEGORIES */}
      <div>
        <label className={labelClass}>{t("services")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {HANDYMAN_SERVICES.map((service) => (
            <button
              key={service.key}
              type="button"
              onClick={() => toggleService(service.key)}
              className={`border rounded-md px-3 py-2 text-[0.82rem] text-left transition-colors ${
                serviceCategories.includes(service.key)
                  ? "border-green bg-green/5"
                  : "border-tobacco/10"
              }`}
            >
              {th(service.key)}
            </button>
          ))}
        </div>
      </div>

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

      {/* SCHEDULING */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t("preferredDate")}</label>
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("preferredTime")}</label>
          <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className={inputClass}>
            <option value="">{t("select")}</option>
            <option value="morning">{t("timeMorning")}</option>
            <option value="afternoon">{t("timeAfternoon")}</option>
            <option value="evening">{t("timeEvening")}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-[0.85rem] bg-red-50 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green text-white py-4 text-[0.9rem] font-semibold tracking-[0.06em] uppercase rounded-[3px] hover:bg-green/90 disabled:opacity-50 transition-colors"
      >
        {loading ? t("submitting") : t("submitQuote")}
      </button>
    </form>
  );
}
